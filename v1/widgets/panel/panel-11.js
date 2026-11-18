/* panel/panel-11.js: The button, the panel, its tabs, tiles, views, help and messages, continued */
accessibles_core.define('panel/panel-11.js', [], function (core) {
  'use strict';
    // Keys and clicks on the page: Alt+A, the reading keys and Escape
  core.ui.bind_page_keys = function () {
    var self = this;
    document.addEventListener('pointerdown', function (event) { if (!core.is_ours(event.target)) { self.close_select(); self.close_color(); } }, true);

    // Global shortcut: Alt+A opens and closes the widget
    document.addEventListener('keydown', function (event) {
      if (event.altKey && !event.ctrlKey && !event.metaKey && (event.code === 'KeyA' || event.key === 'a' || event.key === 'A') && !event.shiftKey) {
        event.preventDefault(); self.toggle(true);
      } else if (core.state.tts && event.altKey && !event.ctrlKey && !event.metaKey && (event.code === 'KeyR' || event.code === 'KeyN')) {
        // Reading keys: Alt+R read or pause, Alt+N next paragraph, Alt+Shift+N previous
        event.preventDefault();
        if (event.code === 'KeyR') { if (core.speech.active) core.speech.pause(); else core.speech.read_page(); }
        else core.speech.skip(event.shiftKey ? -1 : 1);
      } else if (event.key === 'Escape' && core.has('voice') && (core.voice.pick || core.voice.pending)) {
        core.voice.stop_all();
      } else if (event.key === 'Escape' && core.speech.active && core.find_one('.help').hidden) {
        core.speech.stop();
      } else if (event.key === 'Escape' && !core.is_ours(event.target)) {
        if (!core.find_one('.help').hidden) self.help(null);
        else if (core.has('reader-view') && !core.find_one('.reader').hidden) self.reader(false);
        else if (core.has('dictionary') && !core.find_one('.dict').hidden) self.dict(null);
      }
    }, true);
    document.addEventListener('pointerdown', function (event) {
      if (core.has('dictionary') && !core.is_ours(event.target) && !core.find_one('.dict').hidden) self.dict(null);
    }, true);
    document.addEventListener('focusin', function (event) { if (!core.is_ours(event.target) && core.state.vkeyboard && core.has('on-screen-keyboard')) self.vkb_target(); if (!core.is_ours(event.target) && core.state.dictation && core.has('voice')) core.run_later(function () { self.pill(''); }, 0); }, true);
  };
    // The button and panel follow the window size; the voice list follows the installed voices
  core.ui.bind_resize = function () {
    var self = this;
    var on_resize = core.debounce(function () { self.scale(); self.place_launcher(); }, 60);
    window.addEventListener('resize', on_resize);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', on_resize);
    window.addEventListener('orientationchange', on_resize);
    if (core.speech.ok && window.speechSynthesis.addEventListener) window.speechSynthesis.addEventListener('voiceschanged', function () {
      var element = core.find_one('[data-sel="voice"]'), detail = self.selects.voice, current = detail.options().filter(function (option) { return option.v === core.state.ttsVoice; })[0];
      if (element && current) core.find_one('.cv', element).textContent = current.l;
    });
  };
});
