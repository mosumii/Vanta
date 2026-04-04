/* ═══════════════════════════════════════════════
   VANTA MONOLITHS — Procedural Matte 3D
   Self-assembling geometric cubes in matte black
   with brushed gold edge highlights
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  var canvas = document.getElementById('monolithCanvas');
  if (!canvas) return;
  var container = canvas.parentElement;

  function resize() {
    canvas.width = container.clientWidth * window.devicePixelRatio;
    canvas.height = container.clientHeight * window.devicePixelRatio;
    canvas.style.width = container.clientWidth + 'px';
    canvas.style.height = container.clientHeight + 'px';
  }
  resize();
  window.addEventListener('resize', resize);

  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var time = 0;
  var mouseX = 0.5;
  var mouseY = 0.5;

  // Drag rotation state
  var isDragging = false;
  var dragRotX = 0;
  var dragRotY = 0;
  var lastDragX = 0;
  var lastDragY = 0;
  var dragVelX = 0;
  var dragVelY = 0;

  container.addEventListener('mousemove', function (e) {
    var rect = container.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) / rect.width;
    mouseY = (e.clientY - rect.top) / rect.height;
    if (isDragging) {
      dragVelY = (e.clientX - lastDragX) * 0.005;
      dragVelX = (e.clientY - lastDragY) * 0.005;
      dragRotY += dragVelY;
      dragRotX += dragVelX;
      lastDragX = e.clientX;
      lastDragY = e.clientY;
    }
  });
  canvas.addEventListener('mousedown', function (e) {
    isDragging = true;
    lastDragX = e.clientX;
    lastDragY = e.clientY;
    canvas.style.cursor = 'grabbing';
  });
  window.addEventListener('mouseup', function () {
    isDragging = false;
    canvas.style.cursor = 'grab';
  });
  canvas.style.cursor = 'grab';

  // Touch support
  canvas.addEventListener('touchstart', function (e) {
    isDragging = true;
    lastDragX = e.touches[0].clientX;
    lastDragY = e.touches[0].clientY;
  }, { passive: true });
  canvas.addEventListener('touchmove', function (e) {
    if (!isDragging) return;
    dragVelY = (e.touches[0].clientX - lastDragX) * 0.005;
    dragVelX = (e.touches[0].clientY - lastDragY) * 0.005;
    dragRotY += dragVelY;
    dragRotX += dragVelX;
    lastDragX = e.touches[0].clientX;
    lastDragY = e.touches[0].clientY;
  }, { passive: true });
  canvas.addEventListener('touchend', function () { isDragging = false; });

  // Scale factor based on canvas size — prevents cutoff
  function getScale() {
    var minDim = Math.min(canvas.width, canvas.height);
    return Math.max(0.5, Math.min(1.2, minDim / (500 * dpr)));
  }

  // Cube definitions — tighter positions to prevent cutoff
  var cubes = [
    { x: 0, y: 0, z: 0, size: 70, rx: 0, ry: 0, phase: 0, assembleDelay: 0 },
    { x: 70, y: -45, z: 25, size: 48, rx: 0.3, ry: 0.5, phase: 0.8, assembleDelay: 0.15 },
    { x: -55, y: 40, z: -15, size: 55, rx: -0.2, ry: 0.8, phase: 1.6, assembleDelay: 0.3 },
    { x: 40, y: 55, z: 40, size: 38, rx: 0.6, ry: -0.3, phase: 2.4, assembleDelay: 0.45 },
    { x: -70, y: -30, z: 30, size: 42, rx: -0.5, ry: 0.2, phase: 3.2, assembleDelay: 0.6 },
  ];

  // Floating particles around the monoliths
  var particles = [];
  for (var i = 0; i < 40; i++) {
    particles.push({
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 0.5) * 400,
      z: (Math.random() - 0.5) * 200,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.003 + 0.001,
      phase: Math.random() * Math.PI * 2,
    });
  }

  // 3D projection
  function project(x, y, z, W, H) {
    var perspective = 600;
    var cx = W * 0.5;
    var cy = H * 0.5;
    var scale = perspective / (perspective + z);
    return {
      sx: cx + x * scale,
      sy: cy + y * scale,
      scale: scale,
      depth: z,
    };
  }

  // Rotate point around Y then X axis
  function rotate3D(x, y, z, angleY, angleX) {
    // Rotate Y
    var cosY = Math.cos(angleY);
    var sinY = Math.sin(angleY);
    var nx = x * cosY - z * sinY;
    var nz = x * sinY + z * cosY;
    // Rotate X
    var cosX = Math.cos(angleX);
    var sinX = Math.sin(angleX);
    var ny = y * cosX - nz * sinX;
    var fz = y * sinX + nz * cosX;
    return { x: nx, y: ny, z: fz };
  }

  // Draw a single cube face
  function drawFace(ctx, pts, fillColor, edgeColor, edgeAlpha) {
    ctx.beginPath();
    ctx.moveTo(pts[0].sx, pts[0].sy);
    for (var i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].sx, pts[i].sy);
    }
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = edgeColor;
    ctx.lineWidth = 1 * dpr;
    ctx.globalAlpha = edgeAlpha;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawCube(cube, globalRotY, globalRotX, W, H, assembleProgress, sc) {
    var s = cube.size * dpr * sc;
    var half = s / 2;

    // Assemble animation — cubes start far away and converge
    var ap = Math.min(1, Math.max(0, (assembleProgress - cube.assembleDelay) / 0.4));
    var easeAp = 1 - Math.pow(1 - ap, 3); // ease out cubic
    var scatter = (1 - easeAp) * 300;

    var cx = cube.x * dpr * sc + scatter * Math.sin(cube.phase);
    var cy = cube.y * dpr * sc + scatter * Math.cos(cube.phase);
    var cz = cube.z * dpr * sc + scatter * Math.sin(cube.phase * 0.7);

    // Individual rotation + global rotation
    var rotY = globalRotY + cube.ry + time * 0.15 * (1 + cube.assembleDelay);
    var rotX = globalRotX + cube.rx + time * 0.08;

    // Breathing/floating animation
    var breathe = Math.sin(time * 0.5 + cube.phase) * 8 * dpr * easeAp;
    cy += breathe;

    // Define 8 cube vertices
    var verts = [
      { x: -half, y: -half, z: -half },
      { x: half, y: -half, z: -half },
      { x: half, y: half, z: -half },
      { x: -half, y: half, z: -half },
      { x: -half, y: -half, z: half },
      { x: half, y: -half, z: half },
      { x: half, y: half, z: half },
      { x: -half, y: half, z: half },
    ];

    // Rotate and project
    var projected = verts.map(function (v) {
      var r = rotate3D(v.x, v.y, v.z, rotY, rotX);
      return project(r.x + cx, r.y + cy, r.z + cz, W, H);
    });

    // 6 faces — only draw front-facing ones
    var faces = [
      { idx: [0, 1, 2, 3], normal: { x: 0, y: 0, z: -1 } }, // front
      { idx: [5, 4, 7, 6], normal: { x: 0, y: 0, z: 1 } }, // back
      { idx: [4, 0, 3, 7], normal: { x: -1, y: 0, z: 0 } }, // left
      { idx: [1, 5, 6, 2], normal: { x: 1, y: 0, z: 0 } }, // right
      { idx: [4, 5, 1, 0], normal: { x: 0, y: -1, z: 0 } }, // top
      { idx: [3, 2, 6, 7], normal: { x: 0, y: 1, z: 0 } }, // bottom
    ];

    // Sort faces by average depth
    var facesWithDepth = faces.map(function (face) {
      var avgZ = 0;
      var pts = face.idx.map(function (i) {
        avgZ += projected[i].depth;
        return projected[i];
      });
      avgZ /= 4;

      // Rotate normal for lighting
      var rn = rotate3D(face.normal.x, face.normal.y, face.normal.z, rotY, rotX);
      // Diffuse lighting from upper-right
      var lightDir = { x: 0.4, y: -0.6, z: -0.7 };
      var dot = rn.x * lightDir.x + rn.y * lightDir.y + rn.z * lightDir.z;
      var brightness = Math.max(0, dot);

      return { pts: pts, avgZ: avgZ, brightness: brightness, rn: rn };
    });

    facesWithDepth.sort(function (a, b) { return b.avgZ - a.avgZ; });

    facesWithDepth.forEach(function (face) {
      // Skip back faces
      if (face.rn.z > 0.1) return;

      // Matte black base with slight brightness variation
      var b = Math.round(12 + face.brightness * 18);
      var fillColor = 'rgb(' + b + ',' + b + ',' + Math.round(b * 0.95) + ')';

      // Gold edge highlight — stronger on lit faces
      var goldAlpha = 0.08 + face.brightness * 0.25;
      var edgeColor = 'rgba(201,169,110,' + goldAlpha.toFixed(2) + ')';

      drawFace(ctx, face.pts, fillColor, edgeColor, 1);
    });
  }

  function draw() {
    time += 0.016;
    var W = canvas.width;
    var H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Assemble/deconstruct cycle (slow, 12s period)
    var cycleDuration = 12;
    var cycleTime = (time % cycleDuration) / cycleDuration;
    var assembleProgress;
    if (cycleTime < 0.15) {
      assembleProgress = cycleTime / 0.15; // assemble phase
    } else if (cycleTime < 0.85) {
      assembleProgress = 1; // assembled, floating
    } else {
      assembleProgress = 1 - (cycleTime - 0.85) / 0.15; // deconstruct
    }

    // Drag momentum decay
    if (!isDragging) {
      dragVelX *= 0.96;
      dragVelY *= 0.96;
      dragRotX += dragVelX * 0.3;
      dragRotY += dragVelY * 0.3;
    }

    var sc = getScale();

    // Mouse + drag influence on rotation
    var globalRotY = time * 0.2 + (mouseX - 0.5) * 0.5 + dragRotY;
    var globalRotX = 0.15 + (mouseY - 0.5) * 0.3 + dragRotX;

    // Ambient glow behind monoliths
    var cx = W * 0.5;
    var cy = H * 0.5;
    var glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.45);
    glow.addColorStop(0, 'rgba(201,169,110,0.04)');
    glow.addColorStop(0.5, 'rgba(201,169,110,0.015)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Draw particles
    particles.forEach(function (p) {
      p.phase += p.speed;
      var px = p.x * dpr + Math.sin(p.phase) * 30 * dpr;
      var py = p.y * dpr + Math.cos(p.phase * 0.7) * 20 * dpr;
      var pz = p.z * dpr;
      var r = rotate3D(px, py, pz, globalRotY * 0.3, globalRotX * 0.3);
      var proj = project(r.x, r.y, r.z, W, H);
      if (proj.scale < 0) return;
      var alpha = Math.max(0, 0.3 * proj.scale * assembleProgress);
      ctx.beginPath();
      ctx.arc(proj.sx, proj.sy, p.size * dpr * proj.scale, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(201,169,110,' + alpha.toFixed(3) + ')';
      ctx.fill();
    });

    // Draw cubes (sorted by depth for proper overlap)
    var sortedCubes = cubes.slice().sort(function (a, b) {
      return b.z - a.z;
    });
    sortedCubes.forEach(function (cube) {
      drawCube(cube, globalRotY, globalRotX, W, H, assembleProgress, sc);
    });

    // Subtle scan line effect
    if (Math.random() > 0.97) {
      var scanY = Math.random() * H;
      ctx.fillStyle = 'rgba(201,169,110,0.015)';
      ctx.fillRect(0, scanY, W, 1 * dpr);
    }

    requestAnimationFrame(draw);
  }

  draw();
})();
