# Deployment Guide

This guide covers deploying the Learning Platform to production.

**Domain**: berekettadesse.com
**Client**: Vercel
**Server**: Railway
**Database**: Supabase

---

## Prerequisites

1. GitHub repository with your code pushed
2. Accounts on: Vercel, Railway, Supabase, Stripe, Resend
3. Domain registered on Namecheap

---

## Step 1: Prepare Production Secrets

### Generate New Secrets
```bash
# Generate BETTER_AUTH_SECRET (64 characters)
openssl rand -hex 32

# Generate JWT_SECRET (64 characters)
openssl rand -hex 32
```

### Rotate Supabase Password
1. Go to Supabase Dashboard → Settings → Database
2. Click "Reset database password"
3. Copy the new connection string

---

## Step 2: Deploy Client to Vercel

### 2.1 Import Project
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Set **Root Directory** to `client`

### 2.2 Configure Build Settings
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### 2.3 Add Environment Variables
Add these in Vercel's Environment Variables section:

```
DATABASE_URL=<your-new-supabase-url>
DIRECT_URL=<your-new-supabase-direct-url>
BETTER_AUTH_SECRET=<generated-secret>
BETTER_AUTH_URL=https://berekettadesse.com
NEXT_PUBLIC_API_URL=https://api.berekettadesse.com/api
NEXT_PUBLIC_APP_URL=https://berekettadesse.com
RESEND_API_KEY=<your-resend-api-key>
FROM_EMAIL=noreply@berekettadesse.com
STRIPE_SECRET_KEY=<your-stripe-live-secret-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your-stripe-live-publishable-key>
```

### 2.4 Deploy
Click "Deploy" and wait for build to complete.

### 2.5 Add Custom Domain
1. Go to Project Settings → Domains
2. Add `berekettadesse.com`
3. Add `www.berekettadesse.com`
4. Vercel will show DNS records to configure

---

## Step 3: Deploy Server to Railway

### 3.1 Create Project
1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository

### 3.2 Configure Service
1. Click on the deployed service
2. Go to Settings → Root Directory: `server`
3. Set Build Command: `npm run build`
4. Set Start Command: `npm run start`

### 3.3 Add Environment Variables
In Railway's Variables tab:

```
PORT=4000
NODE_ENV=production
DATABASE_URL=<your-new-supabase-url>
JWT_SECRET=<generated-secret>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://berekettadesse.com
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
LOG_LEVEL=warn
```

### 3.4 Add Custom Domain
1. Go to Settings → Domains
2. Click "Generate Domain" or "Custom Domain"
3. Add `api.berekettadesse.com`
4. Railway will show DNS records to configure

---

## Step 4: Configure DNS (Namecheap)

Go to Namecheap → Domain List → berekettadesse.com → Advanced DNS

### For Vercel (Main Site)
```
Type        Host    Value                           TTL
A           @       76.76.21.21                     Automatic
CNAME       www     cname.vercel-dns.com            Automatic
```

### For Railway (API)
```
Type        Host    Value                           TTL
CNAME       api     <railway-provided-domain>       Automatic
```

### For Resend (Email)
Add the DNS records provided by Resend for domain verification:
- SPF record
- DKIM record
- DMARC record (optional but recommended)

---

## Step 5: Configure Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. URL: `https://api.berekettadesse.com/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret
6. Update `STRIPE_WEBHOOK_SECRET` in Vercel

---

## Step 6: Verify Domain in Resend

1. Go to Resend Dashboard → Domains
2. Add `berekettadesse.com`
3. Add the DNS records shown to Namecheap
4. Wait for verification (can take up to 24 hours)

---

## Step 7: Final Verification

### Test Checklist
- [ ] Homepage loads at https://berekettadesse.com
- [ ] API responds at https://api.berekettadesse.com/health
- [ ] Sign up works (check email delivery)
- [ ] Sign in works
- [ ] Courses display correctly
- [ ] Stripe checkout works (use test card if in test mode)
- [ ] Admin panel accessible for admin users
- [ ] Instructor dashboard works

### Common Issues

**CORS Errors**
- Verify `CORS_ORIGIN` matches your production domain exactly
- Include `https://` prefix

**Database Connection**
- Ensure Supabase allows connections from Vercel/Railway IPs
- Check connection string format

**Email Not Sending**
- Verify Resend domain is verified
- Check FROM_EMAIL matches verified domain

**SSL/HTTPS Issues**
- Wait 24-48 hours for SSL certificates to propagate
- Clear browser cache

---

## Rollback Procedure

### Vercel
1. Go to Deployments tab
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Railway
1. Go to Deployments tab
2. Click on previous deployment
3. Click "Redeploy"

---

## Monitoring

### Vercel
- Analytics: Project → Analytics tab
- Logs: Project → Deployments → View Logs

### Railway
- Logs: Service → View Logs
- Metrics: Service → Metrics tab

### Supabase
- Database: Dashboard → Database → Size/Performance
- Logs: Dashboard → Logs

---

## Cost Estimates (Monthly)

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Vercel | 100GB bandwidth | $20/mo Pro |
| Railway | $5 credits | ~$5-20/mo |
| Supabase | 500MB DB | $25/mo Pro |
| Resend | 100 emails/day | $20/mo |
| Stripe | 2.9% + 30¢ per transaction | Same |
| Namecheap | N/A | ~$12/year |

**Total**: Free tier can work for low traffic, ~$50-70/mo for production
