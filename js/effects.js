/* ═══════════════════════════════════════════════
   EFFECTS — Star field, shooting stars,
   ink drop transition, origami fold
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── STAR FIELD ── */
  var starField = document.getElementById('starField');
  if (starField) {
    // Generate static stars
    for (var i = 0; i < 80; i++) {
      var star = document.createElement('div');
      star.className = 'star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.width = (Math.random() * 1.5 + 0.5) + 'px';
      star.style.height = star.style.width;
      star.style.setProperty('--dur', (Math.random() * 4 + 3) + 's');
      star.style.animationDelay = (Math.random() * 5) + 's';
      // Vary the gold tone slightly
      var alpha = (Math.random() * 0.4 + 0.15).toFixed(2);
      star.style.background = 'rgba(201,169,110,' + alpha + ')';
      starField.appendChild(star);
    }

    // Spawn shooting stars periodically
    function spawnShootingStar() {
      var star = document.createElement('div');
      star.className = 'shooting-star';
      star.style.top = (Math.random() * 60 + 5) + '%';
      star.style.left = (Math.random() * 60) + '%';
      star.style.transform = 'rotate(' + (Math.random() * 30 + 15) + 'deg)';
      star.style.width = (Math.random() * 60 + 50) + 'px';
      star.style.setProperty('--shoot-dur', (Math.random() * 0.6 + 0.8) + 's');
      starField.appendChild(star);
      // Clean up after animation
      setTimeout(function () { star.remove(); }, 2000);
    }

    // Shoot a star every 4-8 seconds
    function scheduleShoot() {
      var delay = Math.random() * 4000 + 4000;
      setTimeout(function () {
        spawnShootingStar();
        scheduleShoot();
      }, delay);
    }
    // Initial burst of 2 shooting stars after page load
    setTimeout(spawnShootingStar, 2000);
    setTimeout(spawnShootingStar, 3500);
    scheduleShoot();
  }

  /* ── INK DROP TRANSITION ── */
  var inkDrop = document.getElementById('inkDrop');

  window.inkTransition = function (x, y, callback) {
    if (!inkDrop) { if (callback) callback(); return; }

    // Calculate size needed to cover entire viewport from click point
    var maxDist = Math.max(
      Math.hypot(x, y),
      Math.hypot(window.innerWidth - x, y),
      Math.hypot(x, window.innerHeight - y),
      Math.hypot(window.innerWidth - x, window.innerHeight - y)
    );
    var size = maxDist * 2 + 100;

    inkDrop.style.width = size + 'px';
    inkDrop.style.height = size + 'px';
    inkDrop.style.left = (x - size / 2) + 'px';
    inkDrop.style.top = (y - size / 2) + 'px';
    inkDrop.className = 'ink-drop expanding';

    setTimeout(function () {
      if (callback) callback();
      // Collapse after the callback navigates
      setTimeout(function () {
        inkDrop.className = 'ink-drop collapsing';
        setTimeout(function () {
          inkDrop.className = 'ink-drop';
          inkDrop.style.transform = '';
        }, 600);
      }, 200);
    }, 600);
  };

  // Attach ink transition to questionnaire/UGC links
  document.querySelectorAll('a[href="questionnaire.html"], a[href="ugc-apply.html"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var href = this.getAttribute('href');
      var rect = this.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      window.inkTransition(cx, cy, function () {
        window.location.href = href;
      });
    });
  });

  // Also attach to "Book a Strategy Call" buttons that trigger the consultation modal
  // These use the ink effect but then open the modal instead of navigating
  document.querySelectorAll('[data-action="open-consult"]').forEach(function (btn) {
    var originalHandler = null;
    btn.addEventListener('click', function (e) {
      // The forms.js handler runs first (questionnaire gate check).
      // We add the ink visual on top. Since forms.js uses e.preventDefault(),
      // we just add the visual flair here without interfering.
      if (!inkDrop) return;
      var rect = btn.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;

      // Quick ink pulse (doesn't block — just visual)
      var size = 200;
      inkDrop.style.width = size + 'px';
      inkDrop.style.height = size + 'px';
      inkDrop.style.left = (cx - size / 2) + 'px';
      inkDrop.style.top = (cy - size / 2) + 'px';
      inkDrop.className = 'ink-drop expanding';
      setTimeout(function () {
        inkDrop.className = 'ink-drop collapsing';
        setTimeout(function () { inkDrop.className = 'ink-drop'; }, 500);
      }, 400);
    });
  });

  /* ── ORIGAMI FOLD (for UGC success) ── */
  window.origamiFold = function (element, onComplete) {
    if (!element) return;

    // Add perspective wrapper
    element.style.perspective = '1200px';
    element.classList.add('origami-fold');

    // Spawn trail dots
    var rect = element.getBoundingClientRect();
    var trailCount = 8;
    for (var t = 0; t < trailCount; t++) {
      (function (index) {
        setTimeout(function () {
          var dot = document.createElement('div');
          dot.className = 'origami-trail';
          dot.style.left = (rect.left + rect.width / 2 + (Math.random() - 0.5) * 60) + 'px';
          dot.style.top = (rect.top + rect.height / 2 - index * 15) + 'px';
          dot.style.animationDelay = (index * 0.05) + 's';
          document.body.appendChild(dot);
          setTimeout(function () { dot.remove(); }, 2000);
        }, 400 + index * 80);
      })(t);
    }

    // After fold completes
    setTimeout(function () {
      if (onComplete) onComplete();
    }, 1300);
  };
})();
