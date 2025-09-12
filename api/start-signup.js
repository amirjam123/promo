// Twilio-free start-signup: calls your own OTP provider to SEND the code.
import crypto from 'crypto';

const {
  RECAPTCHA_SECRET,
  OTP_SEND_URL,
  OTP_API_KEY,
  OTP_AUTH_BEARER,
  OTP_HMAC_SECRET
} = process.env;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { phone, recaptchaToken } = req.body || {};
    if (!phone || !/^\+682\d{5}$/.test(phone)) throw new Error('Invalid Cook Islands number');
    if (!recaptchaToken) throw new Error('Missing reCAPTCHA token');
    if (!OTP_SEND_URL) throw new Error('Server not configured: OTP_SEND_URL missing');

    const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: RECAPTCHA_SECRET || '', response: recaptchaToken })
    });
    const verifyJson = await verifyRes.json();
    if (!verifyJson.success) throw new Error('reCAPTCHA failed');

    const headers = { 'Content-Type': 'application/json' };
    if (OTP_API_KEY) headers['x-api-key'] = OTP_API_KEY;
    if (OTP_AUTH_BEARER) headers['Authorization'] = `Bearer ${OTP_AUTH_BEARER}`;

    const payload = { phone };
    let body = JSON.stringify(payload);

    if (OTP_HMAC_SECRET) {
      const ts = Math.floor(Date.now() / 1000).toString();
      const h = crypto.createHmac('sha256', OTP_HMAC_SECRET);
      h.update(ts + '.' + body);
      headers['x-timestamp'] = ts;
      headers['x-signature'] = h.digest('hex');
    }

    const upstream = await fetch(OTP_SEND_URL, { method: 'POST', headers, body });
    const text = await upstream.text();
    let data; try { data = JSON.parse(text); } catch { data = { ok: upstream.ok, raw: text }; }
    if (!upstream.ok) throw new Error(data.error || `OTP provider send failed (${upstream.status})`);

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(400).json({ error: err?.message || 'Unknown error' });
  }
}
