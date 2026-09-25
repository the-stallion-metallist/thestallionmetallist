import "server-only";

// Driving times (seconds) and distances (metres) between points, from OpenRouteService.
// Points are [lat, lng]. The free plan allows 3,500 routes per request, so big sets go in slices.
export async function roadMatrix(pts: [number, number][]) {
  const key = process.env.ORS_API_KEY;
  if (!key) throw new Error("The road data key (ORS_API_KEY) is missing on the server.");
  const n = pts.length, per = Math.max(1, Math.floor(3500 / n));
  const dur: number[][] = [], dist: number[][] = [];
  for (let from = 0; from < n; from += per) {
    const sources = Array.from({ length: Math.min(per, n - from) }, (_, i) => from + i);
    const res = await fetch("https://api.openrouteservice.org/v2/matrix/driving-car", {
      method: "POST",
      headers: { Authorization: key, "Content-Type": "application/json" },
      body: JSON.stringify({ locations: pts.map(([lat, lng]) => [lng, lat]), sources, metrics: ["duration", "distance"] }),
    });
    if (!res.ok) throw new Error(`Road data service answered ${res.status}: ${(await res.text()).slice(0, 160)}`);
    const j = await res.json() as { durations: (number | null)[][]; distances: (number | null)[][] };
    // a point the service can't reach by road gets a large time, so the planner avoids it rather than breaking
    j.durations.forEach((r) => dur.push(r.map((x) => (x == null ? 36000 : Math.round(x)))));
    j.distances.forEach((r) => dist.push(r.map((x) => (x == null ? 500000 : Math.round(x)))));
  }
  return { dur, dist };
}
