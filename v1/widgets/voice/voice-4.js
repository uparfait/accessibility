/* voice/voice-4.js: Voice, continued */
accessibles_core.define('voice/voice-4.js', [], function (core) {
  'use strict';
  // Stops listening
  core.voice.stop = function () {
    this.want = false; this.mode = ''; this.lang = ''; this.running = false; this.pending = null;
    this.end_pick(false);
    window.clearInterval(this.watchdog);
    if (this.recognition) { var session = this.recognition; this.recognition = null; try { session.abort(); } catch (error) { /* ignore */ } }
    this.hide_numbers();
    core.ui.ask(null);
    core.ui.pill('');
  };
    // The microphone can hear the page reading out loud. Words that match what was just spoken are ignored.
  core.voice.hearing_self = function (spoken_text) {
    if (!((core.speech.active && !core.speech.paused) || Date.now() < this.quiet_until)) return false;
    var heard = core.normalize_words(spoken_text).split(' ').filter(Boolean);
    if (heard.length < 2) return false;
    var spoken = core.normalize_words(core.speech.said.map(function (entry) { return entry.type; }).join(' ')).split(' ');
    var hit = 0;
    heard.forEach(function (word) { for (var count = 0; count < spoken.length; count++) { if (core.edit_ratio(word, spoken[count]) >= 0.8) { hit++; return; } } });
    return hit / heard.length >= 0.6;
  };
  // Ignores the microphone for a moment while the widget itself is speaking
  core.voice.heard_speech = function () { this.quiet_until = Date.now() + 1500; };

    // Phrases in the visitor's language, so commands work in any language the visitor speaks
  core.voice.local = {};
  // Translates the command phrases into the visitor's language
  core.voice.prepare = function (lang) {
    if (!lang || /^en(-|$)/i.test(lang) || this.local[lang]) return;
    var self = this, list = [];
    this.local[lang] = {};
    this.all_phrases().forEach(function (phrase) { if (list.indexOf(phrase) < 0) list.push(phrase); });
    var item = core.panel_translation.cache[lang] || (core.panel_translation.cache[lang] = {});
    var todo = list.filter(function (phrase) { return item['v:' + phrase] == null; });
    var fill = function () { list.forEach(function (item_2) { if (item['v:' + item_2]) self.local[lang][item_2] = core.normalize_words(item['v:' + item_2]); }); };
    if (!todo.length) { fill(); return; }
    core.google_translate_text(todo, lang).then(function (out) { todo.forEach(function (phrase, index) { if (out[index]) item['v:' + phrase] = out[index]; }); core.panel_translation.persist(); fill(); }, function () { delete self.local[lang]; });
  };
  // Every phrase the visitor can say, to translate them all at once
  core.voice.all_phrases = function () {
    var out = this.yes_words.concat(this.no_words, this.next_words, this.previous_words, this.stop_words_list, this.all_words);
    this.nav_cmds().concat(this.dict_cmds()).forEach(function (command) { out = out.concat(command.say); });
    this.slots.forEach(function (slider) { out = out.concat(slider.say); });
    core.spoken_punctuation.forEach(function (punctuation) { out.push(punctuation[0]); });
    return out;
  };
  // A phrase and its translation in the visitor's language
  core.voice.variants = function (phrase) { var item = this.local[this.lang]; return item && item[phrase] && item[phrase] !== phrase ? [phrase, item[phrase]] : [phrase]; };
  // How well what was said matches some phrases
  core.voice.score = function (said, phrases) {
    var best = 0, self = this;
    phrases.forEach(function (phrase) { self.variants(phrase).forEach(function (variant) { var text = core.word_match(said, variant); if (text > best) best = text; }); });
    return best;
  };
});
