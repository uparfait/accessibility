/* speech/speech-2.js: Speaks text aloud for read aloud, voice commands and tips, continued */
accessibles_core.define('speech/speech-2.js', [], function (core) {
  'use strict';
  // Brings this part of the page in line with the settings
  core.speech.sync = function () {
    if (core.state.tts && !this.on) {
      if (!this.ok) { core.toast('Read aloud is not supported in this browser'); core.set_state('tts', false, true); return; }
      this.on = true;
      document.addEventListener('click', this.on_click, true);
      document.addEventListener('focusin', this.on_focus, true);
      document.addEventListener('mouseup', this.on_select, true);
      core.ui.speech_bar(true);
    } else if (!core.state.tts && this.on) {
      this.on = false;
      this.stop();
      document.removeEventListener('click', this.on_click, true);
      document.removeEventListener('focusin', this.on_focus, true);
      document.removeEventListener('mouseup', this.on_select, true);
      core.ui.speech_bar(false);
    }
  };
  // Splits text into pieces short enough to speak
  core.speech.chunks = function (text) {
    var parts = String(text).replace(/\s+/g, ' ').match(/[^.!?;:。！？]+[.!?;:。！？]*\s*/g) || [text];
    var out = [], buffer = '';
    parts.forEach(function (piece) {
      while (piece.length > 220) { var cut = piece.lastIndexOf(' ', 200); if (cut < 60) cut = 200; out.push(piece.slice(0, cut)); piece = piece.slice(cut); }
      if ((buffer + piece).length > 220) { if (buffer.trim()) out.push(buffer); buffer = piece; } else buffer += piece;
    });
    if (buffer.trim()) out.push(buffer);
    return out.filter(function (sentence) { return /\S/.test(sentence); });
  };
  // Speaks some text
  core.speech.say = function (text, element) { this.play([{ text: text, element: element }]); };
    // Spoken instructions from the panel, always in the visitor's language
  core.speech.guide = function (lines, tag) {
    if (!this.ok) return;
    var self = this, list = [].concat(lines), target_lang = core.user_lang();
    var run_next = function (out, lang) { self.play(out.map(function (item) { return { text: item, element: null, lang: lang, raw: true, tag: tag || '' }; })); };
    if (/^en(-|$)/i.test(target_lang)) { run_next(list, 'en'); return; }
    core.google_translate_text(list, target_lang).then(function (out) { run_next(list.map(function (text, index) { return out[index] || text; }), target_lang); }, function () { run_next(list, 'en'); });
  };
  // Reads a list of parts aloud, one after another
  core.speech.play = function (items) {
    if (!this.ok) return;
    this.stop();
    this.active = true; this.paused = false;
    this.items = items.slice(); this.item_index = -1;
    this.tag = (items[0] && items[0].tag) || '';
    this.run_id++;
    this.next(this.run_id);
    core.ui.speech_state();
  };
});
