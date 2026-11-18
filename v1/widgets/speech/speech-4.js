/* speech/speech-4.js: Speaks text aloud for read aloud, voice commands and tips, continued */
accessibles_core.define('speech/speech-4.js', [], function (core) {
  'use strict';
  // Moves on to the next part
  core.speech.next = function (run_id) {
    if (run_id !== this.run_id || !this.active) return;
    this.item_index++;
    var item = this.items[this.item_index];
    this.mark(null);
    if (!item) { this.active = false; this.current_lang = ''; this.tag = ''; core.ui.speech_state(); if (core.has('voice')) core.voice.heard_speech(); return; }
    this.current_lang = item.lang || '';
    this.mark(item.element);
    var self = this, chunks = this.chunks(item.text);
    var run_next = function (list) {
      var count = 0;
      var step = function () {
        if (run_id !== self.run_id || !self.active) return;
        if (count >= list.length) { self.next(run_id); return; }
        self.utter(list[count++], run_id, step, true);
      };
      // Some browsers silently drop speech queued straight after a cancel, so wait a moment
      core.run_later(step, 90);
    };
    var target_lang = this.read_lang(), src = (core.state.translateTo || core.page_lang()).split('-')[0].toLowerCase();
    if (!item.raw && core.state.ttsLang && target_lang.split('-')[0].toLowerCase() !== src) core.google_translate_text(chunks, target_lang, null, 'auto').then(run_next, function () { run_next(chunks); });
    else run_next(chunks);
  };
    // Speak one chunk. If the chosen voice does not start, try once more with the system voice.
  core.speech.utter = function (text, run_id, done, with_voice) {
    var self = this, started = false, finished = false, retried = false;
    var utterance = new SpeechSynthesisUtterance(text);
    var value = with_voice ? this.voice() : null;
    if (value) { utterance.voice = value; utterance.lang = value.lang; } else utterance.lang = this.read_lang();
    utterance.rate = core.state.ttsRate; utterance.pitch = core.state.ttsPitch;
    var finish = function () { if (finished) return; finished = true; done(); };
    var retry = function () {
      if (retried || finished) return;
      retried = true; finished = true;
      utterance.onend = utterance.onerror = null;
      try { window.speechSynthesis.cancel(); } catch (error) { /* ignore */ }
      core.run_later(function () { if (run_id === self.run_id && self.active) self.utter(text, run_id, done, false); }, 120);
    };
    utterance.onstart = function () { started = true; };
    utterance.onend = function () { if (!started && with_voice && value) { retry(); return; } finish(); };
    utterance.onerror = function (event) {
      if (event && (event.error === 'interrupted' || event.error === 'canceled')) { finished = true; return; }
      if (!started && with_voice && value) retry(); else finish();
    };
    this.current = utterance;
    // Remember what was spoken, so voice input can tell the page's own voice from the visitor's
    this.said.push({ type: text, at: Date.now() }); if (this.said.length > 4) this.said.shift();
    try { window.speechSynthesis.resume(); } catch (error) { /* ignore */ }
    window.speechSynthesis.speak(utterance);
    if (with_voice && value) core.run_later(function () { if (!started && !finished && run_id === self.run_id && !window.speechSynthesis.speaking) retry(); }, 2500);
  };
});
