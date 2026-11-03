// Tests for the money and advice rules in logic.ts. Run with: npm test
// These are the numbers the team acts on (payouts, profit, stock, "take a bin back"), so a change that moves them should fail here first.
import { describe, expect, it } from "vitest";
import { breakEven, byVenue, checkSetting, collectionDays, dieselOf, godownOn, period, pickupCost, saleMoney, salePrices, saleTransport, staffDue, totals, venueStats } from "./logic";
import type { Pickup, Sale, Settings, Venue } from "./logic";

const set = { ubcRate: 210, cansPerKg: 65, plasticSale: 40, canRate: 1.5, plasticBuy: 18, add: 310, pull: 90, grace: 14, vehCap: null, capSteel: 150, capPl: 150, routeHours: 4.5, stopMin: 15, traffic: 50, depart: "11:00", goLive: null } as Settings;
const venue = (o: Partial<Venue> = {}) => ({ id: 1, name: "V", type: null, status: "Active", area: null, area_est: false, steel: 2, plastic_bins: 0, bags: false, promised: 0, can_rate: 1.5, plastic_rate: null,
  added: "2026-08-01", added_est: false, bin_since: "2026-08-01", bin_est: false, lat: null, lng: null, pin_src: null, pin_by: null, g_name: null, contact: null, phone: null, terms: "On the spot", upi: null,
  opening: null, keep_until: null, skip_give: null, cut_on: null, deleted: false, brought_by: null, visit: null, created_by: "t", updated_by: null, ...o }) as Venue;
let nextId = 1;
const pickup = (o: Partial<Pickup> = {}) => ({ id: nextId++, d: "2026-09-10", venue_id: 1, cans: 100, plastic_kg: 0, src: "Bin", staff: "", fill: "", trip: "", deleted: false, created_at: "", created_by: "t", updated_by: null, ...o }) as Pickup;
const sale = (o: Partial<Sale> = {}) => ({ id: nextId++, code: "S-1", d: "2026-10-01", buyer: "B", material: "UBC", kg: 100, rate: 200, transport: 0, gst_rate: null, paid_on: null, deleted: false, created_by: "t", updated_by: null, created_at: "", ...o }) as Sale;

describe("settings checks", () => {
  it("refuses values that would break the money screens", () => {
    expect(checkSetting("cansPerKg", 0)).toMatch(/more than 0/);
    expect(checkSetting("cansPerKg", null)).toMatch(/can't be empty/);
    expect(checkSetting("ubcRate", -5)).toMatch(/more than 0/);
    expect(checkSetting("gstUBC", 150)).toMatch(/more than 100/);
    expect(checkSetting("routeDays", 4.5)).toMatch(/whole number/);
  });
  it("accepts normal values and the ones that may be left empty", () => {
    expect(checkSetting("cansPerKg", 65)).toBeNull();
    expect(checkSetting("plasticSale", null)).toBeNull();
    expect(checkSetting("dieselDay", null)).toBeNull();
    expect(checkSetting("depart", "09:00")).toBeNull(); // not a number setting, no rule
  });
});

describe("what a pickup costs", () => {
  const vm = new Map([[1, venue({ can_rate: 2 })], [2, venue({ id: 2, plastic_rate: 20 })]]);
  it("pays cans at the venue's rate and plastic at the default when the venue has none", () => {
    expect(pickupCost({ venue_id: 1, cans: 100, plastic_kg: 5 }, vm, set)).toBe(100 * 2 + 5 * 18);
  });
  it("plastic rate: the one kept on the pickup beats the venue's, which beats the default", () => {
    expect(pickupCost({ venue_id: 2, cans: 0, plastic_kg: 10 }, vm, set)).toBe(10 * 20);
    expect(pickupCost({ venue_id: 2, cans: 0, plastic_kg: 10, plastic_rate: 15 }, vm, set)).toBe(10 * 15);
  });
  it("a household pickup from the app uses the payout the app paid", () => {
    expect(pickupCost({ venue_id: null, cans: 50, plastic_kg: 0, app_payout: 80 }, vm, set)).toBe(80);
    expect(pickupCost({ venue_id: null, cans: 50, plastic_kg: 0 }, vm, set)).toBe(50 * 1.5);
  });
});

describe("sales", () => {
  it("GST: a sale keeps its own rate; an old sale with none follows Settings", () => {
    const s = { ...set, gstUBC: 18 } as Settings;
    expect(saleMoney(sale({ kg: 100, rate: 200, gst_rate: 5 }), s)).toMatchObject({ taxable: 20000, pct: 5, gst: 1000, total: 21000 });
    expect(saleMoney(sale({ kg: 100, rate: 200, gst_rate: null }), s)).toMatchObject({ pct: 18, gst: 3600, total: 23600 });
    expect(saleMoney(sale({ kg: 100, rate: 200 }), set)).toMatchObject({ pct: 0, gst: 0, total: 20000 });
  });
  it("the price used is the latest real sale of each material, deleted sales ignored; Settings until one exists", () => {
    expect(salePrices([], set)).toMatchObject({ ubc: 210, pl: 40 });
    const sales = [sale({ d: "2026-10-01", rate: 200 }), sale({ d: "2026-10-15", rate: 213 }), sale({ d: "2026-10-20", rate: 999, deleted: true }), sale({ material: "Plastic", rate: 33 })];
    expect(salePrices(sales, set)).toMatchObject({ ubc: 213, pl: 33 });
  });
  it("transport on sales is counted for the sales dated inside the period only", () => {
    const sales = [sale({ d: "2026-10-05", transport: 500 }), sale({ d: "2026-09-30", transport: 700 }), sale({ d: "2026-10-06", transport: 300, deleted: true })];
    expect(saleTransport(sales, period("2026-10", "2026-10-28"))).toBe(500);
  });
});

describe("the godown", () => {
  it("collected minus sold, a sale removing kg × cans per kg", () => {
    const g = godownOn([pickup({ cans: 6500, plastic_kg: 12 }), pickup({ cans: 100, deleted: true })], [sale({ kg: 10 }), sale({ material: "Plastic", kg: 4 })], set, null, null);
    expect(g).toMatchObject({ cansIn: 6500, cansOut: 650, cans: 5850, plIn: 12, plOut: 4, pl: 8 });
  });
  it("respects the date range", () => {
    const ps = [pickup({ d: "2026-09-30", cans: 10 }), pickup({ d: "2026-10-01", cans: 20 })];
    expect(godownOn(ps, [], set, "2026-10-01", "2026-10-31").cansIn).toBe(20);
  });
});

describe("staff pay", () => {
  it("salary ÷ 30 × days present, minus advances and what was already paid", () => {
    const st = { id: 1, name: "A", salary: 30000, active: true };
    const marks = [{ d: "2026-10-01", staff_id: 1, mark: "P" as const }, { d: "2026-10-02", staff_id: 1, mark: "H" as const }];
    const r = staffDue(st, "2026-10", marks, [{ id: 1, d: "2026-10-03", staff_id: 1, amount: 200, note: "", deleted: false, created_by: "", updated_by: null, created_at: "" }], []);
    expect(r).toMatchObject({ days: 1.5, earned: 1500, adv: 200, paid: 0, pay: 1300 });
  });
  it("no salary set means no amount", () => {
    expect(staffDue({ id: 2, name: "B", salary: null, active: true }, "2026-10", [], [], []).pay).toBeNull();
  });
});

describe("collection days and diesel", () => {
  it("each date with venue pickups is one day at the default diesel; a trip with real fuel replaces it", () => {
    const ps = [pickup({ d: "2026-10-05" }), pickup({ d: "2026-10-05", venue_id: 2 }), pickup({ d: "2026-10-06" }), pickup({ d: "2026-10-07", venue_id: null, src: "App" })];
    expect(dieselOf(collectionDays(ps, [], set))).toBe(800); // two venue days; the app-only day doesn't count
    const trip = { id: 1, code: "T", d: "2026-10-06", vehicle: "v", driver: "", km_start: 0, km_end: 10, stops: 1, fuel_l: 4, fuel_cost: 350, other_cost: 0, cans: 0, route: null, plan_min: null, act_min: null, deleted: false, created_by: "", updated_by: null, created_at: "" };
    expect(dieselOf(collectionDays(ps, [trip as never], set))).toBe(400 + 350);
  });
});

describe("break-even", () => {
  it("cans needed = costs ÷ what a can earns after the venue is paid", () => {
    const ps = [pickup({ d: "2026-10-05", cans: 6500 })];
    const p = period("2026-10", "2026-10-28"), T = totals(p, ps, new Map([[1, venue()]]), set);
    const b = breakEven(p, T, set, { salaries: 0, running: 0 });
    const perCan = 210 / 65 - 1.5; // sale value of a can minus the payout
    expect(b.perCan).toBeCloseTo(perCan, 5);
    expect(breakEven(p, T, { ...set, fixedOther: 15000 } as Settings, { salaries: 85000, running: 5000 }).need).toBe(Math.ceil(105000 / perCan));
  });
});

describe("venue advice early in a month", () => {
  const today1 = "2026-10-01", today15 = "2026-10-15";
  const stats = (ps: Pickup[], today: string) => venueStats(venue(), period(today.slice(0, 7), today), byVenue(ps).get(1) ?? [], set, today);
  it("keeps last month's advice before the 15th instead of calling a quiet first week 'gone quiet'", () => {
    const healthy = [pickup({ d: "2026-08-10", cans: 200 }), pickup({ d: "2026-09-10", cans: 300 })]; // Sept: 150 cans per bin a month = keep
    const early = stats(healthy, today1);
    expect(early.st).toBe("keep");
    expect(early.early).toBe(true);
    expect(stats(healthy, today15).st).toBe("quiet"); // from the 15th a month with no cans is judged
    expect(stats(healthy, today15).early).toBeFalsy();
  });
  it("a venue that filled up last month still says 'add a bin' on the 3rd", () => {
    const busy = [pickup({ d: "2026-09-10", cans: 700 })]; // 350 cans per bin a month, above the 310 line
    expect(stats(busy, "2026-10-03").st).toBe("add");
  });
  it("two low months in a row still means take a bin back", () => {
    const low = [pickup({ d: "2026-08-10", cans: 40 }), pickup({ d: "2026-09-10", cans: 50 })];
    expect(stats(low, "2026-10-02").st).toBe("pull");
  });
});
