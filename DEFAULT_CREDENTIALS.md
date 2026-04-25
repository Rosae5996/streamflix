# StreamFlix - Default Credentials & Setup

## 🔐 Default Accounts

After running the setup script, you'll have these default accounts:

### Admin Account
**Email:** `admin@streamflix.local`
**Password:** `Admin@12345678!`
**Role:** Admin
**Status:** Active

### Regular User Account  
**Email:** `user@streamflix.local`
**Password:** `User@12345678!`
**Role:** User
**Status:** Active

### Test Content Manager
**Email:** `manager@streamflix.local`
**Password:** `Manager@12345678!`
**Role:** Content Manager
**Status:** Active

---

## 🚀 First Time Setup

### Step 1: Run Setup Script
```bash
npx ts-node scripts/setup-default-accounts.ts
```

This will:
- Create the default admin account
- Create the default user accounts
- Set up initial branding
- Seed some sample translations
- Create initial site settings

### Step 2: Login as Admin
1. Go to `/auth/login`
2. Use: `admin@streamflix.local`
3. Password: `Admin@12345678!`

### Step 3: Access Admin Panel
1. After login, go to `/admin`
2. You'll see:
   - Dashboard
   - Content Management
   - Audit Logs
   - Site Branding
   - Users
   - Settings

### Step 4: Customize Your Site
1. Go to `/admin/branding`
2. Update:
   - Site title
   - Site description
   - Logo URL
   - Primary & secondary colors
   - Font family

---

## 🔄 Changing Default Credentials

After first login, change the default passwords immediately:

### For Admin:
1. Login as admin
2. Go to `/account/profile`
3. Click "Change Password"
4. Enter old and new passwords
5. Confirm via email

### For Regular Users:
1. Login as user
2. Go to `/account/profile`
3. Change password
4. Update profile info as needed

---

## 📝 Custom Admin Users

To create additional admin accounts:

1. Login as existing admin
2. Go to `/admin/users`
3. Click "Create Temporary Admin"
4. Enter:
   - Email
   - Full name
5. Share the temporary credentials
6. New admin must change password on first login

---

## 🔒 Security Notes

⚠️ **IMPORTANT:**
- These are development credentials only
- Change them immediately in production
- Use strong passwords (min 12 characters)
- Enable 2FA if available
- Store credentials securely (password manager)
- Audit login attempts in `/admin/audit-logs`

---

## 🆘 Forgot Password?

If you forget the admin password:

1. Delete the admin user from database:
```sql
DELETE FROM users WHERE email = 'admin@streamflix.local';
```

2. Re-run setup script:
```bash
npx ts-node scripts/setup-default-accounts.ts
```

3. Use the new credentials above

---

## 📊 Database Verification

Check if accounts were created:

```sql
SELECT id, email, role, is_active, created_at 
FROM users 
WHERE email IN (
  'admin@streamflix.local',
  'user@streamflix.local',
  'manager@streamflix.local'
)
ORDER BY created_at DESC;
```

---

## 🎯 Next Steps After Setup

1. ✅ Login with admin account
2. ✅ Verify all pages load correctly
3. ✅ Customize branding
4. ✅ Upload test content
5. ✅ Test video streaming from R2
6. ✅ Review audit logs
7. ✅ Change default passwords
8. ✅ Create additional admin users
9. ✅ Deploy to production
10. ✅ Setup custom domain

---

## 💡 Tips

- **Admin Features:** Use `/admin` for all management tasks
- **User Profile:** Edit profile at `/account/profile`
- **Content Management:** Upload at `/admin/content/new`
- **Audit Trail:** View all changes at `/admin/audit-logs`
- **Branding:** Customize at `/admin/branding`
- **Translations:** Edit at `/admin/settings` (if implemented)

---

Last Updated: 2026-04-24
Version: 1.0
