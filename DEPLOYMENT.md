# 🚀 Cloudflare Deployment Guide for Zikr App

This guide will walk you through deploying your Zikr app to Cloudflare Pages with D1 Database and KV storage.

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Wrangler CLI**: Install globally with `npm install -g wrangler`
3. **Built Application**: Run `npm run build` in your project

## Step-by-Step Deployment

### 1. Install and Login to Wrangler

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to your Cloudflare account
wrangler login
```

### 2. Create D1 Database (Most Important!)

```bash
# Create the database
wrangler d1 create zikr-database
```

You'll get output like this:
```
✅ Successfully created DB 'zikr-database'!

Add the following to your wrangler.toml:
[[d1_databases]]
binding = "DB"
database_name = "zikr-database"
database_id = "12345678-1234-1234-1234-123456789abc"
```

**⚠️ IMPORTANT**: Copy the `database_id` and update your `wrangler.toml` file!

### 3. Initialize Database with Schema

```bash
# Run the database migrations
wrangler d1 execute zikr-database --file=./functions/schema.sql
```

This will create all the tables and insert the 15 predefined zikrs.

### 4. Create KV Namespace for Translations

```bash
# Create KV namespace
wrangler kv:namespace create TRANSLATIONS
```

You'll get output like:
```
🌀 Creating namespace with title "zikr-app-TRANSLATIONS"
✨ Success!
Add the following to your wrangler.toml:
kv_namespaces = [
  { binding = "TRANSLATIONS", id = "abcdef1234567890abcdef1234567890" }
]
```

**⚠️ IMPORTANT**: Copy the `id` and update your `wrangler.toml` file!

### 5. Update wrangler.toml Configuration

Edit your `wrangler.toml` file and replace the placeholder IDs:

```toml
name = "zikr-app"
compatibility_date = "2024-01-01"
pages_build_output_dir = "dist"

[env.production]
[[env.production.d1_databases]]
binding = "DB"
database_name = "zikr-database"
database_id = "YOUR_ACTUAL_DATABASE_ID_HERE"  # ← Replace this

[[env.production.kv_namespaces]]
binding = "TRANSLATIONS"
id = "YOUR_ACTUAL_KV_NAMESPACE_ID_HERE"  # ← Replace this
```

### 6. Build Your Application

```bash
# Build for production
npm run build
```

### 7. Deploy to Cloudflare Pages

```bash
# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=zikr-app
```

### 8. Set up Custom Domain (Optional)

1. Go to Cloudflare Dashboard → Pages → zikr-app
2. Click "Custom domains" tab
3. Add your domain (e.g., `zikr.yourdomain.com`)
4. Follow DNS setup instructions

## Verification Steps

### Test Database Connection

```bash
# Test database query
wrangler d1 execute zikr-database --command="SELECT COUNT(*) as zikr_count FROM zikrs;"
```

Should return: `{"zikr_count": 15}`

### Test API Endpoints

After deployment, test these URLs:
- `https://your-app.pages.dev/api/zikrs` - Should return list of zikrs
- `https://your-app.pages.dev/api/translations?lang=en` - Should return translations

### Test Admin Login

1. Go to `https://your-app.pages.dev/admin/login`
2. Use credentials: `admin` / `zikr2024`
3. Should redirect to admin panel

## Environment-Specific Deployment

### Development Environment

```bash
# Create dev database
wrangler d1 create zikr-database-dev

# Create dev KV namespace
wrangler kv:namespace create TRANSLATIONS --env development

# Deploy to dev environment
wrangler pages deploy dist --env development
```

### Production Environment

```bash
# Deploy to production
wrangler pages deploy dist --env production
```

## Troubleshooting

### Common Issues

1. **Database binding error**:
   - Check `database_id` in wrangler.toml
   - Verify database exists: `wrangler d1 list`

2. **KV namespace error**:
   - Check namespace `id` in wrangler.toml
   - Verify KV exists: `wrangler kv:namespace list`

3. **Function not found**:
   - Ensure functions are in `/functions` directory
   - Check file naming matches API routes

4. **CORS errors**:
   - Check `_headers` file in `/public`
   - Verify API functions return CORS headers

### Debug Commands

```bash
# List all D1 databases
wrangler d1 list

# List all KV namespaces
wrangler kv:namespace list

# Check Pages deployments
wrangler pages deployment list

# View function logs
wrangler pages deployment tail
```

## Security Considerations

### Production Checklist

- [ ] Change admin credentials in `/functions/api/auth/login.js`
- [ ] Use proper JWT tokens instead of base64 encoding
- [ ] Add rate limiting to API endpoints
- [ ] Implement proper user authentication
- [ ] Add input validation and sanitization
- [ ] Enable WAF rules in Cloudflare dashboard

### Admin Credentials

**⚠️ IMPORTANT**: The default admin credentials are:
- Username: `admin`
- Password: `zikr2024`

**Change these immediately in production!**

Edit `/functions/api/auth/login.js`:
```javascript
// Replace hardcoded credentials with secure authentication
if (username === 'your_admin_username' && password === 'your_secure_password') {
  // Your authentication logic
}
```

## Monitoring and Analytics

### Cloudflare Analytics

1. Go to Cloudflare Dashboard → Pages → zikr-app
2. View analytics tab for:
   - Page views
   - Unique visitors
   - Geographic distribution

### D1 Analytics

```bash
# View database metrics
wrangler d1 insights zikr-database

# Check query performance
wrangler d1 execute zikr-database --command="EXPLAIN QUERY PLAN SELECT * FROM zikrs;"
```

## Backup and Recovery

### Database Backup

```bash
# Export database
wrangler d1 export zikr-database --output=backup.sql

# Import database
wrangler d1 execute zikr-database --file=backup.sql
```

### KV Backup

```bash
# List all KV keys
wrangler kv:key list --binding=TRANSLATIONS

# Get specific key
wrangler kv:key get "translations:en" --binding=TRANSLATIONS
```

## Cost Estimation

### Cloudflare Free Tier Limits

- **Pages**: 1 site, unlimited bandwidth
- **D1**: 5 GB storage, 25 million reads/month
- **KV**: 10 GB storage, 100,000 reads/month
- **Functions**: 100,000 requests/day

### Paid Plans

- **Pages Pro**: $20/month for multiple sites
- **D1**: $5/month per additional 1M requests
- **Workers Paid**: $5/month + $0.50/million requests

## Support

### Getting Help

1. **Cloudflare Community**: [community.cloudflare.com](https://community.cloudflare.com)
2. **Discord**: [Cloudflare Developers Discord](https://discord.gg/cloudflaredev)
3. **Documentation**: [developers.cloudflare.com](https://developers.cloudflare.com)

### Contact Support

- **Free Plan**: Community support only
- **Paid Plans**: 24/7 email support
- **Enterprise**: Dedicated support team

---

🎉 **Congratulations!** Your Zikr app is now deployed on Cloudflare's global network!

Your users worldwide can now access your Islamic remembrance app with lightning-fast performance. May Allah bless your work and accept the dhikr of all users. 🤲