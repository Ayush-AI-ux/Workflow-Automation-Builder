// src/services/integrations/gmail.js
const { google } = require('googleapis');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN; // you should obtain and store this for your test account

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
if (REFRESH_TOKEN) oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail({ to, subject, body, from }) {
  if (!REFRESH_TOKEN) throw new Error('GOOGLE_REFRESH_TOKEN not set in .env for Gmail use');
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  const raw = makeBody(to, from || 'me', subject, body);
  const res = await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
  return { ok: true, id: res.data.id };
}

function makeBody(to, from, subject, message) {
  const str = [
    `To: ${to}`,
    `From: ${from}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    message
  ].join('\n');

  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

module.exports = { sendMail };