/**
 * Paste this into script.google.com (or Extensions > Apps Script
 * from inside a Google Sheet). It receives the date-plan answers
 * from the website and appends them as a new row.
 *
 * SETUP
 * 1. Create a new Google Sheet. Add a header row if you like:
 *    Timestamp | Vibe | Food | Activity | Time | Date
 * 2. In that Sheet, go to Extensions > Apps Script.
 * 3. Delete any starter code and paste this whole file in.
 * 4. Click Deploy > New deployment.
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Click Deploy, authorize it, then copy the "Web app URL".
 * 6. Paste that URL into SHEET_WEB_APP_URL in script.js.
 */

function doPost(e) {

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),
    data.vibe || "",
    data.food || "",
    data.activity || "",
    data.time || "",
    data.date || ""
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ result: "success" }))
    .setMimeType(ContentService.MimeType.JSON);

}
