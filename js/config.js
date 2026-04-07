/* ═══════════════════════════════════════════════
   VANTA SOCIALS — Backend Configuration

   SETUP INSTRUCTIONS:

   1. FORMSPREE (email notifications):
      - Go to https://formspree.io and create a free account
      - Create a new form, copy the endpoint URL
      - Paste it below as FORMSPREE_URL
      - Free tier: 50 submissions/month

   2. GOOGLE SHEETS (spreadsheet logging):
      - Create a Google Sheet
      - Go to Extensions > Apps Script
      - Paste the code from google-apps-script.js (in this folder)
      - Deploy as Web App (execute as you, anyone can access)
      - Copy the deployment URL and paste below as GOOGLE_SHEET_URL

   3. STRIPE (payments):
      - Go to https://dashboard.stripe.com/payment-links
      - Create Payment Links for each tier
      - Paste the URLs below

   4. CALENDLY (scheduling):
      - Go to https://calendly.com and create an event type
      - Paste your scheduling link below

   ═══════════════════════════════════════════════ */

window.VANTA_CONFIG = {

  // ── FORM ENDPOINTS ──
  // Set these to receive form submissions
  FORMSPREE_URL: null,        // e.g. 'https://formspree.io/f/xyzabc'
  GOOGLE_SHEET_URL: null,     // e.g. 'https://script.google.com/macros/s/xxxxx/exec'

  // ── STRIPE PAYMENT LINKS ──
  STRIPE_TIER1: null,         // e.g. 'https://buy.stripe.com/xxx'
  STRIPE_TIER2: null,
  STRIPE_TIER3: null,

  // ── CALENDLY ──
  CALENDLY_URL: null,         // e.g. 'https://calendly.com/your-name/strategy-call'

  // ── CONTACT ──
  EMAIL: 'hello@vantasocials.com',
  PHONE: '',
};
