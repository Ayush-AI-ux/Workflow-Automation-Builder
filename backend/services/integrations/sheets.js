// // src/services/integrations/sheets.js
// const { google } = require('googleapis');

// const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
// const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

// const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
// if (REFRESH_TOKEN) oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// async function appendRow({ spreadsheetId, range, values }) {
//   if (!REFRESH_TOKEN) throw new Error('GOOGLE_REFRESH_TOKEN not set');
//   const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });
//   const res = await sheets.spreadsheets.values.append({
//     spreadsheetId,
//     range,
//     valueInputOption: 'USER_ENTERED',
//     requestBody: { values: [values] }
//   });
//   return { updatedRange: res.data.updates.updatedRange };
// }

// module.exports = { appendRow };


// src/services/integrations/sheets.js


// const { google } = require('googleapis');

// const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
// const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

// const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
// if (REFRESH_TOKEN) oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// async function appendRow({ spreadsheetId, range, values }) {
//   console.log('📊 Sheets appendRow called:');
//   console.log('   Spreadsheet ID:', spreadsheetId);
//   console.log('   Range:', range);
//   console.log('   Values:', values);
//   console.log('   Values type:', Array.isArray(values) ? 'array' : typeof values);
  
//   if (!REFRESH_TOKEN) throw new Error('GOOGLE_REFRESH_TOKEN not set');
  
//   const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });
  
//   // Ensure values is properly formatted as 2D array
//   // If values is ['a', 'b', 'c'], wrap it: [['a', 'b', 'c']]
//   // If values is already [['a', 'b', 'c']], keep it as is
//   const valuesArray = Array.isArray(values[0]) ? values : [values];
  
//   console.log('   Formatted values for API:', valuesArray);
  
//   const res = await sheets.spreadsheets.values.append({
//     spreadsheetId,
//     range, // Sheet name only, e.g., "Workflow-Test"
//     valueInputOption: 'USER_ENTERED',
//     insertDataOption: 'INSERT_ROWS',
//     requestBody: { 
//       values: valuesArray 
//     }
//   });
  
//   console.log('   ✅ API Response:', {
//     updatedRange: res.data.updates.updatedRange,
//     updatedRows: res.data.updates.updatedRows,
//     updatedColumns: res.data.updates.updatedColumns
//   });
  
//   return { 
//     updatedRange: res.data.updates.updatedRange,
//     updatedRows: res.data.updates.updatedRows,
//     updatedColumns: res.data.updates.updatedColumns
//   };
// }

// module.exports = { appendRow };

//Version3
// src/services/integrations/sheets.js
// src/services/integrations/sheets.js
// const { google } = require('googleapis');

// const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
// const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

// const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
// if (REFRESH_TOKEN) oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// async function appendRow({ spreadsheetId, range, values }) {
//   console.log('📊 Sheets appendRow called:');
//   console.log('   Spreadsheet ID:', spreadsheetId);
//   console.log('   Range:', range);
//   console.log('   Values:', values);
//   console.log('   Values type:', Array.isArray(values) ? 'array' : typeof values);
  
//   if (!REFRESH_TOKEN) throw new Error('GOOGLE_REFRESH_TOKEN not set');
  
//   const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });
  
//   // Ensure values is properly formatted as 2D array
//   // If values is ['a', 'b', 'c'], wrap it: [['a', 'b', 'c']]
//   // If values is already [['a', 'b', 'c']], keep it as is
//   const valuesArray = Array.isArray(values[0]) ? values : [values];
  
//   console.log('   Formatted values for API:', valuesArray);
  
//   // CRITICAL FIX: Format range for append operation
//   // For sheets with special characters (hyphens, spaces), use: 'Sheet-Name'!A:A
//   // For simple sheets, use: Sheet1!A:A
//   let formattedRange;
//   if (range.includes('-') || range.includes(' ') || /[^a-zA-Z0-9_]/.test(range)) {
//     // Wrap sheet name in quotes and add column reference
//     formattedRange = `'${range}'!A:A`;
//     console.log('   Sheet name has special characters, formatted range:', formattedRange);
//   } else {
//     // Simple sheet name, just add column reference
//     formattedRange = `${range}!A:A`;
//     console.log('   Simple sheet name, formatted range:', formattedRange);
//   }
  
//   const res = await sheets.spreadsheets.values.append({
//     spreadsheetId,
//     range: formattedRange, // e.g., "'Workflow-Test'!A:A" or "Sheet1!A:A"
//     valueInputOption: 'USER_ENTERED',
//     insertDataOption: 'INSERT_ROWS',
//     requestBody: { 
//       values: valuesArray 
//     }
//   });
  
//   console.log('   ✅ API Response:', {
//     updatedRange: res.data.updates.updatedRange,
//     updatedRows: res.data.updates.updatedRows,
//     updatedColumns: res.data.updates.updatedColumns
//   });
  
//   return { 
//     updatedRange: res.data.updates.updatedRange,
//     updatedRows: res.data.updates.updatedRows,
//     updatedColumns: res.data.updates.updatedColumns
//   };
// }

// module.exports = { appendRow };


// src/services/integrations/sheets.js
const { google } = require('googleapis');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
if (REFRESH_TOKEN) oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function appendRow({ spreadsheetId, range, values }) {
  console.log('📊 Sheets appendRow called:');
  console.log('   Spreadsheet ID:', spreadsheetId);
  console.log('   Range (sheet name):', range);
  console.log('   Values:', values);
  
  if (!REFRESH_TOKEN) throw new Error('GOOGLE_REFRESH_TOKEN not set');
  
  const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });
  
  // Ensure values is 2D array
  const valuesArray = Array.isArray(values[0]) ? values : [values];
  console.log('   Formatted values:', valuesArray);
  
  // Try different range formats
  const sheetName = range || 'Sheet1';
  const rangeFormats = [
    sheetName,                    // "Sheet1" or "Workflow-Test"
    `${sheetName}!A1`,            // "Sheet1!A1"
    `'${sheetName}'`,             // "'Workflow-Test'"
    `'${sheetName}'!A1`           // "'Workflow-Test'!A1"
  ];
  
  let lastError;
  for (const tryRange of rangeFormats) {
    try {
      console.log('   Trying range format:', tryRange);
      
      const res = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: tryRange,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { 
          values: valuesArray 
        }
      });
      
      console.log('   ✅ SUCCESS with range format:', tryRange);
      console.log('   Updated range:', res.data.updates.updatedRange);
      console.log('   Updated rows:', res.data.updates.updatedRows);
      
      return { 
        updatedRange: res.data.updates.updatedRange,
        updatedRows: res.data.updates.updatedRows,
        updatedColumns: res.data.updates.updatedColumns
      };
    } catch (error) {
      console.log('   ❌ Failed with range:', tryRange, '- Error:', error.message);
      lastError = error;
      continue;
    }
  }
  
  // If all formats failed, throw the last error
  throw lastError;
}

module.exports = { appendRow };