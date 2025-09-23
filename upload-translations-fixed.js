#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

async function uploadTranslations() {
  const localesDir = path.join(__dirname, 'src', 'i18n', 'locales')
  const languages = ['en', 'ar', 'es', 'fr', 'bs', 'hr', 'sr']

  console.log('🚀 Starting translation upload to KV storage...')

  for (const lang of languages) {
    const filePath = path.join(localesDir, `${lang}.json`)
    
    if (fs.existsSync(filePath)) {
      try {
        console.log(`📤 Uploading ${lang} translations...`)
        
        // Use wrangler to upload to KV with correct syntax
        const command = `npx wrangler kv key put "translations:${lang}" --path="${filePath}" --binding="TRANSLATIONS" --env="production" --remote`
        
        execSync(command, { stdio: 'inherit' })
        
        console.log(`✅ ${lang} translations uploaded successfully`)
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.error(`❌ Error uploading ${lang} translations:`, error.message)
      }
    } else {
      console.warn(`⚠️  Translation file not found: ${filePath}`)
    }
  }

  // Upload translation versions for cache invalidation
  try {
    console.log('📤 Uploading translation versions...')
    const versionHash = Date.now().toString()
    const versions = {}
    
    languages.forEach(lang => {
      versions[lang] = versionHash
    })
    
    const tempVersionFile = path.join(__dirname, 'temp_versions.json')
    fs.writeFileSync(tempVersionFile, JSON.stringify(versions))
    
    const versionCommand = `npx wrangler kv key put "translation_versions" --path="${tempVersionFile}" --binding="TRANSLATIONS" --env="production" --remote`
    execSync(versionCommand, { stdio: 'inherit' })
    
    fs.unlinkSync(tempVersionFile)
    console.log(`✅ Translation versions uploaded successfully`)
    
  } catch (error) {
    console.error('❌ Error uploading translation versions:', error.message)
  }

  console.log('🎉 Translation upload completed!')
}

// Handle promise rejection
uploadTranslations().catch(console.error)
