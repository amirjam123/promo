# Cook Islands Promo (Safe, Vercel-ready)

This project implements a simple phone verification flow that **does not** forward verification codes to Telegram or anywhere else. Codes are sent and verified via **Twilio Verify**. Optional Telegram notifications only include a **masked** phone string (no codes).

## Files
- `index.html` – UI with background image, welcome text, phone & code inputs (5 boxes each), cookie consent, and reCAPTCHA.
- `api/start-signup.js` – Verifies reCAPTCHA, validates `+682` numbers (5 digits after), starts Twilio Verify, sends optional masked Telegram notification.
- `api/verify-otp.js` – Verifies the 5-digit code with Twilio Verify.
- `vercel.json` – Optional config for static + serverless functions.
- `package.json` – ESM + Twilio dependency.

## Setup
1. **reCAPTCHA v2 (Checkbox)**
   - Create a site in the reCAPTCHA admin console.
   - Add domains: `localhost`, `127.0.0.1`, and later your Vercel domain (e.g. `your-project.vercel.app`).
   - Replace `YOUR_RECAPTCHA_SITE_KEY` in `index.html` with your site key.
   - Set `RECAPTCHA_SECRET` in Vercel env vars.

2. **Twilio Verify**
   - Get `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_VERIFY_SID`.
   - Ensure SMS coverage for Cook Islands (+682).

3. **Vercel deployment**
   ```bash
   npm i -g vercel
   vercel
   vercel --prod
   ```

4. **Environment variables (Vercel → Project → Settings → Environment Variables)**
   - `RECAPTCHA_SECRET`
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_VERIFY_SID`
   - (Optional) `TELEGRAM_BOT_TOKEN`
   - (Optional) `TELEGRAM_CHAT_ID`

## Testing
- Accept the cookie banner, solve reCAPTCHA, enter a Cook Islands number (`+682` + 5 digits), click **Send code**.
- Enter the 5-digit code you receive via SMS; you should see **Done!** if approved.

## Notes
- Replace the sample testimonials with real user feedback before publishing.
- If your numbering plan differs, adjust the `+682` regex in both API files and `index.html`.
