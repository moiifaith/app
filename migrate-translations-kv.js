#!/usr/bin/env node

/**
 * Translation Migration Script
 * This script uploads all translation files to Cloudflare KV storage
 * and creates version hashes for caching
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Language codes we support
const LANGUAGES = ['en', 'ar', 'es', 'fr', 'bs', 'hr', 'sr'];

// KV storage configuration
const KV_NAMESPACE = 'TRANSLATIONS'; // This should match your wrangler.toml

async function loadTranslationFile(languageCode) {
  const filePath = path.join(__dirname, 'src', 'i18n', 'locales', `${languageCode}.json`);
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error loading ${languageCode} translations:`, error.message);
    return null;
  }
}

function generateVersionHash(translationsData) {
  const dataString = JSON.stringify(translationsData, null, 0);
  return crypto.createHash('sha256').update(dataString).digest('hex').substring(0, 12);
}

async function uploadToKV(key, value) {
  try {
    // Using wrangler CLI to upload to KV
    const { spawn } = await import('child_process');
    
    return new Promise((resolve, reject) => {
      const process = spawn('wrangler', [
        'kv:key', 'put', 
        `--namespace-id=${process.env.KV_NAMESPACE_ID}`,
        key,
        value
      ]);
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`wrangler command failed with code ${code}`));
        }
      });
      
      process.on('error', (error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.error(`Error uploading ${key}:`, error.message);
    throw error;
  }
}

async function migrateTranslations() {
  console.log('🚀 Starting translation migration to Cloudflare KV...\n');
  
  const versionMap = {};
  const uploadPromises = [];
  
  for (const lang of LANGUAGES) {
    console.log(`📝 Processing ${lang} translations...`);
    
    // Load translation file
    const translations = await loadTranslationFile(lang);
    
    if (!translations) {
      console.log(`⚠️  Skipping ${lang} - file not found or invalid\n`);
      continue;
    }
    
    // Generate version hash
    const versionHash = generateVersionHash(translations);
    versionMap[lang] = versionHash;
    
    console.log(`   Hash: ${versionHash}`);
    console.log(`   Keys: ${Object.keys(translations).length}`);
    
    // Upload to KV storage
    const kvKey = `translations:${lang}`;
    const kvValue = JSON.stringify(translations);
    
    uploadPromises.push(
      uploadToKV(kvKey, kvValue).then(() => {
        console.log(`✅ Uploaded ${lang} translations to KV`);
      })
    );
    
    console.log('');
  }
  
  // Upload version map
  const versionKey = 'translations:versions';
  const versionValue = JSON.stringify(versionMap);
  
  uploadPromises.push(
    uploadToKV(versionKey, versionValue).then(() => {
      console.log('✅ Uploaded version map to KV');
    })
  );
  
  // Wait for all uploads to complete
  try {
    await Promise.all(uploadPromises);
    console.log('\n🎉 Translation migration completed successfully!');
    console.log('\nVersion hashes:');
    Object.entries(versionMap).forEach(([lang, hash]) => {
      console.log(`  ${lang}: ${hash}`);
    });
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Alternative method using direct API calls if wrangler is not available
async function directKVUpload(accountId, kvNamespaceId, apiToken) {
  console.log('🚀 Using direct API upload method...\n');
  
  const versionMap = {};
  
  for (const lang of LANGUAGES) {
    console.log(`📝 Processing ${lang} translations...`);
    
    const translations = await loadTranslationFile(lang);
    if (!translations) continue;
    
    const versionHash = generateVersionHash(translations);
    versionMap[lang] = versionHash;
    
    // Upload via Cloudflare API
    const kvKey = `translations:${lang}`;
    const kvValue = JSON.stringify(translations);
    
    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNamespaceId}/values/${kvKey}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'text/plain'
          },
          body: kvValue
        }
      );
      
      if (response.ok) {
        console.log(`✅ Uploaded ${lang} translations`);
      } else {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
    } catch (error) {
      console.error(`❌ Failed to upload ${lang}:`, error.message);
    }
    
    console.log('');
  }
  
  // Upload version map
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNamespaceId}/values/translations:versions`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify(versionMap)
      }
    );
    
    if (response.ok) {
      console.log('✅ Uploaded version map');
    }
  } catch (error) {
    console.error('❌ Failed to upload version map:', error.message);
  }
  
  console.log('\n🎉 Direct API migration completed!');
}

// Check command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Translation Migration Script

Usage:
  node migrate-translations.js [options]

Options:
  --direct     Use direct API calls instead of wrangler CLI
  --help, -h   Show this help message

Environment Variables (for --direct mode):
  CF_ACCOUNT_ID        Your Cloudflare Account ID  
  KV_NAMESPACE_ID      Your KV Namespace ID
  CF_API_TOKEN         Your Cloudflare API Token

Examples:
  # Using wrangler CLI (recommended)
  node migrate-translations.js

  # Using direct API
  CF_ACCOUNT_ID=abc123 KV_NAMESPACE_ID=xyz789 CF_API_TOKEN=token123 node migrate-translations.js --direct
`);
  process.exit(0);
}

// Run migration
if (args.includes('--direct')) {
  const accountId = process.env.CF_ACCOUNT_ID;
  const kvNamespaceId = process.env.KV_NAMESPACE_ID;
  const apiToken = process.env.CF_API_TOKEN;
  
  if (!accountId || !kvNamespaceId || !apiToken) {
    console.error('❌ Missing required environment variables for direct API mode');
    console.error('Required: CF_ACCOUNT_ID, KV_NAMESPACE_ID, CF_API_TOKEN');
    process.exit(1);
  }
  
  directKVUpload(accountId, kvNamespaceId, apiToken);
} else {
  migrateTranslations();
}
