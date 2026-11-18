/* voice/voice-3.js: Voice, continued */
accessibles_core.define('voice/voice-3.js', [], function (core) {
  'use strict';
  // Starts one round of listening with the microphone
  core.voice.listen = function () {
    if (!this.want || this.running) return;
    var self = this, mode = this.mode, session;
    try { session = new core.speech_recognition(); } catch (error) { return; }
    session.lang = this.lang;
    session.continuous = true;
    session.interimResults = true;
    session.maxAlternatives = 3;
    session.onstart = function () { self.running = true; };
    session.onresult = function (event) {
      self.fails = 0;
      for (var index = event.resultIndex; index < event.results.length; index++) {
        var result = event.results[index], spoken_text = String(result[0].transcript || '').trim();
        if (!spoken_text) continue;
        if (!result.isFinal) { if (!self.hearing_self(spoken_text)) core.ui.pill(spoken_text, true); continue; }
        var alts = [];
        for (var count = 0; count < result.length; count++) alts.push(String(result[count].transcript || '').trim());
        self.heard(spoken_text, alts, mode);
      }
    };
    session.onerror = function (event) {
      var event_2 = event.error;
      if (event_2 === 'not-allowed' || event_2 === 'service-not-allowed') {
        self.halt(core.translate_ui('Microphone access was blocked. Allow the microphone for this site to use voice.'));
      } else if (event_2 === 'audio-capture') {
        self.halt(core.translate_ui('No microphone was found. Connect one and turn this on again.'));
      } else if (event_2 === 'language-not-supported' && self.lang !== 'en-US') {
        self.lang = 'en-US';
      } else if (event_2 !== 'no-speech' && event_2 !== 'aborted') self.fails++;
    };
    session.onend = function () {
      self.running = false;
      if (self.recognition !== session || !self.want) return;
      // Wait a little longer after each failure (network problems), but never give up while it is on
      core.run_later(function () { if (self.want && self.recognition === session && !self.running && !document.hidden) self.listen(); }, Math.min(5000, 250 * Math.pow(2, Math.min(self.fails, 5))));
    };
    this.recognition = session;
    try { session.start(); } catch (error) { /* already started */ }
  };
  // Stops listening and tells the visitor why
  core.voice.halt = function (message) {
    var key = this.mode === 'nav' ? 'voiceNav' : 'dictation';
    this.want = false;
    core.toast(message);
    core.set_state(key, false, true);
  };
});
