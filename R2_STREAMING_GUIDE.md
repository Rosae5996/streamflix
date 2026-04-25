# R2 Direct Streaming & Admin Features

## Quick Start

### R2 Video Streaming (No Vercel Bandwidth)

```tsx
import { VideoPlayer } from '@/components/video/video-player'

<VideoPlayer
  videoUrl="https://r2.example.com/videos/movie.mp4"
  title="Movie"
  isR2Video={true}
/>
```

**How it works:**
1. Frontend requests presigned URL from `/api/video/presigned-url`
2. Backend generates 1-hour signed URL from R2
3. Browser streams video directly from R2
4. **Zero bandwidth through Vercel**

### Admin Features

#### 1. Enhanced Content Form
- Release date, country, language
- IMDb ID, production company
- Keywords, age restriction
- All new fields in `/components/admin/content-form.tsx`

#### 2. Audit Logs
- Complete change history
- View at `/admin/audit-logs`
- Revert to previous versions
- IP and timestamp logging

#### 3. Site Branding
- Customize title, logo, colors
- Maintenance mode
- Manage at `/admin/branding`

#### 4. User Account Settings
- Change email, password
- Language preference
- Profile updates
- Located at `/account/profile`

#### 5. Temp Admin Credentials
- 24-hour expiry
- Force password change
- Generate via admin panel

## Files Structure

```
lib/
├─ r2-presigned.ts (presigned URL generation)
├─ admin/temp-admin-generator.ts
├─ audit/content-audit.ts
├─ branding/site-branding.ts
└─ i18n/translations.ts

components/
├─ video/video-player.tsx (video player)
├─ account/user-settings.tsx
├─ admin/
│  ├─ audit-logs-viewer.tsx
│  ├─ create-temp-admin.tsx
│  ├─ site-branding-editor.tsx
│  ├─ content-form.tsx (enhanced)
│  └─ admin-sidebar.tsx (updated)
└─ content/content-detail.tsx (updated)

app/
├─ api/
│  ├─ video/presigned-url/route.ts
│  ├─ account/change-email/route.ts
│  ├─ account/change-password/route.ts
│  ├─ admin/audit-logs/route.ts
│  ├─ admin/branding/route.ts
│  └─ admin/create-temp-admin/route.ts
├─ account/profile/page.tsx
├─ admin/
│  ├─ audit-logs/page.tsx
│  └─ branding/page.tsx
```

## Key Improvements

✅ **R2 Streaming**: Videos stream directly, saving 100GB Vercel capacity
✅ **Enhanced Metadata**: Rich content classification
✅ **Complete Audit Trail**: See all changes with revert option
✅ **Branding Control**: Customize site appearance globally
✅ **Multi-language**: Spanish, English, French, Portuguese
✅ **Security**: Rate limiting, email verification, audit logs

## Environment Variables

```env
CLOUDFLARE_R2_ENDPOINT=https://account.r2.cloudflarestorage.com
CLOUDFLARE_R2_BUCKET_NAME=streamflix-videos
CLOUDFLARE_R2_ACCESS_KEY_ID=your_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret
CLOUDFLARE_R2_PUBLIC_URL=https://cdn.example.com (optional)
```

## Next: Deploy to Vercel

Ready to go live! Use the Publish button or:

```bash
npm run build
vercel deploy
```
