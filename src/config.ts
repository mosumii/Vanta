// ═══ Vanta Creatives — Configuration ═══
// Public-facing URLs only. NEVER put secret keys here.

export const CONFIG = {
  // Formspree contact form (email notifications)
  FORMSPREE_URL: 'https://formspree.io/f/xdapvzdd',

  // Google Sheets backend (lead logging + Twilio SMS proxy)
  GOOGLE_SHEET_URL: 'https://script.google.com/macros/s/AKfycbyyfsC36y1kTp2L_kVwXTE9zClhhIa7EHvF_nL5kimB9ufneaJhX80zTfIA-ekrsf_nvw/exec',

  // Stripe Payment Links (public checkout URLs)
  STRIPE_TIER1: '',
  STRIPE_TIER2: '',
  STRIPE_TIER3: '',

  // Calendly booking
  CALENDLY_URL: 'https://calendly.com/natenterprisesllc/30min',

  // Questionnaire gate (if true, must complete questionnaire before booking)
  REQUIRE_QUESTIONNAIRE: false,

  // Contact
  EMAIL: 'contact@vantacreatives.com',
  PHONE: '',
} as const
