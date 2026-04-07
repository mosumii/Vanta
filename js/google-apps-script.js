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
 * The sheet will auto-create tabs for each form type:
 * - "Consultations" for booking form submissions
 * - "Questionnaires" for pre-consultation questionnaire
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = data._formType || 'Submissions';

    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      // Add headers based on form type
      if (sheetName === 'Consultations') {
        sheet.appendRow(['Timestamp', 'Name', 'Email', 'Phone', 'Business', 'Interest', 'Message']);
      } else if (sheetName === 'Questionnaires') {
        sheet.appendRow(['Timestamp', 'Business Name', 'Industry', 'Website', 'Revenue', 'Ad Budget', 'Goals', 'Channels', 'Challenge', 'Audience', 'Timeline', 'Prev Agency', 'Full Name', 'Email', 'Phone', 'Notes']);
      } else {
        sheet.appendRow(['Timestamp', 'Data']);
      }
    }

    var timestamp = new Date().toISOString();

    if (sheetName === 'Consultations') {
      sheet.appendRow([
        timestamp,
        data.name || '',
        data.email || '',
        data.phone || '',
        data.business || '',
        data.interest || '',
        data.message || ''
      ]);
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

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Vanta Socials form endpoint active' }))
    .setMimeType(ContentService.MimeType.JSON);
}
