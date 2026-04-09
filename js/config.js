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

   5. TWILIO (SMS notifications):
      - Sign up at https://www.twilio.com (free trial gives you $15 credit)
      - Get a Twilio phone number
      - Copy your Account SID and Auth Token from the dashboard
      - IMPORTANT: Twilio API requires server-side auth — you CANNOT call
        Twilio directly from the browser (exposes your auth token).
        Instead, the Google Apps Script acts as a proxy.
      - Set TWILIO_ENABLED = true and fill in the details below
      - Then update your Google Apps Script with the Twilio section
        (see google-apps-script.js for instructions)

   ═══════════════════════════════════════════════ */

window.VANTA_CONFIG = {

  // ── FORM ENDPOINTS ──
  FORMSPREE_URL: 'https://formspree.io/f/xdapvzdd',
  GOOGLE_SHEET_URL: 'https://script.google.com/macros/s/AKfycbyyfsC36y1kTp2L_kVwXTE9zClhhIa7EHvF_nL5kimB9ufneaJhX80zTfIA-ekrsf_nvw/exec',

  // ── STRIPE PAYMENT LINKS ──
  STRIPE_TIER1: null,         // e.g. 'https://buy.stripe.com/xxx'
  STRIPE_TIER2: null,
  STRIPE_TIER3: null,

  // ── CALENDLY ──
  CALENDLY_URL: 'https://calendly.com/natenterprisesllc/30min',

  // ── TWILIO (configured in Google Apps Script, not here) ──
  // SMS notifications are sent server-side via Google Apps Script
  // to keep your Twilio credentials safe. See google-apps-script.js.

  // ── QUESTIONNAIRE GATE ──
  // If true, users must complete the questionnaire before booking
  REQUIRE_QUESTIONNAIRE: true,

  // ── CONTACT ──
  EMAIL: 'contact@vantacreatives.com',
  PHONE: '',
};
