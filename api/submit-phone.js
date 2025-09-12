// Submit phone: verifies reCAPTCHA, then sends the phone to Telegram
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { phone, recaptchaToken } = req.body || {};
    if (!phone || !/^\+682\d{5}$/.test(phone)) throw new Error('Invalid number');
    if (!recaptchaToken) throw new Error('Missing reCAPTCHA token');
    const { RECAPTCHA_SECRET, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
    if (!RECAPTCHA_SECRET) throw new Error('Missing RECAPTCHA_SECRET');
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) throw new Error('Telegram not configured');

    // verify recaptcha
    const verify = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: RECAPTCHA_SECRET, response: recaptchaToken })
    });
    const vjson = await verify.json();
    if (!vjson.success) throw new Error('reCAPTCHA failed');

    // send to Telegram
    const text = `New number: ${phone}`;
    const tg = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text })
    });
    if (!tg.ok) throw new Error('Telegram request failed');

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(400).json({ error: err?.message || 'Unknown error' });
  }
}
