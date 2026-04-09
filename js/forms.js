/* ═══════════════════════════════════════════════
   FORMS — Consultation modal, Stripe placeholders,
   form submission handling
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════
     FORM SECURITY — Honeypot + Rate Limiting
     ═══════════════════════════════════════════ */

  // Honeypot: add hidden field to all forms — bots fill it, humans don't
  document.querySelectorAll('form').forEach(function (form) {
    var honey = document.createElement('input');
    honey.type = 'text';
    honey.name = '_gotcha';
    honey.tabIndex = -1;
    honey.autocomplete = 'off';
    honey.style.cssText = 'position:absolute;left:-9999px;top:-9999px;opacity:0;height:0;width:0;overflow:hidden';
    form.appendChild(honey);
  });

  // Rate limiting: max 3 submissions per 5 minutes per form
  var submitCounts = {};
  window.checkRateLimit = function (formId) {
    var now = Date.now();
    if (!submitCounts[formId]) submitCounts[formId] = [];
    // Clean old entries (older than 5 min)
    submitCounts[formId] = submitCounts[formId].filter(function (t) { return now - t < 300000; });
    if (submitCounts[formId].length >= 3) return false; // rate limited
    submitCounts[formId].push(now);
    return true;
  };

  // Check honeypot before sending
  window.isBot = function (form) {
    var honey = form.querySelector('[name="_gotcha"]');
    return honey && honey.value.length > 0;
  };

  /* ═══════════════════════════════════════════
     QUESTIONNAIRE GATE
     ═══════════════════════════════════════════ */
  function hasCompletedQuestionnaire() {
    var stored = localStorage.getItem('vanta_questionnaire_done');
    return stored === 'true';
  }

  function markQuestionnaireComplete() {
    localStorage.setItem('vanta_questionnaire_done', 'true');
  }

  // Expose globally so questionnaire.html can call it
  window.markQuestionnaireComplete = markQuestionnaireComplete;

  /* ═══════════════════════════════════════════
     CONSULTATION MODAL
     ═══════════════════════════════════════════ */
  const modalOverlay = document.getElementById('consultModal');
  const modalClose = modalOverlay ? modalOverlay.querySelector('.modal-close') : null;
  const consultForm = document.getElementById('consultForm');

  // Open modal triggers — show questionnaire modal
  document.querySelectorAll('[data-action="open-consult"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // Reset modal to step 1 each time
      qmGoTo(1);
      if (modalOverlay) {
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  // Skip to Booking button
  var skipBtn = document.getElementById('qSkipBtn');
  if (skipBtn) {
    skipBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var cfg = window.VANTA_CONFIG || {};
      if (cfg.CALENDLY_URL) {
        window.open(cfg.CALENDLY_URL, '_blank');
      }
      closeModal();
    });
  }

  /* ═══════════════════════════════════════════
     QUESTIONNAIRE MODAL — Multi-step navigation
     ═══════════════════════════════════════════ */
  var qmTotalSteps = 5;

  function qmGoTo(step) {
    document.querySelectorAll('.qm-step').forEach(function (s) { s.style.display = 'none'; });
    var target = document.querySelector('[data-qm-step="' + step + '"]');
    if (target) target.style.display = 'block';
    // Update progress bar
    document.querySelectorAll('.qm-prog').forEach(function (bar, i) {
      bar.style.background = (i < step) ? 'var(--gold)' : 'var(--border)';
    });
  }

  // Checkbox tile toggle — click label to toggle selected state
  document.querySelectorAll('.qm-check label').forEach(function (lbl) {
    lbl.addEventListener('click', function (e) {
      e.preventDefault();
      var input = lbl.parentElement.querySelector('input[type="checkbox"]');
      if (input) {
        input.checked = !input.checked;
        lbl.classList.toggle('selected', input.checked);
      }
    });
  });

  window.qmNext = function (from) {
    if (from < qmTotalSteps) qmGoTo(from + 1);
  };

  window.qmPrev = function (from) {
    if (from > 1) qmGoTo(from - 1);
  };

  // Close modal
  function closeModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });

  // ── UNIVERSAL FORM SENDER ──
  // Sends to localStorage + Formspree + Google Sheets
  function sendFormData(data, formType) {
    var cfg = window.VANTA_CONFIG || {};
    data._formType = formType;
    data._timestamp = new Date().toISOString();
    delete data._gotcha; // never send honeypot field

    // 1. localStorage backup
    var key = 'vanta_' + formType.toLowerCase();
    var stored = JSON.parse(localStorage.getItem(key) || '[]');
    stored.push(data);
    localStorage.setItem(key, JSON.stringify(stored));

    // 2. Formspree (email notification)
    if (cfg.FORMSPREE_URL) {
      fetch(cfg.FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).catch(function(){});
    }

    // 3. Google Sheets
    if (cfg.GOOGLE_SHEET_URL) {
      fetch(cfg.GOOGLE_SHEET_URL, {
        method: 'POST',
        body: JSON.stringify(data)
      }).catch(function(){});
    }
  }

  // Form submission — sends questionnaire data, then opens Calendly
  if (consultForm) {
    consultForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Security checks
      if (window.isBot && window.isBot(consultForm)) return;
      if (window.checkRateLimit && !window.checkRateLimit('consult')) {
        if (window.showToast) window.showToast('Too many submissions. Please wait a few minutes.', 3000);
        return;
      }

      const formData = new FormData(consultForm);
      const data = {};
      formData.forEach(function (value, key) {
        if (key === '_gotcha') return;
        if (data[key]) {
          if (Array.isArray(data[key])) data[key].push(value);
          else data[key] = [data[key], value];
        } else {
          data[key] = value;
        }
      });

      sendFormData(data, 'Questionnaires');

      // Hide progress bar and skip banner
      var progressBar = document.getElementById('qModalProgress');
      var skipBanner = document.getElementById('qSkipBanner');
      if (progressBar) progressBar.style.display = 'none';
      if (skipBanner) skipBanner.style.display = 'none';

      // Show success + open Calendly
      var cfg = window.VANTA_CONFIG || {};
      consultForm.innerHTML = '<div style="text-align:center;padding:40px 0;">' +
        '<div style="font-family:var(--font-display);font-size:32px;font-weight:300;margin-bottom:12px;">Thank you</div>' +
        '<p style="color:var(--text-muted);font-size:14px;line-height:1.6;margin-bottom:24px;">' +
        'Your responses have been saved. Now pick a time for your strategy consultation.</p>' +
        (cfg.CALENDLY_URL
          ? '<a href="' + cfg.CALENDLY_URL + '" target="_blank" rel="noopener" style="display:inline-block;padding:14px 32px;background:var(--gold);color:#0b0b09;text-decoration:none;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;font-weight:500">Book Your Call</a>'
          : '<p style="color:var(--text-muted);font-size:13px">We\'ll be in touch within 24 hours to schedule your consultation.</p>') +
        '</div>';

      // Auto-open Calendly
      if (cfg.CALENDLY_URL) {
        window.open(cfg.CALENDLY_URL, '_blank');
      }
    });
  }

  /* ═══════════════════════════════════════════
     STRIPE PAYMENT LINKS (from config)
     ═══════════════════════════════════════════ */
  document.querySelectorAll('[data-stripe]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tier = btn.getAttribute('data-stripe');
      const cfg = window.VANTA_CONFIG || {};
      const linkMap = { tier1: cfg.STRIPE_TIER1, tier2: cfg.STRIPE_TIER2, tier3: cfg.STRIPE_TIER3 };
      const link = linkMap[tier];

      if (link) {
        window.open(link, '_blank');
      } else {
        // Placeholder: open consultation modal instead
        if (modalOverlay) {
          modalOverlay.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      }
    });
  });

  /* ═══════════════════════════════════════════
     TIER 3 DYNAMIC PRICING
     ═══════════════════════════════════════════ */
  const tier3Card = document.getElementById('tier3Card');
  const tier3Price = document.getElementById('tier3Price');
  if (tier3Card && tier3Price) {
    const checkboxes = tier3Card.querySelectorAll('input[data-price]');

    function updateTier3Price() {
      let total = 0;
      checkboxes.forEach((cb) => {
        if (cb.checked) total += parseInt(cb.getAttribute('data-price'), 10);
      });
      // Animate the price change
      tier3Price.style.transform = 'scale(0.95)';
      tier3Price.style.opacity = '0.5';
      setTimeout(() => {
        tier3Price.textContent = '$' + total.toLocaleString();
        tier3Price.style.transform = 'scale(1)';
        tier3Price.style.opacity = '1';
      }, 150);
    }

    // Add transition to price element
    tier3Price.style.transition = 'transform 0.3s cubic-bezier(0.16,1,0.3,1), opacity 0.15s';

    checkboxes.forEach((cb) => {
      cb.addEventListener('change', updateTier3Price);
    });

    // Set initial price
    updateTier3Price();
  }

  /* ═══════════════════════════════════════════
     SERVICE CARD VISUALIZATIONS
     ═══════════════════════════════════════════ */
  var serviceModal = document.getElementById('serviceModal');
  var serviceContent = document.getElementById('serviceContent');

  var serviceData = {
    ugc: {
      title: 'UGC Video Ads',
      html: '<div style="padding:32px">' +
        '<div style="font-size:11px;color:var(--gold);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:20px;text-align:center">Example UGC Ad Campaigns</div>' +
        '<div style="display:flex;gap:16px;margin-bottom:28px">' +
          '<div style="flex:1;position:relative;border:2px solid rgba(201,169,110,0.2);border-radius:12px;overflow:hidden;background:#0a0a09">' +
            '<div style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:40px;height:10px;background:#0a0a09;border-radius:0 0 8px 8px;z-index:2"></div>' +
            '<video controls playsinline style="width:100%;aspect-ratio:9/16;object-fit:cover;display:block" poster="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=530&fit=crop&q=80"><source src="https://assets.mixkit.co/videos/preview/mixkit-woman-filming-herself-reviewing-a-product-42379-large.mp4" type="video/mp4"></video>' +
            '<div style="padding:10px;text-align:center"><div style="font-size:10px;color:var(--gold);letter-spacing:0.1em;text-transform:uppercase">Product Review</div><div style="font-family:var(--font-display);font-size:18px">2.4M Views</div><div style="font-size:10px;color:#5cb97a">4.2% CTR</div></div>' +
          '</div>' +
          '<div style="flex:1;position:relative;border:2px solid rgba(201,169,110,0.2);border-radius:12px;overflow:hidden;background:#0a0a09">' +
            '<div style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:40px;height:10px;background:#0a0a09;border-radius:0 0 8px 8px;z-index:2"></div>' +
            '<video controls playsinline style="width:100%;aspect-ratio:9/16;object-fit:cover;display:block" poster="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=530&fit=crop&q=80"><source src="https://assets.mixkit.co/videos/preview/mixkit-young-woman-vlogger-recording-content-at-home-42377-large.mp4" type="video/mp4"></video>' +
            '<div style="padding:10px;text-align:center"><div style="font-size:10px;color:var(--gold);letter-spacing:0.1em;text-transform:uppercase">Day in My Life</div><div style="font-family:var(--font-display);font-size:18px">1.8M Views</div><div style="font-size:10px;color:#5cb97a">3.8% CTR</div></div>' +
          '</div>' +
          '<div style="flex:1;position:relative;border:2px solid rgba(201,169,110,0.2);border-radius:12px;overflow:hidden;background:#0a0a09">' +
            '<div style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:40px;height:10px;background:#0a0a09;border-radius:0 0 8px 8px;z-index:2"></div>' +
            '<video controls playsinline style="width:100%;aspect-ratio:9/16;object-fit:cover;display:block" poster="https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=300&h=530&fit=crop&q=80"><source src="https://assets.mixkit.co/videos/preview/mixkit-food-blogger-recording-a-video-review-42376-large.mp4" type="video/mp4"></video>' +
            '<div style="padding:10px;text-align:center"><div style="font-size:10px;color:var(--gold);letter-spacing:0.1em;text-transform:uppercase">Food Review</div><div style="font-family:var(--font-display);font-size:18px">890K Views</div><div style="font-size:10px;color:#5cb97a">5.1% CTR</div></div>' +
          '</div>' +
        '</div>' +
        '<div style="text-align:center;padding:16px 0;border-top:1px solid var(--border)">' +
          '<div style="font-size:11px;color:var(--gold);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px">Campaign Impact</div>' +
          '<div style="display:flex;gap:24px;justify-content:center">' +
            '<div><div style="font-family:var(--font-display);font-size:28px;color:var(--gold)">+340%</div><div style="font-size:10px;color:var(--text-muted)">Revenue Growth</div></div>' +
            '<div><div style="font-family:var(--font-display);font-size:28px;color:var(--gold)">-42%</div><div style="font-size:10px;color:var(--text-muted)">CPA Reduction</div></div>' +
            '<div><div style="font-family:var(--font-display);font-size:28px;color:var(--gold)">5.1M</div><div style="font-size:10px;color:var(--text-muted)">Total Views</div></div>' +
          '</div>' +
        '</div></div>'
    },
    social: {
      title: 'Social Media Management',
      html: '<div style="padding:32px">' +
        '<div style="font-size:11px;color:var(--gold);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:20px;text-align:center">How We Manage Your Socials</div>' +
        '<div style="display:flex;flex-direction:column;gap:0;position:relative;padding-left:28px">' +
          '<div style="position:absolute;left:8px;top:12px;bottom:12px;width:1px;background:var(--gold-border)"></div>' +
          '<div style="padding:16px 0;border-bottom:1px solid var(--border);position:relative"><div style="position:absolute;left:-24px;top:20px;width:12px;height:12px;border:1px solid var(--gold);background:var(--bg)"></div><div style="font-size:10px;color:var(--gold);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px">Phase 1 &middot; Strategy</div><div style="font-family:var(--font-display);font-size:18px;margin-bottom:4px">Content Audit & Planning</div><div style="font-size:12px;color:var(--text-muted)">Analyze your brand voice, competitors, and audience. Build a 30-day content calendar with posting schedule.</div></div>' +
          '<div style="padding:16px 0;border-bottom:1px solid var(--border);position:relative"><div style="position:absolute;left:-24px;top:20px;width:12px;height:12px;border:1px solid var(--gold);background:var(--bg)"></div><div style="font-size:10px;color:var(--gold);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px">Phase 2 &middot; Creation</div><div style="font-family:var(--font-display);font-size:18px;margin-bottom:4px">Content Production</div><div style="font-size:12px;color:var(--text-muted)">Photo shoots, video editing, copywriting, hashtag research. We create scroll-stopping content for every platform.</div></div>' +
          '<div style="padding:16px 0;border-bottom:1px solid var(--border);position:relative"><div style="position:absolute;left:-24px;top:20px;width:12px;height:12px;border:1px solid var(--gold);background:var(--bg)"></div><div style="font-size:10px;color:var(--gold);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px">Phase 3 &middot; Distribution</div><div style="font-family:var(--font-display);font-size:18px;margin-bottom:4px">Scheduling & Publishing</div><div style="font-size:12px;color:var(--text-muted)">Posts go live at peak engagement windows. Cross-platform distribution across IG, TikTok, FB, and LinkedIn.</div></div>' +
          '<div style="padding:16px 0;position:relative"><div style="position:absolute;left:-24px;top:20px;width:12px;height:12px;border:1px solid var(--gold);background:var(--gold-dim)"></div><div style="font-size:10px;color:var(--gold);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px">Phase 4 &middot; Growth</div><div style="font-family:var(--font-display);font-size:18px;margin-bottom:4px">Engagement & Reporting</div><div style="font-size:12px;color:var(--text-muted)">Community management, DM responses, comment engagement, and monthly analytics reports with actionable insights.</div></div>' +
        '</div></div>'
    },
    web: {
      title: 'Web Infrastructure',
      html: '<div style="padding:32px;text-align:center">' +
        '<div style="font-size:11px;color:var(--gold);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:20px">Live Demo Sites We Build</div>' +
        '<p style="font-size:13px;color:var(--text-muted);margin-bottom:24px">Click below to explore our interactive demo portfolio — each site is fully functional with working buttons, forms, and responsive design.</p>' +
        '<a href="#gallery" style="display:inline-block;padding:14px 32px;background:var(--gold);color:var(--bg);text-decoration:none;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;font-weight:500" onclick="document.getElementById(\'serviceModal\').classList.remove(\'active\');document.body.style.overflow=\'\'">View Demo Gallery</a>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:28px">' +
          '<a href="gallery-demo/gym-static.html" target="_blank" style="border:1px solid var(--border);padding:20px;text-align:left;text-decoration:none;color:var(--text);transition:border-color 0.3s" onmouseover="this.style.borderColor=\'rgba(201,169,110,0.4)\'" onmouseout="this.style.borderColor=\'\'"><div style="font-size:10px;color:var(--gold);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:6px">Static Sites</div><div style="font-family:var(--font-display);font-size:16px;margin-bottom:4px">Landing Pages</div><div style="font-size:12px;color:var(--text-muted)">View example: Iron Valley Fitness</div></a>' +
          '<a href="#gallery" style="border:1px solid var(--border);padding:20px;text-align:left;text-decoration:none;color:var(--text);transition:border-color 0.3s" onclick="document.getElementById(\'serviceModal\').classList.remove(\'active\');document.body.style.overflow=\'\'" onmouseover="this.style.borderColor=\'rgba(201,169,110,0.4)\'" onmouseout="this.style.borderColor=\'\'"><div style="font-size:10px;color:var(--gold);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:6px">E-Commerce</div><div style="font-family:var(--font-display);font-size:16px;margin-bottom:4px">Full Online Stores</div><div style="font-size:12px;color:var(--text-muted)">View demos in gallery</div></a>' +
        '</div></div>'
    },
    intel: {
      title: 'Consumer Intelligence',
      html: '<div style="padding:32px">' +
        '<div style="font-size:11px;color:var(--gold);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:20px;text-align:center">Example Survey Questions</div>' +
        '<div style="display:flex;flex-direction:column;gap:12px;margin-bottom:28px">' +
          '<div style="border:1px solid var(--border);padding:16px;display:flex;gap:16px;align-items:flex-start"><div style="flex-shrink:0;width:28px;height:28px;border:1px solid var(--gold-border);display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--gold)">1</div><div><div style="font-size:14px;margin-bottom:4px">How did you first hear about this business?</div><div style="font-size:11px;color:var(--gold)">Reveals: Channel attribution &amp; ad spend efficiency</div></div></div>' +
          '<div style="border:1px solid var(--border);padding:16px;display:flex;gap:16px;align-items:flex-start"><div style="flex-shrink:0;width:28px;height:28px;border:1px solid var(--gold-border);display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--gold)">2</div><div><div style="font-size:14px;margin-bottom:4px">What price range feels fair for this product?</div><div style="font-size:11px;color:var(--gold)">Reveals: Pricing sensitivity &amp; willingness to pay</div></div></div>' +
          '<div style="border:1px solid var(--border);padding:16px;display:flex;gap:16px;align-items:flex-start"><div style="flex-shrink:0;width:28px;height:28px;border:1px solid var(--gold-border);display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--gold)">3</div><div><div style="font-size:14px;margin-bottom:4px">What almost stopped you from purchasing?</div><div style="font-size:11px;color:var(--gold)">Reveals: Conversion blockers &amp; objection handling</div></div></div>' +
          '<div style="border:1px solid var(--border);padding:16px;display:flex;gap:16px;align-items:flex-start"><div style="flex-shrink:0;width:28px;height:28px;border:1px solid var(--gold-border);display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--gold)">4</div><div><div style="font-size:14px;margin-bottom:4px">Would you recommend us to a friend? Why or why not?</div><div style="font-size:11px;color:var(--gold)">Reveals: NPS score &amp; word-of-mouth potential</div></div></div>' +
        '</div>' +
        '<div style="text-align:center;font-size:12px;color:var(--text-muted);border-top:1px solid var(--border);padding-top:16px">Each question is mapped to a business outcome. We analyze responses and deliver actionable insights.</div></div>'
    },
    print: {
      title: 'Verified Print & Billboard',
      html: '<div style="padding:32px">' +
        '<div style="font-size:11px;color:var(--gold);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:20px;text-align:center">Example Campaign Assets</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">' +
          '<div style="border:1px solid var(--border);overflow:hidden"><img src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop&q=80" style="width:100%;height:180px;object-fit:cover;opacity:0.8" alt="Campaign poster"><div style="padding:12px"><div style="font-size:10px;color:var(--gold);letter-spacing:0.1em;text-transform:uppercase">Limited Time Offer</div><div style="font-size:13px;margin-top:4px">Grand opening billboard design</div></div></div>' +
          '<div style="border:1px solid var(--border);overflow:hidden"><img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop&q=80" style="width:100%;height:180px;object-fit:cover;opacity:0.8" alt="Print ad"><div style="padding:12px"><div style="font-size:10px;color:var(--gold);letter-spacing:0.1em;text-transform:uppercase">Seasonal Campaign</div><div style="font-size:13px;margin-top:4px">In-store promotional poster</div></div></div>' +
        '</div>' +
        '<div style="text-align:center;font-size:12px;color:var(--text-muted);border-top:1px solid var(--border);padding-top:16px">Every design is tested with a sample of your target demographic before print. Consistent branding increases revenue by 23%.</div></div>'
    },
    optimize: {
      title: 'Agile Ad Optimization',
      html: '<div style="padding:32px">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">' +
          '<div>' +
            '<div style="font-size:11px;color:var(--gold);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:16px">Live Ad Monitor</div>' +
            '<div style="border:2px solid rgba(201,169,110,0.2);border-radius:12px;overflow:hidden;margin-bottom:12px;position:relative;background:#0a0a09">' +
              '<div style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:40px;height:10px;background:#0a0a09;border-radius:0 0 8px 8px;z-index:2"></div>' +
              '<video controls playsinline style="width:100%;height:220px;object-fit:cover;display:block"><source src="https://assets.mixkit.co/videos/preview/mixkit-woman-filming-herself-reviewing-a-product-42379-large.mp4" type="video/mp4"></video>' +
            '</div>' +
            '<div style="font-family:var(--font-display);font-size:16px;margin-bottom:4px">Ad Variant: "Summer Drop"</div>' +
            '<div style="font-size:12px;color:var(--text-muted)">Running since 3 days ago &middot; $420 spent</div>' +
          '</div>' +
          '<div>' +
            '<div style="font-size:11px;color:var(--gold);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:16px">Real-Time Analysis</div>' +
            '<div style="display:flex;flex-direction:column;gap:8px">' +
              '<div style="border:1px solid var(--border);padding:12px;display:flex;justify-content:space-between"><span style="font-size:12px;color:var(--text-muted)">Click-Through Rate</span><span style="color:#5cb97a;font-size:13px">4.2% &uarr;</span></div>' +
              '<div style="border:1px solid var(--border);padding:12px;display:flex;justify-content:space-between"><span style="font-size:12px;color:var(--text-muted)">Cost Per Acquisition</span><span style="color:#5cb97a;font-size:13px">$8.40 &darr;</span></div>' +
              '<div style="border:1px solid var(--border);padding:12px;display:flex;justify-content:space-between"><span style="font-size:12px;color:var(--text-muted)">ROAS</span><span style="color:#5cb97a;font-size:13px">5.2x &uarr;</span></div>' +
              '<div style="border:1px solid var(--border);padding:12px;display:flex;justify-content:space-between"><span style="font-size:12px;color:var(--text-muted)">Ad Recall Lift</span><span style="color:#5cb97a;font-size:13px">+12% &uarr;</span></div>' +
              '<div style="border:1px solid var(--border);padding:12px"><div style="font-size:10px;color:var(--gold);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:6px">Comment Sentiment</div><div style="display:flex;gap:8px"><span style="font-size:11px;padding:3px 8px;border:1px solid rgba(92,185,122,0.3);color:#5cb97a">Positive 78%</span><span style="font-size:11px;padding:3px 8px;border:1px solid var(--border);color:var(--text-muted)">Neutral 18%</span><span style="font-size:11px;padding:3px 8px;border:1px solid rgba(201,110,110,0.3);color:#c96e6e">Negative 4%</span></div></div>' +
              '<div style="border:1px solid rgba(201,169,110,0.2);padding:12px;background:var(--gold-dim)"><div style="font-size:10px;color:var(--gold);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px">Recommendation</div><div style="font-size:12px;color:var(--text)">Scale budget +30% — this variant is outperforming benchmarks. Rotate face in 4 days to prevent fatigue.</div></div>' +
            '</div>' +
          '</div>' +
        '</div></div>'
    }
  };

  document.querySelectorAll('[data-service]').forEach(function (card) {
    card.addEventListener('click', function () {
      var key = card.getAttribute('data-service');
      var data = serviceData[key];
      if (!data || !serviceModal || !serviceContent) return;
      serviceContent.innerHTML = '<div class="modal-header"><h3>' + data.title + '</h3></div><div class="modal-body" style="padding:0">' + data.html + '</div>';
      serviceModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  if (serviceModal) {
    serviceModal.addEventListener('click', function (e) {
      if (e.target === serviceModal) {
        serviceModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  /* ═══════════════════════════════════════════
     TOAST NOTIFICATION SYSTEM
     ═══════════════════════════════════════════ */
  window.showToast = function (message, duration) {
    duration = duration || 3000;
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: var(--surface-2);
      border: 1px solid var(--gold-border);
      color: var(--text);
      padding: 14px 28px;
      font-size: 13px;
      font-family: var(--font-body);
      z-index: 10000;
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => toast.remove(), 400);
    }, duration);
  };
})();
