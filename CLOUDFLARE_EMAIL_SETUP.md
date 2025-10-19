# Cloudflare Email Routing Setup

To make `legal@hastheaibubblepoppedyet.com` work and forward to your personal email:

## Steps:

1. **Go to Cloudflare Dashboard**
   - Navigate to your domain: `hastheaibubblepoppedyet.com`

2. **Enable Email Routing**
   - Click on **Email** in the left sidebar
   - Click **Email Routing**
   - Click **Get started** (if not already enabled)

3. **Add Destination Address**
   - Under "Destination addresses"
   - Click **Add destination address**
   - Enter your personal email (e.g., `jakob.repp@gmail.com`)
   - Cloudflare will send a verification email
   - Click the verification link in that email

4. **Create Routing Rule**
   - Under "Routing rules"
   - Click **Create address**
   - **Custom address**: `legal`
   - **Action**: Forward to your verified email address
   - Click **Save**

5. **Verify DNS Records**
   - Cloudflare should automatically add necessary MX and TXT records
   - These will be visible in the DNS section
   - Make sure they're enabled (orange cloud)

## Testing:

Once set up, send a test email to `legal@hastheaibubblepoppedyet.com` to verify it forwards to your personal email.

## Benefits:

- ✅ Your personal email stays private
- ✅ Professional contact address for legal purposes
- ✅ Free (included with Cloudflare)
- ✅ Can add catch-all rules later if needed
- ✅ Spam filtering included

## Notes:

- Email routing is **receive-only** (you can't send FROM this address without additional setup)
- Sufficient for Impressum legal requirements
- Can add multiple forwarding addresses if needed
