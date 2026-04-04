/* ═══════════════════════════════════════════════
   LIVE LINE CHART
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  const canvas = document.getElementById('lineCanvas');
  if (!canvas) return;
  const container = canvas.parentElement;

  function resize() {
    canvas.width = container.clientWidth * (window.devicePixelRatio || 1);
    canvas.height = container.clientHeight * (window.devicePixelRatio || 1);
    canvas.style.width = container.clientWidth + 'px';
    canvas.style.height = container.clientHeight + 'px';
  }
  resize();
  window.addEventListener('resize', resize);

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  const NUM_POINTS = 120;
  const data = [];
  let val = 0.45;
  for (let i = 0; i < NUM_POINTS; i++) {
    val += (Math.random() - 0.44) * 0.06;
    val = Math.max(0.1, Math.min(0.92, val));
    data.push(val);
  }

  const chgLabel = document.getElementById('lineChgLabel');
  let tickerFrame = 0;

  const tickers = {
    ctr: { val: 3.8, base: 3.8, chg: 0.4, fmt: (v) => v.toFixed(1) + '%', up: true },
    cpa: { val: 12.4, base: 12.4, chg: -2.1, fmt: (v) => '$' + v.toFixed(2), up: true },
    conv: { val: 6.1, base: 6.1, chg: 1.3, fmt: (v) => v.toFixed(1) + '%', up: true },
    roas: { val: 4.7, base: 4.7, chg: 0.6, fmt: (v) => v.toFixed(1) + '\u00d7', up: true },
    recall: { val: 38, base: 38, chg: 9, fmt: (v) => Math.round(v) + '%', up: true }
  };

  function drawLine() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const pad = { l: 16 * dpr, r: 16 * dpr, t: 16 * dpr, b: 16 * dpr };
    const w = W - pad.l - pad.r;
    const h = H - pad.t - pad.b;
    const n = data.length;

    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 0.5 * dpr;
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + h * (i / 4);
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(W - pad.r, y);
      ctx.stroke();
    }

    const pts = data.map((v, i) => ({
      x: pad.l + (i / (n - 1)) * w,
      y: pad.t + h * (1 - v)
    }));

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pad.t + h);
    for (const p of pts) ctx.lineTo(p.x, p.y);
    ctx.lineTo(pts[n - 1].x, pad.t + h);
    ctx.closePath();
    const fg = ctx.createLinearGradient(0, pad.t, 0, pad.t + h);
    fg.addColorStop(0, 'rgba(201,169,110,0.22)');
    fg.addColorStop(0.6, 'rgba(201,169,110,0.05)');
    fg.addColorStop(1, 'rgba(201,169,110,0)');
    ctx.fillStyle = fg;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1], cur = pts[i];
      const cpx = (prev.x + cur.x) / 2;
      ctx.bezierCurveTo(cpx, prev.y, cpx, cur.y, cur.x, cur.y);
    }
    ctx.strokeStyle = 'rgba(201,169,110,0.85)';
    ctx.lineWidth = 1.5 * dpr;
    ctx.lineJoin = 'round';
    ctx.stroke();

    const last = pts[pts.length - 1];
    const pulse = 0.5 + 0.5 * Math.sin(tickerFrame * 0.08);
    ctx.beginPath();
    ctx.arc(last.x, last.y, (4 + pulse) * dpr, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(201,169,110,${0.15 * pulse})`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(last.x, last.y, 2.5 * dpr, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(220,200,140,0.95)';
    ctx.fill();
  }

  let lastAdd = 0;
  function tick(ts) {
    tickerFrame++;
    if (ts - lastAdd > 80) {
      lastAdd = ts;
      let last = data[data.length - 1];
      last += (Math.random() - 0.43) * 0.055;
      last = Math.max(0.08, Math.min(0.94, last));
      data.push(last);
      if (data.length > NUM_POINTS) data.shift();

      if (chgLabel) {
        const first = data[0], newest = data[data.length - 1];
        const pct = ((newest - first) / first) * 100;
        chgLabel.textContent = (pct >= 0 ? '\u25b2 +' : '\u25bc ') + Math.abs(pct).toFixed(1) + '% this cycle';
        chgLabel.className = 'line-label-delta' + (pct < 0 ? ' neg' : '');
      }

      if (tickerFrame % 8 === 0) {
        for (const [k, t] of Object.entries(tickers)) {
          t.val += (Math.random() - 0.45) * 0.12 * (k === 'cpa' ? -1 : 1);
          t.val = Math.max(t.base * 0.7, Math.min(t.base * 1.4, t.val));
          const el = document.getElementById('t-' + k);
          if (el) el.textContent = t.fmt(t.val);
        }
      }
    }
    drawLine();
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
