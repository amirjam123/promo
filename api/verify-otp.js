// pages/api/verify-otp.js or /api/verify-otp.js
// Purpose: check the SMS code using Twilio Verify. Do NOT forward codes anywhere.

import Twilio from 'twilio';

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SID } = process.env;
const twilio = (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN)
  ? Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
  : null;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { phone, code } = req.body || {};
    if (!phone || !/^\+682\d{5}$/.test(phone)) throw new Error('Invalid number');
    if (!code || !/^\d{5}$/.test(code)) throw new Error('Invalid code');
    if (!twilio || !TWILIO_VERIFY_SID) throw new Error('Twilio not configured');

    const result = await twilio.verify.v2.services(TWILIO_VERIFY_SID).verificationChecks.create({ to: phone, code });
    if (result.status !== 'approved') throw new Error('Code not approved');

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(400).json({ error: err?.message || 'Unknown error' });
  }
}
