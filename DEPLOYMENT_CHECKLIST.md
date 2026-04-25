# StreamFlix Deployment Checklist

## Pre-Deployment ✓

### 1. Environment Variables
- [ ] `CLOUDFLARE_R2_ENDPOINT` set
- [ ] `CLOUDFLARE_R2_BUCKET_NAME` set
- [ ] `CLOUDFLARE_R2_ACCESS_KEY_ID` set
- [ ] `CLOUDFLARE_R2_SECRET_ACCESS_KEY` set
- [ ] `CLOUDFLARE_R2_PUBLIC_URL` set (optional but recommended)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set
- [ ] All other required env vars documented

### 2. Database
- [ ] Migration `01_init_database.sql` applied
- [ ] Migration `02_advanced_features.sql` applied
- [ ] All tables created successfully
- [ ] RLS policies enabled
- [ ] Default data seeded (branding, translations)

### 3. Testing (Development)
- [ ] `npm run dev` runs without errors
- [ ] Video streaming works from R2
- [ ] Admin panel accessible
- [ ] Content form saves with new fields
- [ ] Audit logs track changes
- [ ] Site branding updates apply
- [ ] User account settings work
- [ ] Rate limiting functional

### 4. Code Quality
- [ ] No console errors or warnings
- [ ] TypeScript compiles without errors
- [ ] Linting passes: `npm run lint`
- [ ] All imports resolved correctly
- [ ] No broken links or missing assets

### 5. Security
- [ ] Rate limiting in place
- [ ] Authentication checks on admin routes
- [ ] Email verification implemented
- [ ] Password hashing working
- [ ] RLS policies applied
- [ ] No sensitive data in env examples

---

## Vercel Deployment

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Add R2 streaming and advanced admin features"
git push origin main
```

### Step 2: Connect Vercel Project
- [ ] Link GitHub repository to Vercel project
- [ ] Vercel detects Next.js framework
- [ ] Build command: `next build`
- [ ] Start command: `next start`

### Step 3: Set Environment Variables in Vercel
Dashboard → Settings → Environment Variables

Add all variables:
```
CLOUDFLARE_R2_ENDPOINT=...
CLOUDFLARE_R2_BUCKET_NAME=...
CLOUDFLARE_R2_ACCESS_KEY_ID=...
CLOUDFLARE_R2_SECRET_ACCESS_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_JWT_SECRET=...
```

### Step 4: Deploy
- [ ] Click "Deploy" in Vercel dashboard
- [ ] Verify build succeeds
- [ ] Check deployment logs
- [ ] Visit production URL

### Step 5: Post-Deployment Tests
- [ ] Homepage loads
- [ ] Authentication works
- [ ] Video streaming functional
- [ ] Admin panel accessible
- [ ] No 404 errors

---

## Initial Admin Setup

### Create First Admin Account

#### Option 1: Temp Credentials
```bash
curl -X POST https://yourdomain.com/api/admin/create-temp-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "email": "admin@streamflix.com",
    "fullName": "Initial Admin"
  }'
```

#### Option 2: Direct Database Update
```sql
-- In Supabase SQL Editor
UPDATE users 
SET role = 'admin', force_password_change = true
WHERE email = 'your-email@example.com';
```

### First Login
1. Go to `/auth/login`
2. Login with admin credentials
3. Update password at `/account/profile`
4. Configure site branding at `/admin/branding`
5. Upload first content at `/admin/content/new`

---

## Production Configuration

### 1. Domain Setup
- [ ] Custom domain configured in Vercel
- [ ] SSL certificate auto-generated
- [ ] DNS records updated

### 2. Site Branding
Navigate to `/admin/branding`:
- [ ] Set site title
- [ ] Set site description
- [ ] Upload logo
- [ ] Configure colors
- [ ] Test on live site

### 3. Security Settings
- [ ] Enable rate limiting in Supabase
- [ ] Configure CORS policies
- [ ] Set up backup strategy
- [ ] Enable audit logging

### 4. Monitoring
- [ ] Set up error tracking (optional: Sentry)
- [ ] Configure analytics (optional: PostHog)
- [ ] Monitor database performance
- [ ] Monitor R2 bandwidth usage

---

## Performance Optimization

### Caching Strategy
- [ ] Enable Redis for session caching (optional)
- [ ] Configure CDN for R2 (CLOUDFLARE_R2_PUBLIC_URL)
- [ ] Enable browser caching headers
- [ ] Optimize images with Next.js Image

### Database
- [ ] Verify indexes created
- [ ] Check query performance
- [ ] Monitor connection pool
- [ ] Set up backups

### Vercel
- [ ] Review build time
- [ ] Check bundle size
- [ ] Enable ISR where applicable
- [ ] Configure caching headers

---

## Content Onboarding

### Populate Initial Content
1. Navigate to `/admin/content`
2. Click "Add New Content"
3. Fill in all fields:
   - Basic info (title, type, description)
   - Details (rating, duration, genre)
   - **NEW**: Classification (date, country, language)
   - **NEW**: Metadata (IMDb ID, keywords)
   - Media (upload to R2)
4. Publish when ready

### Test Content Playback
- [ ] Click play on any content
- [ ] Video loads in modal
- [ ] Presigned URL generated
- [ ] Video plays smoothly
- [ ] No Vercel bandwidth used

---

## Maintenance Tasks

### Daily
- [ ] Monitor error logs
- [ ] Check R2 bandwidth usage
- [ ] Verify database connectivity

### Weekly
- [ ] Review audit logs
- [ ] Check for failed uploads
- [ ] Monitor user activity

### Monthly
- [ ] Analyze usage patterns
- [ ] Update content classifications
- [ ] Review and optimize site branding
- [ ] Test disaster recovery

### Quarterly
- [ ] Security audit
- [ ] Database optimization
- [ ] Performance review
- [ ] Dependency updates

---

## Rollback Plan

If deployment fails:

### Option 1: Automatic Rollback
```bash
vercel rollback production
```

### Option 2: Manual Rollback
```bash
git revert <commit-hash>
git push origin main
```

### Option 3: Switch Vercel Deployment
- Go to Vercel Dashboard
- Select previous successful deployment
- Click "Promote to Production"

---

## Support & Troubleshooting

### R2 Streaming Issues
See: `R2_STREAMING_GUIDE.md`

### Database Issues
See: `ADVANCED_FEATURES_SUMMARY.md`

### Security Concerns
See: `SECURITY.md`

### General Issues
See: `README_STREAMFLIX.md`

---

## Success Criteria

✅ Production app is live
✅ Videos stream from R2 (no Vercel bandwidth)
✅ Admin can manage content
✅ Audit logs functional
✅ Site branding customizable
✅ Users can update accounts
✅ No critical errors
✅ Performance acceptable
✅ Security measures in place

---

## Post-Launch

- [ ] Monitor metrics for 24 hours
- [ ] Gather user feedback
- [ ] Document any issues
- [ ] Plan next features
- [ ] Schedule first content update

---

**Deployment Date:** _______________
**Deployed By:** _______________
**Notes:** _______________
