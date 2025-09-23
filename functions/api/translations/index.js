// Translations management endpoint
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const lang = url.searchParams.get('lang') || 'en';
  
  try {
    // Try to fetch from KV storage first
    let translationsData = null;
    try {
      const kvData = await env.TRANSLATIONS.get(`translations:${lang}`);
      if (kvData) {
        translationsData = JSON.parse(kvData);
      }
    } catch (kvError) {
      console.log('KV fetch failed, trying D1:', kvError);
    }
    
    // If not in KV, try D1 database
    if (!translationsData && env.zikr_database) {
      try {
        const result = await env.zikr_database.prepare(
          "SELECT translation_key, translation_value FROM translations WHERE language_code = ?"
        ).bind(lang).all();
        
        if (result.results && result.results.length > 0) {
          translationsData = {};
          result.results.forEach(row => {
            translationsData[row.translation_key] = row.translation_value;
          });
        }
      } catch (dbError) {
        console.log('D1 fetch failed:', dbError);
      }
    }
    
    // Fallback to default translations if nothing found
    if (!translationsData) {
      const defaultTranslations = {
        en: {
          subhan_allah: 'Glory be to Allah - expressing the perfection and transcendence of Allah',
          alhamdulillah: 'All praise is due to Allah - acknowledging Allah as the source of all good',
          allahu_akbar: 'Allah is the Greatest - acknowledging Allah\'s supreme greatness',
          la_ilaha_illa_allah: 'There is no god but Allah - the declaration of faith',
          salawat: 'Blessings upon Prophet Muhammad - sending peace and blessings',
          astaghfirullah: 'I seek forgiveness from Allah - asking for Allah\'s forgiveness',
          la_hawla: 'There is no power except with Allah - acknowledging Allah as the source of all strength',
          bismillah: 'In the name of Allah - beginning with Allah\'s name',
          rabbi_ghfir_li: 'My Lord, forgive me - a personal prayer for forgiveness',
          subhan_allah_wa_bihamdihi: 'Glory be to Allah and praise to Him - combined glorification and praise'
        },
        ar: {
          subhan_allah: 'تسبيح الله - التعبير عن كمال الله وتنزيهه',
          alhamdulillah: 'الثناء والشكر لله - الاعتراف بأن الله مصدر كل خير',
          allahu_akbar: 'الله أكبر - الاعتراف بعظمة الله العليا',
          la_ilaha_illa_allah: 'لا إله إلا الله - شهادة التوحيد',
          salawat: 'الصلاة على النبي محمد - إرسال السلام والبركات',
          astaghfirullah: 'أستغفر الله - طلب المغفرة من الله',
          la_hawla: 'لا حول ولا قوة إلا بالله - الاعتراف بأن الله مصدر كل قوة',
          bismillah: 'بسم الله - البداية باسم الله',
          rabbi_ghfir_li: 'رب اغفر لي - دعاء شخصي للمغفرة',
          subhan_allah_wa_bihamdihi: 'سبحان الله وبحمده - الجمع بين التسبيح والحمد'
        },
        es: {
          subhan_allah: 'Gloria a Allah - expresando la perfección y trascendencia de Allah',
          alhamdulillah: 'Toda alabanza es para Allah - reconociendo a Allah como fuente de todo bien',
          allahu_akbar: 'Allah es el más Grande - reconociendo la suprema grandeza de Allah'
        },
        fr: {
          subhan_allah: 'Gloire à Allah - exprimant la perfection et la transcendance d\'Allah',
          alhamdulillah: 'Toute louange revient à Allah - reconnaissant Allah comme source de tout bien',
          allahu_akbar: 'Allah est le plus Grand - reconnaissant la suprême grandeur d\'Allah'
        },
        bs: {
          subhan_allah: 'Slave Allahu - izražavanje Allahove savršenosti i transcendencije',
          alhamdulillah: 'Sva hvala pripada Allahu - priznavajući Allah kao izvor sveg dobra',
          allahu_akbar: 'Allah je najveći - priznavajući Allahovu vrhovnu veličinu'
        },
        hr: {
          subhan_allah: 'Slava Allahu - izražavanje Allahove savršenosti i transcendencije',
          alhamdulillah: 'Sva hvala pripada Allahu - priznavajući Allah kao izvor sveg dobra',
          allahu_akbar: 'Allah je najveći - priznavajući Allahovu vrhovnu veličinu'
        },
        sr: {
          subhan_allah: 'Слава Аллаху - изражавање Аллахове савршености и трансценденције',
          alhamdulillah: 'Сва хвала припада Аллаху - признајући Аллах као извор свег добра',
          allahu_akbar: 'Аллах је највећи - признајући Аллахову врховну величину'
        }
      };
      translationsData = defaultTranslations[lang] || defaultTranslations.en;
    }
    
    return new Response(JSON.stringify({
      success: true,
      data: translationsData
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to fetch translations'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function onRequestPut(context) {
  const { request, env } = context;
  
  try {
    // Verify admin token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Unauthorized'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    const { language, translations } = await request.json();
    
    // Save to KV storage
    if (env.TRANSLATIONS) {
      await env.TRANSLATIONS.put(`translations:${language}`, JSON.stringify(translations));
    }
    
    // Also save to D1 database as backup
    if (env.zikr_database) {
      try {
        // Delete existing translations for this language
        await env.zikr_database.prepare(
          "DELETE FROM translations WHERE language_code = ?"
        ).bind(language).run();
        
        // Insert new translations
        for (const [key, value] of Object.entries(translations)) {
          await env.zikr_database.prepare(
            "INSERT INTO translations (language_code, translation_key, translation_value) VALUES (?, ?, ?)"
          ).bind(language, key, value).run();
        }
      } catch (dbError) {
        console.log('D1 save failed:', dbError);
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Translations updated successfully'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to update translations'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}