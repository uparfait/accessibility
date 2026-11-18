/* start/start-2.js: Starts the widget once the page is ready, continued */
accessibles_core.define('start/start-2.js', [], function (core) {
  'use strict';
  // A small API for site owners: window.Accessibles
  core.expose_api = function () {
    window.Accessibles = {
      version: core.version,
      open: function () { core.ui.show(); }, close: function () { core.ui.close(); }, toggle: function () { core.ui.toggle(); },
      get: function (key) { return key ? core.state[key] : JSON.parse(JSON.stringify(core.state)); },
      set: function (key, value) { if (key in core.defaults) core.set_state(key, value); },
      profile: function (id) { core.toggle_profile(id); },
      reset: function () { core.reset_all(); },
      audit: function () { return core.has('page-check') ? core.run_audit() : null; },
      readPage: function () { if (!core.state.tts) core.set_state('tts', true); core.speech.read_page(); }
    };
  };
  core.started = false;

  // Apply saved visual settings as early as possible to avoid a flash of the unadjusted page
  core.when_settled(function () {
    if (document.head && document.readyState === 'loading') {
      try { core.config = core.read_config(null); core.palette = core.build_palette(core.config.color, core.config.bg, core.config.icon_color); core.set_page_css(core.build_page_css()); } catch (error) { /* will apply at start */ }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', core.start);
    else core.start();
    window.addEventListener('load', core.start);
  });
});
