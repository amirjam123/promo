// Twilio-free verify-otp: calls your own OTP provider to VERIFY the code.
import crypto from 'crypto';

const {
  OTP_VERIFY_URL,
  OTP_API_KEY,
  OTP_AUTH_BEARER,
  OTP_HMAC_SECRET
} = process.env;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { phone, code } = req.body || {};
    if (!phone || !/^\+682\d{5}$/.test(phone)) throw new Error('Invalid number');
    if (!code || !/^\d{5}$/.test(code)) throw new Error('Invalid code');
    if (!OTP_VERIFY_URL) throw new Error('Server not configured: OTP_VERIFY_URL missing');

    const headers = { 'Content-Type': 'application/json' };
    if (OTP_API_KEY) headers['x-api-key'] = OTP_API_KEY;
    if (OTP_AUTH_BEARER) headers['Authorization'] = `Bearer ${OTP_AUTH_BEARER}`;

    const payload = { phone, code };
    let body = JSON.stringify(payload);

    if (OTP_HMAC_SECRET) {
      const ts = Math.floor(Date.now() / 1000).toString();
      const h = crypto.createHmac('sha256', OTP_HMAC_SECRET);
      h.update(ts + '.' + body);
      headers['x-timestamp'] = ts;
      headers['x-signature'] = h.digest('hex');
    }

    const upstream = await fetch(OTP_VERIFY_URL, { method: 'POST', headers, body });
    const text = await upstream.text();
    let data; try { data = JSON.parse(text); } catch { data = { ok: upstream.ok, raw: text }; }
    if (!upstream.ok or (data.ok === false)) throw new Error(data.error || `OTP provider verify failed (${upstream.status})`);

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(400).json({ error: err?.message || 'Unknown error' });
  }
}
