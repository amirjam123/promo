// pages/api/start-signup.js or /api/start-signup.js (Vercel functions)
// Purpose: verify reCAPTCHA, validate a Cook Islands number, start SMS verification via Twilio Verify,
// and optionally send a non-sensitive Telegram notification (masked phone).

import Twilio from 'twilio';

const {
  RECAPTCHA_SECRET,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_VERIFY_SID,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID
} = process.env;

const twilio = (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN)
  ? Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
  : null;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { phone, recaptchaToken } = req.body || {};
    if (!phone || !/^\+682\d{5}$/.test(phone)) throw new Error('Invalid Cook Islands number');
    if (!recaptchaToken) throw new Error('Missing reCAPTCHA token');

    // Verify reCAPTCHA v2/v3 server-side using global fetch (Node 18+)
    const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: RECAPTCHA_SECRET || '', response: recaptchaToken })
    });
    const verifyJson = await verifyRes.json();
    if (!verifyJson.success) throw new Error('reCAPTCHA failed');

    if (!twilio || !TWILIO_VERIFY_SID) throw new Error('Twilio not configured');

    // Start Twilio Verify (sends code to the phone)
    await twilio.verify.v2.services(TWILIO_VERIFY_SID).verifications.create({ to: phone, channel: 'sms' });

    // Optional: Telegram notification (NO verification codes, only masked phone)
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const masked = phone.replace(/(\+682)\d{2}(\d{3})/, '$1**$2');
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: `New opt-in: ${masked}` })
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(400).json({ error: err?.message || 'Unknown error' });
  }
}
