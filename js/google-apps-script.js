/*
 * GOOGLE APPS SCRIPT — Paste this into your Google Sheet's Apps Script editor
 *
 * SETUP:
 * 1. Create a new Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Delete the default code and paste this entire file
 * 4. Click Deploy > New Deployment
 * 5. Type: Web App
 * 6. Execute as: Me
 * 7. Who has access: Anyone
 * 8. Click Deploy, copy the URL
 * 9. Paste the URL into js/config.js as GOOGLE_SHEET_URL
 *
 * TWILIO SMS SETUP (optional):
 * 1. Sign up at https://www.twilio.com (free trial = $15 credit)
 * 2. Get a Twilio phone number from the console
 * 3. Find your Account SID and Auth Token on the dashboard
 * 4. Fill in the TWILIO config below
 * 5. Re-deploy the Apps Script
 *
 * The sheet will auto-create tabs for each form type:
 * - "Consultations" for booking form submissions
 * - "Questionnaires" for pre-consultation questionnaire
 */

// ═══ TWILIO CONFIG — Fill these in ═══
var TWILIO_ENABLED = false; // Set to true once you have credentials
var TWILIO_SID = '';        // e.g. 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
var TWILIO_AUTH = '';        // e.g. 'your_auth_token_here'
var TWILIO_FROM = '';        // Your Twilio number e.g. '+15551234567'
var TWILIO_TO = '';          // Your personal number to receive alerts e.g. '+15559876543'

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = data._formType || 'Submissions';

    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      if (sheetName === 'Consultations') {
        sheet.appendRow(['Timestamp', 'Name', 'Email', 'Phone', 'Business', 'Interest', 'Message', 'Questionnaire Done']);
      } else if (sheetName === 'Questionnaires') {
        sheet.appendRow(['Timestamp', 'Business Name', 'Industry', 'Website', 'Revenue', 'Ad Budget', 'Goals', 'Channels', 'Challenge', 'Audience', 'Timeline', 'Prev Agency', 'Full Name', 'Email', 'Phone', 'Notes']);
      } else {
        sheet.appendRow(['Timestamp', 'Data']);
      }
      // Bold the header row
      sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight('bold');
    }

    var timestamp = new Date().toLocaleString();

    if (sheetName === 'Consultations') {
      sheet.appendRow([
        timestamp,
        data.name || '',
        data.email || '',
        data.phone || '',
        data.business || '',
        data.interest || '',
        data.message || '',
        data.questionnaireDone || 'No'
      ]);

      // Send SMS notification for new consultation booking
      if (TWILIO_ENABLED) {
        sendSMS('New consultation booking from ' + (data.name || 'Unknown') +
          ' (' + (data.business || 'No business') + '). ' +
          'Email: ' + (data.email || 'N/A') +
          ', Phone: ' + (data.phone || 'N/A') +
          ', Interest: ' + (data.interest || 'N/A'));
      }

    } else if (sheetName === 'Questionnaires') {
      sheet.appendRow([
        timestamp,
        data.businessName || '',
        data.industry || '',
        data.website || '',
        data.revenue || '',
        data.adBudget || '',
        Array.isArray(data.goals) ? data.goals.join(', ') : (data.goals || ''),
        Array.isArray(data.channels) ? data.channels.join(', ') : (data.channels || ''),
        data.challenge || '',
        data.audience || '',
        data.timeline || '',
        data.prevAgency || '',
        data.fullName || '',
        data.email || '',
        data.phone || '',
        data.notes || ''
      ]);

      // Send SMS notification for completed questionnaire
      if (TWILIO_ENABLED) {
        sendSMS('New questionnaire completed by ' + (data.fullName || 'Unknown') +
          ' (' + (data.businessName || 'No business') + '). ' +
          'Industry: ' + (data.industry || 'N/A') +
          ', Revenue: ' + (data.revenue || 'N/A') +
          ', Timeline: ' + (data.timeline || 'N/A'));
      }

    } else {
      sheet.appendRow([timestamp, JSON.stringify(data)]);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Send SMS via Twilio API
 * Called server-side from Apps Script (credentials stay safe)
 */
function sendSMS(message) {
  if (!TWILIO_SID || !TWILIO_AUTH || !TWILIO_FROM || !TWILIO_TO) return;

  var url = 'https://api.twilio.com/2010-04-01/Accounts/' + TWILIO_SID + '/Messages.json';

  var options = {
    method: 'post',
    headers: {
      'Authorization': 'Basic ' + Utilities.base64Encode(TWILIO_SID + ':' + TWILIO_AUTH)
    },
    payload: {
      'To': TWILIO_TO,
      'From': TWILIO_FROM,
      'Body': '[Vanta Socials] ' + message
    },
    muteHttpExceptions: true
  };

  try {
    UrlFetchApp.fetch(url, options);
  } catch (err) {
    Logger.log('Twilio SMS error: ' + err.toString());
  }
}

/**
 * Test function — run this manually to verify Twilio works
 * Go to Apps Script editor > Select testSMS > Click Run
 */
function testSMS() {
  sendSMS('Test notification from Vanta Socials. If you see this, Twilio is working!');
  Logger.log('Test SMS sent to ' + TWILIO_TO);
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Vanta Socials form endpoint active' }))
    .setMimeType(ContentService.MimeType.JSON);
}
