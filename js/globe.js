/* ═══════════════════════════════════════════════
   GLOBE NETWORK ANIMATION
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  const canvas = document.getElementById('globeCanvas');
  if (!canvas) return;
  const container = canvas.parentElement;

  function resize() {
    canvas.width = container.clientWidth * window.devicePixelRatio;
    canvas.height = container.clientHeight * window.devicePixelRatio;
    canvas.style.width = container.clientWidth + 'px';
    canvas.style.height = container.clientHeight + 'px';
  }
  resize();
  window.addEventListener('resize', resize);

  const ctx = canvas.getContext('2d');

  const cities = [
    [40.7, -74.0], [34.0, -118.2], [41.9, -87.6], [29.8, -95.4], [37.8, -122.4],
    [45.5, -73.6], [51.5, -0.1], [48.9, 2.3], [52.5, 13.4], [55.8, 37.6],
    [59.3, 18.0], [47.4, 8.5], [41.0, 28.9], [35.7, 139.7], [31.2, 121.5],
    [22.3, 114.2], [1.3, 103.8], [19.1, 72.9], [28.6, 77.2], [25.2, 55.3],
    [-23.5, -46.6], [-34.6, -58.4], [-33.9, 18.4], [6.5, 3.4], [30.1, 31.2],
    [37.6, 126.9], [13.8, 100.5], [-37.8, 144.9], [14.1, -87.2], [-4.3, 15.3],
    [64.1, -21.9], [33.9, -118.4], [43.7, -79.4], [38.9, -77.0], [32.7, -96.8],
    [50.1, 14.4], [48.2, 16.4], [45.5, 9.2], [39.9, 116.4], [24.9, 67.1]
  ];

  const nodes = cities.map(([lat, lng]) => ({
    lat: lat * Math.PI / 180,
    lng: lng * Math.PI / 180,
    r: Math.random() * 1.4 + 0.6,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.02 + Math.random() * 0.02
  }));

  const pairs = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const n1 = nodes[i], n2 = nodes[j];
      const dlat = n1.lat - n2.lat, dlng = n1.lng - n2.lng;
      const dist = Math.sqrt(dlat * dlat + dlng * dlng);
      if (dist < 0.9) pairs.push({ a: i, b: j, dist });
    }
  }

  const packets = [];
  function spawnPacket() {
    if (packets.length > 18) return;
    const pair = pairs[Math.floor(Math.random() * pairs.length)];
    packets.push({
      pair, t: 0,
      speed: 0.004 + Math.random() * 0.004,
      dir: Math.random() < 0.5 ? 1 : -1
    });
  }
  setInterval(spawnPacket, 600);

  let rotation = 0;
  let frame = 0;

  function project(lat, lng) {
    const W = canvas.width, H = canvas.height;
    const cx = W * 0.5, cy = H * 0.5;
    const R = Math.min(W, H) * 0.38;
    const a = lng + rotation;
    const x3 = Math.cos(lat) * Math.sin(a);
    const y3 = -Math.sin(lat);
    const z3 = Math.cos(lat) * Math.cos(a);
    return { sx: cx + x3 * R, sy: cy + y3 * R, z: z3, visible: z3 > -0.15 };
  }

  function draw() {
    frame++;
    rotation += 0.0012;

    const W = canvas.width, H = canvas.height;
    const cx = W * 0.5, cy = H * 0.5;
    const R = Math.min(W, H) * 0.38;
    const dpr = window.devicePixelRatio || 1;

    ctx.clearRect(0, 0, W, H);

    // Sphere glow
    const grd = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.1);
    grd.addColorStop(0, 'rgba(201,169,110,0.03)');
    grd.addColorStop(0.7, 'rgba(201,169,110,0.01)');
    grd.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    // Sphere outline
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(201,169,110,0.08)';
    ctx.lineWidth = 0.5 * dpr;
    ctx.stroke();

    // Latitude lines
    for (let latD = -60; latD <= 60; latD += 30) {
      const lat = latD * Math.PI / 180;
      ctx.beginPath();
      let started = false;
      for (let lngD = -180; lngD <= 180; lngD += 3) {
        const p = project(lat, lngD * Math.PI / 180);
        if (!p.visible) { started = false; continue; }
        if (!started) { ctx.moveTo(p.sx, p.sy); started = true; }
        else ctx.lineTo(p.sx, p.sy);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 0.4 * dpr;
      ctx.stroke();
    }

    // Longitude lines
    for (let lngD = -180; lngD < 180; lngD += 30) {
      const lng = lngD * Math.PI / 180;
      ctx.beginPath();
      let started = false;
      for (let latD = -80; latD <= 80; latD += 3) {
        const p = project(latD * Math.PI / 180, lng);
        if (!p.visible) { started = false; continue; }
        if (!started) { ctx.moveTo(p.sx, p.sy); started = true; }
        else ctx.lineTo(p.sx, p.sy);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 0.4 * dpr;
      ctx.stroke();
    }

    // Connections
    for (const pair of pairs) {
      const a = project(nodes[pair.a].lat, nodes[pair.a].lng);
      const b = project(nodes[pair.b].lat, nodes[pair.b].lng);
      if (!a.visible && !b.visible) continue;
      const avgZ = (a.z + b.z) * 0.5;
      const alpha = Math.max(0, (avgZ + 0.2) * 0.22) * (1 - pair.dist);
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy);
      ctx.lineTo(b.sx, b.sy);
      ctx.strokeStyle = `rgba(201,169,110,${alpha})`;
      ctx.lineWidth = 0.5 * dpr;
      ctx.stroke();
    }

    // Data packets
    for (let i = packets.length - 1; i >= 0; i--) {
      const pk = packets[i];
      pk.t += pk.speed * pk.dir;
      if (pk.t > 1 || pk.t < 0) { packets.splice(i, 1); continue; }
      const na = nodes[pk.pair.a], nb = nodes[pk.pair.b];
      const t = pk.t;
      const iLat = na.lat + (nb.lat - na.lat) * t;
      const iLng = na.lng + (nb.lng - na.lng) * t;
      const p = project(iLat, iLng);
      if (!p.visible) continue;
      const alpha = Math.max(0, (p.z + 0.2) * 0.9);
      for (let tr = 1; tr <= 6; tr++) {
        const tt = t - tr * 0.012 * pk.dir;
        if (tt < 0 || tt > 1) continue;
        const tLat = na.lat + (nb.lat - na.lat) * tt;
        const tLng = na.lng + (nb.lng - na.lng) * tt;
        const tp = project(tLat, tLng);
        if (!tp.visible) continue;
        ctx.beginPath();
        ctx.arc(tp.sx, tp.sy, 1.2 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,240,200,${alpha * (0.25 - tr * 0.04)})`;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, 2.2 * dpr, 0, Math.PI * 2);
      const pg = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, 2.2 * dpr);
      pg.addColorStop(0, `rgba(255,240,200,${alpha})`);
      pg.addColorStop(1, 'rgba(201,169,110,0)');
      ctx.fillStyle = pg;
      ctx.fill();
    }

    // City nodes
    for (const n of nodes) {
      n.pulse += n.pulseSpeed;
      const p = project(n.lat, n.lng);
      if (!p.visible) continue;
      const alpha = Math.max(0, (p.z + 0.1) * 0.9);
      const pulse = 0.5 + 0.5 * Math.sin(n.pulse);
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, (n.r + 2 + pulse * 2) * dpr, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(201,169,110,${alpha * 0.2 * pulse})`;
      ctx.lineWidth = 0.5 * dpr;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, n.r * dpr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220,200,160,${alpha * (0.6 + 0.4 * pulse)})`;
      ctx.fill();
    }

    // Rim glow
    const rimGrd = ctx.createRadialGradient(cx + R * 0.88, cy, 0, cx + R * 0.88, cy, R * 0.5);
    rimGrd.addColorStop(0, 'rgba(255,255,240,0.06)');
    rimGrd.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = rimGrd;
    ctx.fill();

    // Vignette mask
    ctx.beginPath();
    ctx.rect(0, 0, W, H);
    ctx.arc(cx, cy, R * 1.05, 0, Math.PI * 2, true);
    ctx.fillStyle = 'rgba(11,11,9,1)';
    ctx.fill();

    requestAnimationFrame(draw);
  }
  draw();
})();
