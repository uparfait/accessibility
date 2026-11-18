/* dictionary/dictionary-2.js: Dictionary, continued */
accessibles_core.define('dictionary/dictionary-2.js', [], function (core) {
  'use strict';
  // The meaning from the site's own glossary
  core.dictionary.glossary = function (word) {
    var lower_word = word.toLowerCase();
    var group = core.config.glossary;
    if (group) { for (var key in group) if (key.toLowerCase() === lower_word) return { word: key, defs: [{ pos: 'Glossary', text: String(group[key]) }] }; }
    var abbr = Array.prototype.filter.call(document.querySelectorAll('abbr[title],dfn[title],acronym[title]'), function (abbreviation) { return core.text_of(abbreviation).toLowerCase() === lower_word; })[0];
    if (abbr) return { word: core.text_of(abbr), defs: [{ pos: 'On this page', text: abbr.getAttribute('title') }] };
    return null;
  };
  // Looks up the meaning of a word
  core.dictionary.lookup = function (word, rect) {
    core.ui.dict({ word: word, loading: true }, rect);
    var local = this.glossary(word);
    if (local) { core.ui.dict(local, rect); return; }
    var key = word.toLowerCase();
    if (this.cache[key]) { core.ui.dict(this.cache[key], rect); return; }
    var lang = core.page_lang().split('-')[0].toLowerCase();
    var url = core.config.dictionary_url ? core.config.dictionary_url.replace('{word}', encodeURIComponent(word)).replace('{lang}', lang)
      : lang === 'en' ? 'https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(key) : '';
    var self = this;
    var wiki = function () {
      return fetch('https://' + lang + '.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(word)).then(function (response) { if (!response.ok) throw 0; return response.json(); })
        .then(function (json) { if (!json.extract || json.type === 'disambiguation') throw 0; return { word: json.title || word, defs: [{ pos: 'Encyclopedia', text: json.extract.slice(0, 420) }] }; });
    };
    var list = url ? fetch(url).then(function (response) { if (!response.ok) throw 0; return response.json(); }).then(function (json) {
      var event = Array.isArray(json) ? json[0] : json;
      if (!event || !event.meanings) throw 0;
      var defs = [];
      event.meanings.forEach(function (meaning) { (meaning.definitions || []).slice(0, 2).forEach(function (definition) { if (defs.length < 4) defs.push({ pos: meaning.partOfSpeech || '', text: definition.definition, example: definition.example || '' }); }); });
      if (!defs.length) throw 0;
      return { word: event.word || word, phonetic: event.phonetic || '', defs: defs };
    }).catch(wiki) : wiki();
    list.then(function (result) { self.cache[key] = result; if (self.on) core.ui.dict(result, rect); })
      .catch(function () { if (self.on) core.ui.dict({ word: word, defs: [], none: true }, rect); });
  };
  core.dictionary.on_double_click = core.dictionary.on_double_click.bind(core.dictionary);
  core.dictionary.on_up = core.dictionary.on_up.bind(core.dictionary);
  core.dictionary.on_key_up = core.dictionary.on_key_up.bind(core.dictionary);
  core.register('module', { folder: 'dictionary', order: 150, module: core.dictionary });
});
