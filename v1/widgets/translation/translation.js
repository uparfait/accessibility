/* translation/translation.js: Translates the panel into the visitor's language */
accessibles_core.define('translation/translation.js', ['translation-2.js', 'translation-3.js', 'translation-4.js'], function (core) {
  'use strict';
  // Every language as an option for a list
  core.language_options = function (orig_label) {
    return [{ v: '', l: orig_label || 'Original language' }].concat(core.languages.map(function (language) { return { v: language[0], l: language[2] || language[1], s: language[2] ? language[1] : '', k: language[0] }; }));
  };
  // The name of a language by its code
  core.language_name = function (code) { for (var count = 0; count < core.languages.length; count++) if (core.languages[count][0] === code) return core.languages[count][2] || core.languages[count][1]; return code; };

  // Google Translate for individual strings (the panel's own text and help descriptions)
  core.google_translate_text = function (list, target_lang, on_progress, source_lang) {
    var batches = [], current = [], text_length = 0;
    list.forEach(function (text) { if (text_length + text.length > 1400 && current.length) { batches.push(current); current = []; text_length = 0; } current.push(text); text_length += text.length + 1; });
    if (current.length) batches.push(current);
    function one(batch) {
      var url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=' + encodeURIComponent(source_lang || 'en') + '&tl=' + encodeURIComponent(target_lang) + '&dt=t&q=' + encodeURIComponent(batch.join('\n'));
      return fetch(url).then(function (response) { if (!response.ok) throw new Error(response.status); return response.json(); }).then(function (json) {
        var out = ((json && json[0]) || []).map(function (segment) { return segment[0] || ''; }).join('').split('\n');
        if (out.length !== batch.length) {
          if (batch.length === 1) return [out.join(' ').trim()];
          return Promise.all(batch.map(function (text) { return one([text]).then(function (result) { return result[0]; }); }));
        }
        return out.map(function (text) { return text.trim(); });
      });
    }
    var done = 0;
    return batches.reduce(function (chain, batch) {
      return chain.then(function (collected) { return one(batch).then(function (result) { done++; if (on_progress) on_progress(done / batches.length); return collected.concat(result); }); });
    }, Promise.resolve([]));
  };
  // A panel text in the visitor's language
  core.translate_ui = function (text) { return core.panel_translation.translated(text); };

  // Languages offered by Google Translate: [code, English name, native name]
  core.languages = [['af','Afrikaans'],['sq','Albanian','Shqip'],['am','Amharic','አማርኛ'],['ar','Arabic','العربية'],['hy','Armenian','Հայերեն'],['as','Assamese','অসমীয়া'],['ay','Aymara'],['az','Azerbaijani','Azərbaycanca'],
    ['bm','Bambara'],['eu','Basque','Euskara'],['be','Belarusian','Беларуская'],['bn','Bengali','বাংলা'],['bho','Bhojpuri'],['bs','Bosnian','Bosanski'],['bg','Bulgarian','Български'],['ca','Catalan','Català'],['ceb','Cebuano'],
    ['ny','Chichewa'],['zh-CN','Chinese (Simplified)','简体中文'],['zh-TW','Chinese (Traditional)','繁體中文'],['co','Corsican','Corsu'],['hr','Croatian','Hrvatski'],['cs','Czech','Čeština'],['da','Danish','Dansk'],
    ['dv','Dhivehi'],['doi','Dogri'],['nl','Dutch','Nederlands'],['en','English'],['eo','Esperanto'],['et','Estonian','Eesti'],['ee','Ewe'],['tl','Filipino'],['fi','Finnish','Suomi'],['fr','French','Français'],
    ['fy','Frisian','Frysk'],['gl','Galician','Galego'],['ka','Georgian','ქართული'],['de','German','Deutsch'],['el','Greek','Ελληνικά'],['gn','Guarani'],['gu','Gujarati','ગુજરાતી'],['ht','Haitian Creole','Kreyòl ayisyen'],
    ['ha','Hausa'],['haw','Hawaiian'],['iw','Hebrew','עברית'],['hi','Hindi','हिन्दी'],['hmn','Hmong'],['hu','Hungarian','Magyar'],['is','Icelandic','Íslenska'],['ig','Igbo'],['ilo','Ilocano'],['id','Indonesian','Bahasa Indonesia'],
    ['ga','Irish','Gaeilge'],['it','Italian','Italiano'],['ja','Japanese','日本語'],['jw','Javanese','Basa Jawa'],['kn','Kannada','ಕನ್ನಡ'],['kk','Kazakh','Қазақша'],['km','Khmer','ខ្មែរ'],['rw','Kinyarwanda','Ikinyarwanda'],
    ['gom','Konkani'],['ko','Korean','한국어'],['kri','Krio'],['ku','Kurdish (Kurmanji)','Kurdî'],['ckb','Kurdish (Sorani)','کوردی'],['ky','Kyrgyz','Кыргызча'],['lo','Lao','ລາວ'],['la','Latin','Latina'],['lv','Latvian','Latviešu'],
    ['ln','Lingala'],['lt','Lithuanian','Lietuvių'],['lg','Luganda'],['lb','Luxembourgish','Lëtzebuergesch'],['mk','Macedonian','Македонски'],['mai','Maithili'],['mg','Malagasy'],['ms','Malay','Bahasa Melayu'],
    ['ml','Malayalam','മലയാളം'],['mt','Maltese','Malti'],['mi','Maori','Māori'],['mr','Marathi','मराठी'],['mni-Mtei','Meiteilon (Manipuri)'],['lus','Mizo'],['mn','Mongolian','Монгол'],['my','Myanmar (Burmese)','မြန်မာ'],
    ['ne','Nepali','नेपाली'],['no','Norwegian','Norsk'],['or','Odia (Oriya)','ଓଡ଼ିଆ'],['om','Oromo','Afaan Oromoo'],['ps','Pashto','پښتو'],['fa','Persian','فارسی'],['pl','Polish','Polski'],['pt','Portuguese','Português'],
    ['pa','Punjabi','ਪੰਜਾਬੀ'],['qu','Quechua','Runasimi'],['ro','Romanian','Română'],['ru','Russian','Русский'],['sm','Samoan'],['sa','Sanskrit','संस्कृतम्'],['gd','Scots Gaelic','Gàidhlig'],['nso','Sepedi'],['sr','Serbian','Српски'],
    ['st','Sesotho'],['sn','Shona'],['sd','Sindhi','سنڌي'],['si','Sinhala','සිංහල'],['sk','Slovak','Slovenčina'],['sl','Slovenian','Slovenščina'],['so','Somali','Soomaali'],['es','Spanish','Español'],['su','Sundanese'],
    ['sw','Swahili','Kiswahili'],['sv','Swedish','Svenska'],['tg','Tajik','Тоҷикӣ'],['ta','Tamil','தமிழ்'],['tt','Tatar','Татарча'],['te','Telugu','తెలుగు'],['th','Thai','ไทย'],['ti','Tigrinya','ትግርኛ'],['ts','Tsonga'],
    ['tr','Turkish','Türkçe'],['tk','Turkmen','Türkmençe'],['ak','Twi'],['uk','Ukrainian','Українська'],['ur','Urdu','اردو'],['ug','Uyghur','ئۇيغۇرچە'],['uz','Uzbek','Oʻzbekcha'],['vi','Vietnamese','Tiếng Việt'],
    ['cy','Welsh','Cymraeg'],['xh','Xhosa','isiXhosa'],['yi','Yiddish','ייִדיש'],['yo','Yoruba','Yorùbá'],['zu','Zulu','isiZulu']];
  core.rtl_languages = /^(ar|iw|he|fa|ur|ps|sd|ug|yi|ckb|dv)(-|$)/i;

  // Translates the panel's own interface into the visitor's chosen language
  core.panel_translation = {
    panel_progress: 1,
    lang: ''
  };
  core.panel_translation.cache = {};
});
