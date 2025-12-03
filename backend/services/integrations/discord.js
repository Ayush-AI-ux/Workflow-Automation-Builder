// // src/services/integrations/discord.js
// const axios = require('axios');
// const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

// async function postMessage({ content }) {
//   if (!webhookUrl) throw new Error('DISCORD_WEBHOOK_URL not set');
//   const res = await axios.post(webhookUrl, { content });
//   return { status: res.status };
// }

// module.exports = { postMessage };

// src/services/integrations/discord.js
const axios = require('axios');
const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

async function postMessage({ content }) {
  try {
    if (!webhookUrl) throw new Error('DISCORD_WEBHOOK_URL not set');
    if (!content) throw new Error('Content message missing');

    const payload = {
      content: content.toString(),
      username: 'Workflow Automation Builder',
    };

    const res = await axios.post(webhookUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    return { status: res.status, message: 'Sent to Discord successfully' };
  } catch (err) {
    console.error('Discord Webhook Error:', err.response?.data || err.message);
    throw new Error(
      err.response?.data?.message || 'Discord webhook request failed'
    );
  }
}

module.exports = { postMessage };