#!/usr/bin/env node

/**
 * Translation Migration Script
 * This script reads all translation files from src/i18n/locales
 * and uploads them to both KV storage and D1 database
 */

const fs = require('fs');
const path = require('path');

// Function to flatten nested JSON objects
function flattenObject(obj, prefix = '') {
  const flattened = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        // Recursively flatten nested objects
        Object.assign(flattened, flattenObject(obj[key], newKey));
      } else {
        flattened[newKey] = obj[key];
      }
    }
  }
  
  return flattened;
}

// Function to read and process translation files
function processTranslations() {
  const localesDir = path.join(__dirname, 'src/i18n/locales');
  const translations = {};
  
  // Read all JSON files in the locales directory
  const files = fs.readdirSync(localesDir).filter(file => file.endsWith('.json'));
  
  for (const file of files) {
    const lang = path.basename(file, '.json');
    const filePath = path.join(localesDir, file);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(content);
      
      // Flatten the nested structure
      const flattened = flattenObject(jsonData);
      translations[lang] = flattened;
      
      console.log(`Processed ${lang}: ${Object.keys(flattened).length} translations`);
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }
  
  return translations;
}

// Function to generate SQL statements
function generateSQL(translations) {
  const statements = [];
  
  for (const [langCode, langTranslations] of Object.entries(translations)) {
    // Delete existing translations for this language
    statements.push(`DELETE FROM translations WHERE language_code = '${langCode}';`);
    
    // Insert new translations
    for (const [key, value] of Object.entries(langTranslations)) {
      const escapedValue = value.replace(/'/g, "''"); // Escape single quotes
      statements.push(
        `INSERT INTO translations (language_code, translation_key, translation_value) VALUES ('${langCode}', '${key}', '${escapedValue}');`
      );
    }
  }
  
  return statements;
}

// Function to generate KV upload commands
function generateKVCommands(translations) {
  const commands = [];
  
  for (const [langCode, langTranslations] of Object.entries(translations)) {
    const jsonContent = JSON.stringify(langTranslations, null, 2);
    // Write to temporary file for KV upload
    const tempFile = `temp_translations_${langCode}.json`;
    fs.writeFileSync(tempFile, jsonContent);
    
    commands.push(`wrangler kv key put "translations:${langCode}" --path="${tempFile}" --binding=TRANSLATIONS`);
  }
  
  return commands;
}

// Main execution
function main() {
  console.log('🚀 Starting translation migration...\n');
  
  // Process all translation files
  const translations = processTranslations();
  
  console.log(`\n📊 Summary:`);
  for (const [lang, trans] of Object.entries(translations)) {
    console.log(`  ${lang}: ${Object.keys(trans).length} keys`);
  }
  
  // Generate SQL file
  const sqlStatements = generateSQL(translations);
  const sqlContent = sqlStatements.join('\n');
  fs.writeFileSync('migrate_translations.sql', sqlContent);
  console.log(`\n📝 Generated migrate_translations.sql with ${sqlStatements.length} statements`);
  
  // Generate KV commands file
  const kvCommands = generateKVCommands(translations);
  const kvScript = kvCommands.join('\n');
  fs.writeFileSync('upload_to_kv.sh', `#!/bin/bash\n\n${kvScript}\n\n# Clean up temp files\nrm -f temp_translations_*.json`);
  fs.chmodSync('upload_to_kv.sh', '755');
  console.log(`📤 Generated upload_to_kv.sh with ${kvCommands.length} commands`);
  
  // Generate flattened JSON files for reference
  for (const [lang, trans] of Object.entries(translations)) {
    fs.writeFileSync(`flattened_${lang}.json`, JSON.stringify(trans, null, 2));
  }
  
  console.log(`\n✅ Migration files generated successfully!`);
  console.log(`\nNext steps:`);
  console.log(`1. Run: wrangler d1 execute zikr-database --file=migrate_translations.sql --remote`);
  console.log(`2. Run: ./upload_to_kv.sh`);
  console.log(`3. Clean up: rm migrate_translations.sql upload_to_kv.sh flattened_*.json`);
}

if (require.main === module) {
  main();
}

module.exports = { flattenObject, processTranslations, generateSQL, generateKVCommands };
