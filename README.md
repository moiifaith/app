# Zikr Counter App

A modern Islamic zikr (remembrance) counter application built with Vue.js and designed for deployment on Cloudflare Pages with Functions.

## Features

- **🕌 Traditional Zikrs**: Access authentic Islamic zikrs with Arabic text and transliteration
- **📿 Digital Tasbeeh**: Count repetitions with an intuitive digital counter
- **📊 Progress Tracking**: Track daily progress and view historical data
- **🌍 Multilingual Support**: Available in English, Arabic, Spanish, and French
- **📱 Mobile Ready**: Responsive design optimized for mobile devices
- **⚡ Offline Capable**: Works offline with local storage
- **🛡️ Admin Panel**: Manage zikrs, translations, and user analytics

## Pages Structure

- **/** - Landing page introducing the app
- **/app** - Main zikr application
- **/app/zikr/:id** - Individual zikr counter interface
- **/app/history** - Progress tracking and history
- **/admin** - Admin panel (requires login)
- **/admin/login** - Admin authentication

## Technology Stack

- **Frontend**: Vue 3, Vue Router, Vue I18n
- **Mobile**: Capacitor for iOS/Android apps
- **Backend**: Cloudflare Functions
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare KV (for translations)
- **Deployment**: Cloudflare Pages

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run serve
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## Cloudflare Deployment

### Prerequisites

- Cloudflare account
- Wrangler CLI installed and configured

### Setup Steps

1. **Create Cloudflare Pages project**:
   ```bash
   wrangler pages project create zikr-app
   ```

2. **Create D1 database**:
   ```bash
   wrangler d1 create zikr-database
   ```

3. **Run database migrations**:
   ```bash
   wrangler d1 execute zikr-database --file=./functions/schema.sql
   ```

4. **Create KV namespace for translations**:
   ```bash
   wrangler kv:namespace create "TRANSLATIONS"
   ```

5. **Deploy to Cloudflare Pages**:
   ```bash
   npm run build
   wrangler pages deploy dist
   ```

### Environment Configuration

Create a `wrangler.toml` file in the root directory:

```toml
name = "zikr-app"
compatibility_date = "2024-01-01"

[env.production]
d1_databases = [
  { binding = "DB", database_name = "zikr-database", database_id = "your-database-id" }
]

kv_namespaces = [
  { binding = "TRANSLATIONS", id = "your-kv-namespace-id" }
]

[[env.production.rules]]
type = "ESModule"
globs = ["**/*.js"]
```

## Admin Panel

The admin panel allows you to:

- Manage zikrs (add, edit, delete)
- Edit translations for all supported languages
- View user analytics and progress
- Monitor app usage statistics

**Default Admin Credentials**:
- Username: `admin`
- Password: `zikr2024`

*Note: Change these credentials in production by updating the authentication logic in `/functions/api/auth/login.js`*

## Database Schema

The app uses the following main tables:

- `zikrs` - Store Islamic zikrs with Arabic and Latin text
- `user_progress` - Track user daily progress
- `zikr_sessions` - Detailed session tracking
- `admin_users` - Admin authentication
- `translations` - Multilingual content

See `/functions/schema.sql` for the complete database schema.

## API Endpoints

### Public Endpoints
- `GET /api/zikrs` - Get all available zikrs
- `GET /api/translations?lang=en` - Get translations for a language
- `POST /api/progress` - Save user progress

### Admin Endpoints (require authentication)
- `POST /api/auth/login` - Admin authentication
- `POST /api/zikrs` - Create new zikr
- `PUT /api/zikrs/:id` - Update zikr
- `DELETE /api/zikrs/:id` - Delete zikr
- `PUT /api/translations` - Update translations

## Mobile App Development

To build mobile apps using Capacitor:

1. **Install Capacitor**:
   ```bash
   npm install @capacitor/cli @capacitor/core
   npx cap init
   ```

2. **Add platforms**:
   ```bash
   npx cap add ios
   npx cap add android
   ```

3. **Build and sync**:
   ```bash
   npm run build
   npx cap sync
   ```

4. **Open in native IDEs**:
   ```bash
   npx cap open ios
   npx cap open android
   ```

## Customization

### Adding New Zikrs

1. Use the admin panel to add zikrs through the UI, or
2. Insert directly into the database:
   ```sql
   INSERT INTO zikrs (arabic, latin, identifier, default_repetitions) 
   VALUES ('Your Arabic Text', 'Your Transliteration', 'unique_identifier', 33);
   ```

### Adding New Languages

1. Create a new locale file in `/src/i18n/locales/`
2. Add the language to the i18n configuration
3. Update the language selector in components
4. Add translations using the admin panel

### Customizing Styles

The app uses CSS custom properties for theming. Key variables are defined in the component styles and can be customized globally.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions:
- Create an issue on GitHub
- Check the documentation
- Review the code comments for implementation details

---

May Allah accept your dhikr and grant you peace through remembrance. 🤲
