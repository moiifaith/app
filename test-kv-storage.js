#!/usr/bin/env node

const { execSync } = require('child_process')

async function testKVStorage() {
  const languages = ['en', 'ar', 'es', 'fr', 'bs', 'hr', 'sr']
  
  console.log('🔍 Testing KV storage translations...\n')
  
  for (const lang of languages) {
    try {
      console.log(`📖 Testing ${lang} translations...`)
      
      // Test fetching the translation from KV
      const command = `npx wrangler kv key get "translations:${lang}" --binding="TRANSLATIONS" --env="production" --remote`
      const result = execSync(command, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 10 })
      
      if (result && result.trim() !== 'null') {
        try {
          const data = JSON.parse(result)
          const keys = Object.keys(data)
          console.log(`  ✅ Found ${keys.length} translation keys for ${lang}`)
          
          // Show first few keys as sample
          if (keys.length > 0) {
            console.log(`  📝 Sample keys: ${keys.slice(0, 3).join(', ')}...`)
          }
        } catch (parseError) {
          console.log(`  ⚠️  Data exists but couldn't parse JSON for ${lang}`)
        }
      } else {
        console.log(`  ❌ No data found for ${lang}`)
      }
    } catch (error) {
      console.log(`  ❌ Error fetching ${lang}: ${error.message.split('\n')[0]}`)
    }
    
    console.log('')
  }
  
  // Test version data
  try {
    console.log('🏷️  Testing translation versions...')
    const versionCommand = `npx wrangler kv key get "translation_versions" --binding="TRANSLATIONS" --env="production" --remote`
    const versionResult = execSync(versionCommand, { encoding: 'utf8' })
    
    if (versionResult && versionResult.trim() !== 'null') {
      const versionData = JSON.parse(versionResult)
      console.log('  ✅ Version data found:')
      console.log('  📅 Versions:', JSON.stringify(versionData, null, 2))
    } else {
      console.log('  ❌ No version data found')
    }
  } catch (error) {
    console.log(`  ❌ Error fetching versions: ${error.message.split('\n')[0]}`)
  }
  
  console.log('\n🎉 KV storage test completed!')
}

testKVStorage().catch(console.error)
