// src/services/integrations/slack.js
const { WebClient } = require('@slack/web-api');
const token = process.env.SLACK_BOT_TOKEN;
const client = token ? new WebClient(token) : null;

async function postMessage({ channel, text }) {
  if (!client) throw new Error('SLACK_BOT_TOKEN not set');
  const res = await client.chat.postMessage({ channel, text });
  return { ok: res.ok, ts: res.ts };
}

module.exports = { postMessage };