# StreamFlix Quick Start Guide

## 🚀 30-Minute Setup

### 1. Environment Setup (5 min)
```bash
# Copy your Cloudflare R2 credentials
CLOUDFLARE_R2_ENDPOINT=your_endpoint
CLOUDFLARE_R2_BUCKET_NAME=your_bucket
CLOUDFLARE_R2_ACCESS_KEY_ID=your_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret

# Copy your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
```

Add to `.env.local`

### 2. Database Migration (5 min)
```bash
# In Supabase SQL Editor, run:
scripts/02_advanced_features.sql
```

### 3. Start Development (5 min)
```bash
npm run dev
# Visit http://localhost:3000
```

### 4. Create Admin Account (5 min)

Option A: Via API
```bash
curl -X POST http://localhost:3000/api/admin/create-temp-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","fullName":"Admin"}'
```

Option B: Register normally, then update role in Supabase console
```sql
UPDATE users SET role='admin' WHERE email='your-email@example.com';
```

### 5. Test Features (5 min)

**Upload Content:**
```
1. Go to http://localhost:3000/admin/content/new
2. Fill form with new fields (date, country, IMDb ID, etc)
3. Upload video to R2
4. Publish
```

**Watch Video:**
```
1. Go to content page
2. Click Play
3. Video streams from R2 (check Network tab - presigned URL)
```

**View Audit Logs:**
```
1. Go to http://localhost:3000/admin/audit-logs
2. See all changes
3. Click Revert to restore
```

**Customize Branding:**
```
1. Go to http://localhost:3000/admin/branding
2. Change title, logo, colors
3. Saves globally
```

---

## 📋 Key Files Changed

### New Components
- `components/video/video-player.tsx` - Video player
- `components/admin/site-branding-editor.tsx` - Branding customizer
- `components/admin/audit-logs-viewer.tsx` - Change history viewer
- `components/account/user-settings.tsx` - Account settings

### New API Routes
- `app/api/video/presigned-url/route.ts` - Generate R2 signed URLs
- `app/api/admin/branding/route.ts` - Manage site branding
- `app/api/admin/audit-logs/route.ts` - Fetch audit logs
- `app/api/admin/revert-content/route.ts` - Revert changes

### New Pages
- `app/admin/audit-logs/page.tsx` - View audit logs
- `app/admin/branding/page.tsx` - Edit site branding

### Updated Components
- `components/admin/content-form.tsx` - Added new fields
- `components/content/content-detail.tsx` - Added video player modal
- `components/admin/admin-sidebar.tsx` - Added links

---

## 🔑 Core Features

### R2 Video Streaming
```tsx
<VideoPlayer
  videoUrl="r2://videos/movie.mp4"
  title="Movie Title"
  isR2Video={true}
/>
```
- Videos stream directly from R2
- No Vercel bandwidth used
- Presigned URLs valid for 1 hour
- Rate limited (100/hour per IP)

### Enhanced Content Form
New fields:
- Release date (date picker)
- Country (text)
- Language (ES, EN, FR, PT)
- IMDb ID (tt1234567)
- Keywords (comma-separated)
- Production company
- Age restriction (G, PG-7, PG-13, R-16, R-18)

### Audit Logs
- See all changes (CREATE, UPDATE, DELETE, PUBLISH)
- Who made the change
- What changed (old → new values)
- When it happened
- Revert to previous version

### Site Branding
- Custom title & description
- Logo and favicon
- Primary & secondary colors
- Font family
- Maintenance mode

### User Account Settings
- Change email (with verification)
- Change password
- Update profile
- Language preference
- Theme (dark/light)

---

## 🔒 Security

All features have:
- ✅ Authentication checks
- ✅ Rate limiting
- ✅ Input validation
- ✅ Audit logging
- ✅ RLS policies

---

## 📊 Database Changes

### New Tables
- `temp_admin_credentials` - Temp login credentials
- `site_branding` - Site configuration
- `site_translations` - Multi-language strings
- `content_audit_log` - Change tracking
- `user_settings` - User preferences
- `email_verification_tokens` - Email verification

### Modified Columns
- `users`: +4 columns (language, email verified, etc)
- `content`: +11 columns (date, country, IMDb ID, etc)

---

## 🚀 Deploy to Vercel

### 1. Push Code
```bash
git add .
git commit -m "Add R2 streaming & advanced features"
git push origin main
```

### 2. Set Env Vars in Vercel
- Add all R2 variables
- Add all Supabase variables

### 3. Deploy
- Vercel auto-deploys from main
- Wait for build to complete
- Visit production URL

### 4. Setup in Production
- Create admin account
- Configure site branding
- Upload content
- Test video streaming

---

## ✨ What You Get

- ✅ Bandwidth-efficient video streaming
- ✅ Rich content metadata
- ✅ Complete change history
- ✅ Site customization
- ✅ Multi-language support
- ✅ User account management
- ✅ Security best practices
- ✅ Production-ready code

---

## 📚 Full Documentation

- `IMPLEMENTATION_COMPLETE.md` - Complete overview
- `DEPLOYMENT_CHECKLIST.md` - Deployment guide
- `R2_STREAMING_GUIDE.md` - R2 streaming details
- `ADVANCED_FEATURES_SUMMARY.md` - Feature details
- `SECURITY.md` - Security implementation
- `README_STREAMFLIX.md` - Project overview

---

## 🆘 Troubleshooting

### Video not streaming?
1. Check R2 environment variables
2. Verify bucket name and credentials
3. Check Network tab for presigned URL
4. Ensure URL isn't expired (1 hour limit)

### Admin features not working?
1. Verify user has admin role
2. Check authentication middleware
3. Verify database tables exist
4. Check browser console for errors

### Site branding not updating?
1. Clear browser cache
2. Check Supabase site_branding table
3. Verify update API call succeeded
4. Check for RLS policy issues

---

## Next Steps

1. ✅ Start development: `npm run dev`
2. ✅ Create admin account
3. ✅ Upload test content
4. ✅ Test all features locally
5. ✅ Deploy to Vercel
6. ✅ Configure in production
7. ✅ Add your branding
8. ✅ Go live!

**Estimated time: 1-2 hours total**

---

Need help? See the full documentation files in the project root.
