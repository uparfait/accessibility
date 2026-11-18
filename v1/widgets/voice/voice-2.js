/* voice/voice-2.js: Voice, continued */
accessibles_core.define('voice/voice-2.js', [], function (core) {
  'use strict';
  // Brings this part of the page in line with the settings
  core.voice.sync = function () {
    var want = core.state.voiceNav ? 'nav' : core.state.dictation ? 'dict' : '';
    var lang = want ? core.user_lang() : '';
    if (want === this.mode && lang === this.lang) return;
    var first = want && want !== this.mode;
    this.stop();
    if (want) this.start(want, first);
  };
  // Starts listening in a mode: voice commands or talk & type
  core.voice.start = function (mode, first) {
    var key = mode === 'nav' ? 'voiceNav' : 'dictation';
    if (!core.speech_recognition) {
      core.toast(core.translate_ui('Voice input is not supported in this browser. Try Chrome, Edge or Safari.'));
      core.set_state(key, false, true);
      return;
    }
    this.mode = mode; this.want = true; this.fails = 0; this.pending = null;
    this.lang = core.user_lang();
    this.prepare(this.lang);
    core.ui.heard = [];
    this.listen();
    core.ui.pill('');
    // Keep listening until the visitor turns it off: restart after silence, errors or a hidden tab
    var self = this;
    core.cancel_later(this.watchdog);
    this.watchdog = core.native_set_interval.call(window, function () { if (self.want && !self.running && !document.hidden) self.listen(); }, 4000);
    if (first && mode === 'dict' && !core.last_editable) core.toast(core.translate_ui('Click into a text box, then start speaking'));
  };
});
