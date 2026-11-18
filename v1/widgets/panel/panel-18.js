/* panel/panel-18.js: The button, the panel, its tabs, tiles, views, help and messages, continued */
accessibles_core.define('panel/panel-18.js', [], function (core) {
  'use strict';
    /* --- custom select with search (no native select) --- */
  core.ui.selects = {
    voice: {
      title: 'Voice',
      options: function () {
        if (!core.speech.ok) return [{ v: '', l: 'Not supported in this browser' }];
        var lang = core.speech.read_lang().split('-')[0].toLowerCase();
        var voices = core.speech.voices().filter(function (voice) { return !core.state.ttsLang || (voice.lang || '').toLowerCase().split(/[-_]/)[0] === lang; }).sort(function (first, second) {
          var rank_first = first.lang.toLowerCase().indexOf(lang) === 0 ? 0 : 1, labelled_by = second.lang.toLowerCase().indexOf(lang) === 0 ? 0 : 1;
          return rank_first - labelled_by || first.name.localeCompare(second.name);
        });
        var auto = lang === 'en' ? 'British English, male (default)' : 'Automatic';
        return [{ v: '', l: auto }].concat(voices.map(function (voice) { return { v: voice.voiceURI, l: voice.name.replace(/^(Microsoft|Google|Apple)\s+/, ''), s: voice.lang, k: voice.name }; }));
      },
      value: function () { return core.state.ttsVoice; },
      pick: function (value) { core.set_state('ttsVoice', value); if (core.speech.ok) core.speech.say(core.translate_ui('This is how the reading voice sounds.'), null); }
    },
    ttslang: {
      title: 'Reading language',
      options: function () {
        var seen = {}, out = [{ v: '', l: 'Same as the page' }];
        core.speech.voices().forEach(function (voice) {
          var base = (voice.lang || '').split(/[-_]/)[0].toLowerCase();
          if (!base || seen[base]) return;
          seen[base] = 1;
          var code = base === 'zh' ? 'zh-CN' : base === 'he' ? 'iw' : base;
          var row = core.languages.filter(function (language_row) { return language_row[0] === code; })[0];
          out.push({ v: base, l: row ? (row[2] || row[1]) : base, s: row && row[2] ? row[1] : '', k: base, native: true });
        });
        return out.slice(0, 1).concat(out.slice(1).sort(function (first, second) { return first.l.localeCompare(second.l); }));
      },
      value: function () { return core.state.ttsLang; },
      pick: function (value) {
        core.set_state('ttsLang', value);
        core.set_state('ttsVoice', '');
        if (core.ui.tab === 'reading' && !core.ui.view) core.ui.render_tab('reading');
        if (core.speech.ok) core.speech.say(core.translate_ui('This is how the reading voice sounds.'), null);
      }
    },
    reptype: {
      title: 'Problem type',
      options: function () { return ['Something is hard to read', 'I cannot use it with a keyboard', 'My screen reader has trouble', 'Images or media have no description', 'A form does not work for me', 'The accessibility features', 'Something else'].map(function (option) { return { v: option, l: option }; }); },
      value: function () { return core.ui.report_type || 'Something is hard to read'; },
      pick: function (value) { core.ui.report_type = value; }
    },
    helplang: {
      title: 'Language',
      options: function () { return core.language_options('English'); },
      value: function () { return core.ui.help_lang || ''; },
      pick: function (value) { core.ui.help_lang = value; core.ui.help_translate(); }
    }
  };
});
