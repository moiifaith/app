# 🚀 Quick Deployment Commands

## Essential Commands (Run in Order)

### 1. Install Wrangler (if not installed)
```bash
npm install -g wrangler
# or
curl -fsSL https://workers.cloudflare.com/install | sh
```

### 2. Login to Cloudflare
```bash
wrangler login
```

### 3. Create D1 Database (CRITICAL!)
```bash
wrangler d1 create zikr-database
```
**📋 Copy the `database_id` from output and update `wrangler.toml`**

### 4. Create KV Namespace for Translations
```bash
wrangler kv:namespace create TRANSLATIONS
```
**📋 Copy the `id` from output and update `wrangler.toml`**

### 5. Initialize Database with Zikrs
```bash
wrangler d1 execute zikr-database --file=./functions/schema.sql
```

### 6. Deploy to Cloudflare Pages
```bash
wrangler pages deploy dist --project-name=zikr-app
```

## Verification Commands

### Test Database
```bash
# Check if zikrs were inserted
wrangler d1 execute zikr-database --command="SELECT COUNT(*) FROM zikrs;"
# Should return: {"COUNT(*)": 15}

# View first few zikrs
wrangler d1 execute zikr-database --command="SELECT arabic, latin FROM zikrs LIMIT 3;"
```

### Test Deployment
```bash
# Get deployment URL
wrangler pages deployment list --project-name=zikr-app
```

## Your App URLs (after deployment)
- **Main App**: https://zikr-app.pages.dev
- **Landing Page**: https://zikr-app.pages.dev/
- **Zikr Counter**: https://zikr-app.pages.dev/app
- **Admin Panel**: https://zikr-app.pages.dev/admin/login
- **API Endpoint**: https://zikr-app.pages.dev/api/zikrs

## Default Admin Login
- **Username**: admin
- **Password**: zikr2024
- **⚠️ Change these in production!**

## Troubleshooting

### Database Connection Issues
1. Check `database_id` in `wrangler.toml`
2. Verify database exists: `wrangler d1 list`
3. Re-run schema: `wrangler d1 execute zikr-database --file=./functions/schema.sql`

### KV Issues
1. Check `id` in `wrangler.toml`
2. Verify namespace exists: `wrangler kv:namespace list`

### API Not Working
1. Check functions are in `/functions` directory
2. Verify CORS headers in API responses
3. Check function logs: `wrangler pages deployment tail`

## Production Checklist
- [ ] Update admin credentials in `/functions/api/auth/login.js`
- [ ] Add custom domain in Cloudflare dashboard
- [ ] Enable security features (WAF, rate limiting)
- [ ] Test all pages and admin functions
- [ ] Monitor analytics and performance

---
🎉 **Ready to deploy!** Your Zikr app will be live on Cloudflare's global CDN!