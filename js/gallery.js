/* ═══════════════════════════════════════════════
   GALLERY — Book + Card Fan + Demo Modal
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  var stage = document.getElementById('galleryStage');
  var book = document.getElementById('galleryBook');
  var overlay = document.querySelector('.demo-modal-overlay');
  var demoFrame = document.querySelector('.demo-frame-wrapper');
  var iframe = demoFrame ? demoFrame.querySelector('iframe') : null;
  var closeBtn = document.querySelector('.demo-modal-close');
  var titleEl = document.querySelector('.demo-modal-title');
  var desktopBtn = document.querySelector('.demo-desktop-btn');
  var mobileBtn = document.querySelector('.demo-mobile-btn');

  var closeFanBtn = document.getElementById('galleryCloseFan');

  /* ── BOOK TOGGLE (fan cards in/out) ── */
  if (book && stage) {
    book.addEventListener('click', function () {
      stage.classList.toggle('fanned');
    });

    // Close button
    if (closeFanBtn) {
      closeFanBtn.addEventListener('click', function () {
        stage.classList.remove('fanned');
      });
    }

    // Close fan when clicking outside
    document.addEventListener('click', function (e) {
      if (stage.classList.contains('fanned') &&
          !stage.contains(e.target)) {
        stage.classList.remove('fanned');
      }
    });
  }

  /* ── OPEN DEMO MODAL (from fan cards) ── */
  document.querySelectorAll('.fan-card[data-demo]').forEach(function (card) {
    card.addEventListener('click', function () {
      var src = card.getAttribute('data-demo');
      var title = card.getAttribute('data-title') || 'Demo Preview';

      if (iframe) iframe.src = src;
      if (titleEl) titleEl.textContent = title;
      if (overlay) overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  /* ── CLOSE DEMO MODAL ── */
  function closeDemo() {
    if (overlay) overlay.classList.remove('active');
    if (iframe) setTimeout(function () { iframe.src = ''; }, 400);
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeDemo);
  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeDemo();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay && overlay.classList.contains('active')) {
      closeDemo();
    }
  });

  /* ── DEVICE TOGGLE ── */
  if (desktopBtn && mobileBtn && demoFrame) {
    desktopBtn.addEventListener('click', function () {
      demoFrame.classList.remove('mobile');
      desktopBtn.classList.add('active');
      mobileBtn.classList.remove('active');
    });
    mobileBtn.addEventListener('click', function () {
      demoFrame.classList.add('mobile');
      mobileBtn.classList.add('active');
      desktopBtn.classList.remove('active');
    });
  }
})();
