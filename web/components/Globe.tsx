"use client";

import { useEffect, useRef } from "react";
import type { GlobeNode } from "@/lib/content";

/**
 * 3D trade-route globe drawn on a plain <canvas> — no libraries, so it stays
 * light on low-end phones. Everything (dotted earth, wireframe, copper arcs,
 * traveling pulses, node rings, floating labels) lives on the sphere and rotates
 * together. Ported from the approved v26 mockup.
 */
export default function Globe({ nodes }: { nodes: GlobeNode[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const labelBox = labelsRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width:600px)").matches;
    const nav = navigator as Navigator & { deviceMemory?: number };
    const lowEnd = (nav.hardwareConcurrency && nav.hardwareConcurrency <= 4) || (nav.deviceMemory != null && nav.deviceMemory <= 4);
    const stepDeg = lowEnd ? 13 : mobile ? 11 : 7;
    const baseSpin = prefersReduce ? 0 : mobile ? 0.0011 : 0.0016;
    const throttle = mobile || lowEnd ? 33 : 20;
    let W = 0, H = 0, cx = 0, cy = 0, R = 0, dpr = 1, ang = -0.19, visible = true, raf = 0, lastT = 0;
    const t0 = performance.now();
    let vel = 0, dragging = false, lastX = 0;
    const tilt = 0.32, ct = Math.cos(tilt), st = Math.sin(tilt);

    // sphere dot cloud
    const pts: number[][] = [];
    for (let lat = -84; lat <= 84; lat += stepDeg) {
      const phi = (lat * Math.PI) / 180, cphi = Math.cos(phi), sphi = Math.sin(phi);
      const ringLon = Math.max(6, Math.round((360 / stepDeg) * cphi));
      const dLon = 360 / ringLon;
      for (let k = 0; k < ringLon; k++) {
        const th = ((k * dLon) * Math.PI) / 180;
        pts.push([cphi * Math.cos(th), sphi, cphi * Math.sin(th)]);
      }
    }

    // faint wireframe grid
    const gridLines: number[][][] = [];
    if (!lowEnd) {
      const seg = mobile ? 26 : 40;
      for (let lng = 0; lng < 360; lng += 30) {
        const b = (lng * Math.PI) / 180, line: number[][] = [];
        for (let i = 0; i <= seg; i++) {
          const a = ((-80 + (160 * i) / seg) * Math.PI) / 180, c = Math.cos(a);
          line.push([c * Math.cos(b), Math.sin(a), c * Math.sin(b)]);
        }
        gridLines.push(line);
      }
      for (let lat = -60; lat <= 60; lat += 30) {
        const a = (lat * Math.PI) / 180, c = Math.cos(a), y = Math.sin(a), line: number[][] = [];
        for (let i = 0; i <= seg; i++) {
          const b = ((360 * i) / seg) * Math.PI / 180;
          line.push([c * Math.cos(b), y, c * Math.sin(b)]);
        }
        gridLines.push(line);
      }
    }

    // geography
    const ll = (lat: number, lng: number): number[] => {
      const a = (lat * Math.PI) / 180, b = (lng * Math.PI) / 180, c = Math.cos(a);
      return [c * Math.cos(b), Math.sin(a), c * Math.sin(b)];
    };
    type N = GlobeNode & { p: number[] };
    const NODES: N[] = nodes.map((n) => ({ ...n, p: ll(n.lat, n.lng) }));
    const HUB = NODES.find((n) => n.hub)!;

    function arcSamples(a: number[], b: number[], steps: number): number[][] {
      let dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
      dot = Math.max(-1, Math.min(1, dot));
      const om = Math.acos(dot), so = Math.sin(om), alt = Math.min(0.24, 0.07 + 0.17 * Math.sin(om)), out: number[][] = [];
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        let x, y, z;
        if (so < 1e-5) { x = a[0]; y = a[1]; z = a[2]; }
        else {
          const s1 = Math.sin((1 - t) * om) / so, s2 = Math.sin(t * om) / so;
          x = a[0] * s1 + b[0] * s2; y = a[1] * s1 + b[1] * s2; z = a[2] * s1 + b[2] * s2;
        }
        const r = 1 + alt * Math.sin(Math.PI * t);
        out.push([x * r, y * r, z * r]);
      }
      return out;
    }
    const ARCS: { sample: number[][]; speed: number; off: number }[] = [];
    NODES.filter((n) => !n.hub).forEach((n, i) => {
      let dt = HUB.p[0] * n.p[0] + HUB.p[1] * n.p[1] + HUB.p[2] * n.p[2];
      if (Math.acos(Math.max(-1, Math.min(1, dt))) > 1.9) return;
      ARCS.push({ sample: arcSamples(HUB.p, n.p, mobile ? 34 : 46), speed: 0.16 + i * 0.015, off: i * 0.23 });
    });

    let ca = 1, sa = 0;
    function proj(p: number[]): number[] {
      const x = p[0] * ca + p[2] * sa, z = -p[0] * sa + p[2] * ca, y = p[1];
      const y2 = y * ct - z * st, z2 = y * st + z * ct;
      return [cx + x * R, cy - y2 * R, z2, x, y2];
    }

    // link label elements (rendered in JSX) by id
    const labelEls: Record<string, HTMLElement> = {};
    if (labelBox) {
      NODES.forEach((n) => {
        const el = labelBox.querySelector<HTMLElement>(`[data-id="${n.id}"]`);
        if (el) labelEls[n.id] = el;
      });
    }

    function strokePath(sample: number[][], wLine: number, col: string, aScale: number) {
      ctx!.lineWidth = wLine; ctx!.lineJoin = "round"; ctx!.lineCap = "round";
      const R2 = R * 0.985 * (R * 0.985);
      for (let i = 0; i < sample.length - 1; i++) {
        const p = proj(sample[i]), q = proj(sample[i + 1]);
        const mz = (p[2] + q[2]) * 0.5;
        const mx = (p[0] + q[0]) * 0.5 - cx, my = (p[1] + q[1]) * 0.5 - cy;
        if (mz < 0 && mx * mx + my * my < R2) continue;
        const d = (mz + 1) / 2;
        const a = (0.12 + d * 0.9) * aScale;
        ctx!.beginPath(); ctx!.strokeStyle = "rgba(" + col + "," + a.toFixed(3) + ")";
        ctx!.moveTo(p[0], p[1]); ctx!.lineTo(q[0], q[1]); ctx!.stroke();
      }
    }

    function draw() {
      if (W === 0) return;
      ctx!.clearRect(0, 0, W, H);
      ca = Math.cos(ang); sa = Math.sin(ang);
      const now = (performance.now() - t0) / 1000;

      const Lx = -0.42, Ly = 0.40, Lz = 0.82;
      for (let i = 0; i < pts.length; i++) {
        const r = proj(pts[i]); const nz = r[2];
        if (nz < -0.2) continue;
        const lit = r[3] * Lx + r[4] * Ly + nz * Lz;
        const day = lit < -0.15 ? 0 : Math.min(1, (lit + 0.15) / 0.7);
        const depth = (nz + 1) / 2;
        const size = 0.55 + depth * 1.5;
        const alpha = (0.05 + day * 0.85) * (0.4 + depth * 0.6);
        if (alpha < 0.02) continue;
        ctx!.beginPath();
        ctx!.fillStyle = day > 0.45 ? "rgba(228,182,137," + alpha.toFixed(3) + ")" : "rgba(122,120,120," + alpha.toFixed(3) + ")";
        ctx!.arc(r[0], r[1], size, 0, 6.2832); ctx!.fill();
      }

      for (let g = 0; g < gridLines.length; g++) {
        const line = gridLines[g];
        for (let i = 0; i < line.length - 1; i++) {
          const p = proj(line[i]), q = proj(line[i + 1]);
          const d = ((p[2] + q[2]) * 0.5 + 1) / 2; if (d < 0.55) continue;
          ctx!.beginPath(); ctx!.strokeStyle = "rgba(224,201,170," + ((d - 0.55) * 0.13).toFixed(3) + ")";
          ctx!.lineWidth = 1; ctx!.moveTo(p[0], p[1]); ctx!.lineTo(q[0], q[1]); ctx!.stroke();
        }
      }

      for (let i = 0; i < ARCS.length; i++) {
        strokePath(ARCS[i].sample, 3.2, "143,97,58", 0.5);
        strokePath(ARCS[i].sample, 1.4, "235,196,152", 1.0);
      }

      for (let i = 0; i < ARCS.length; i++) {
        const s = ARCS[i], tt = (now * s.speed + s.off) % 1;
        const seg = tt * (s.sample.length - 1), idx = Math.floor(seg), f = seg - idx;
        const a = s.sample[idx], b = s.sample[Math.min(idx + 1, s.sample.length - 1)];
        const r = proj([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]);
        const dx = r[0] - cx, dy = r[1] - cy;
        if (r[2] < 0 && dx * dx + dy * dy < R * 0.985 * (R * 0.985)) continue;
        const d = (r[2] + 1) / 2;
        ctx!.beginPath(); ctx!.fillStyle = "rgba(255,236,205," + (0.35 + d * 0.6).toFixed(3) + ")";
        ctx!.shadowColor = "rgba(224,177,132,0.9)"; ctx!.shadowBlur = 8 * d;
        ctx!.arc(r[0], r[1], 1.8 + d * 1.6, 0, 6.2832); ctx!.fill(); ctx!.shadowBlur = 0;
      }

      for (let i = 0; i < NODES.length; i++) {
        const n = NODES[i], r = proj(n.p), d = (r[2] + 1) / 2, front = Math.max(0, Math.min(1, (r[2] + 0.12) / 0.34));
        if (d > 0.42) {
          const pr = (now * 0.8 + i * 0.4) % 1;
          ctx!.beginPath(); ctx!.strokeStyle = "rgba(" + (n.hub ? "224,177,132" : "199,147,99") + "," + ((1 - pr) * 0.6 * front).toFixed(3) + ")";
          ctx!.lineWidth = 1.4; ctx!.arc(r[0], r[1], (n.hub ? 4 : 3) + pr * (n.hub ? 15 : 11), 0, 6.2832); ctx!.stroke();
          ctx!.beginPath(); ctx!.fillStyle = n.hub ? "rgba(224,177,132," + (0.6 + front * 0.4).toFixed(3) + ")" : "rgba(199,147,99," + (0.5 + front * 0.45).toFixed(3) + ")";
          if (n.hub) { ctx!.shadowColor = "rgba(224,177,132,0.9)"; ctx!.shadowBlur = 10 * front; }
          ctx!.arc(r[0], r[1], n.hub ? 4.6 : 3.2, 0, 6.2832); ctx!.fill(); ctx!.shadowBlur = 0;
        }
        const el = labelEls[n.id];
        if (el) {
          el.style.transform = "translate(-50%,-50%) translate(" + r[0].toFixed(1) + "px," + (r[1] - 16).toFixed(1) + "px)";
          el.style.opacity = front.toFixed(3);
          el.style.zIndex = String(n.hub ? 5 : front > 0.5 ? 3 : 1);
        }
      }
    }

    function resize() {
      const rc = canvas!.getBoundingClientRect();
      if (rc.width === 0) return;
      dpr = Math.min(window.devicePixelRatio || 1, mobile || lowEnd ? 1.5 : 2);
      W = rc.width; H = rc.height;
      canvas!.width = Math.round(W * dpr); canvas!.height = Math.round(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2; cy = H / 2; R = (Math.min(W, H) / 2) * 0.72;
      draw();
    }
    const running = () => baseSpin !== 0 || Math.abs(vel) > 1e-4 || dragging;
    function loop(t: number) {
      if (!visible) { raf = 0; return; }
      raf = requestAnimationFrame(loop);
      if (t - lastT < throttle) return; lastT = t;
      if (!dragging) { ang += baseSpin + vel; vel *= 0.93; }
      draw();
    }
    const start = () => { if (!running()) { draw(); return; } if (!raf) { lastT = 0; raf = requestAnimationFrame(loop); } };
    const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };

    const gx = (e: PointerEvent) => e.clientX;
    const onDown = (e: PointerEvent) => { dragging = true; lastX = gx(e); vel = 0; start(); };
    const onMove = (e: PointerEvent) => { if (!dragging) return; const x = gx(e); const dx = x - lastX; lastX = x; ang -= dx * 0.006; vel = -dx * 0.006; };
    const onUp = () => { dragging = false; if (!raf) start(); };
    wrap.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("resize", resize, { passive: true });

    const gio = new IntersectionObserver((es) => {
      es.forEach((e) => { visible = e.isIntersecting; if (visible) { resize(); start(); } else { stop(); } });
    }, { threshold: 0.02 });
    gio.observe(canvas);
    resize(); requestAnimationFrame(resize); start();

    return () => {
      stop();
      gio.disconnect();
      wrap.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("resize", resize);
    };
  }, [nodes]);

  return (
    <div className="globe-wrap" ref={wrapRef}>
      <canvas
        className="globe-canvas"
        ref={canvasRef}
        role="img"
        aria-label="Rotating 3D globe showing scrap-metal trade routes from North America, Europe, China and UAE converging on India"
      />
      <div className="globe-shade" />
      <div className="globe-labels" ref={labelsRef} aria-hidden="true">
        {nodes.map((n) => (
          <span className={`g-label${n.hub ? " hub" : ""}`} data-id={n.id} key={n.id}>
            {n.label} <b>{n.v}</b>
          </span>
        ))}
      </div>
    </div>
  );
}
