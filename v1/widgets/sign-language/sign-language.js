/* sign-language/sign-language.js: Sign language: ASL videos and the Libras avatar */
accessibles_core.define('sign-language/sign-language.js', ['sign-language-2.js', 'sign-language-3.js', 'sign-language-4.js', 'sign-language-5.js'], function (core) {
  'use strict';
  core.register('page_css', { folder: 'sign-language', order: 220, rules: function () {
    var list = [];
    if (core.sign_language.libras && core.state.sign !== 'libras') list.push('[vw]{display:none!important}');
    return list;
  } });
  core.sign_language = {
    mode: '',
    recorder: new core.change_recorder(),
    wrap: null,
    script_state: '',
    wait_timer: 0
  };
    // What each service is doing right now, shown under its switch: off, loading, on, warn or error
  core.sign_language.statuses = {
    asl: { s: 'off', message: 'Off. Turn on to watch sign language videos for parts of this page.' },
    libras: { s: 'off', message: 'Off. Turn on to add a Libras interpreter to this page.' }
  };
  // Shows a status message about sign language
  core.sign_language.report = function (kind, state, message, tell) {
    this.statuses[kind] = { s: state, message: message };
    core.ui.sign_status(kind);
    if (tell) core.toast(core.translate_ui(message));
  };
  // Brings this part of the page in line with the settings
  core.sign_language.sync = function () {
    if (core.state.sign === this.mode) return;
    var was = this.mode;
    this.mode = core.state.sign;
    if (was === 'asl') {
      this.recorder.revert(); document.removeEventListener('click', this.on_click, true); core.ui.sign_player(null);
      this.report('asl', 'off', 'Off. Sign language videos are no longer offered on this page.', !core.state.sign);
    }
    if (was === 'libras') this.remove_libras();
    if (core.state.sign === 'asl') return this.asl();
    if (core.state.sign === 'libras') return this.load_libras();
  };
  // Shows the ASL video for the clicked text
  core.sign_language.asl = function () {
    var recorder = this.recorder;
    if (core.config.sign_video_map) Object.keys(core.config.sign_video_map).forEach(function (selector) {
      try { Array.prototype.forEach.call(document.querySelectorAll(selector), function (element) { if (!element.hasAttribute('data-acc-sign')) recorder.set(element, 'data-acc-sign', core.config.sign_video_map[selector]); }); } catch (error) { /* bad selector */ }
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-acc-sign],[data-sign-video]'), function (element) { recorder.set(element, 'data-acc-signable', ''); if (!element.hasAttribute('tabindex') && !element.matches('a,button')) recorder.set(element, 'tabindex', '0'); });
    document.addEventListener('click', this.on_click, true);
    var node = this.count();
    if (node) this.report('asl', 'on', 'On. ' + node + (node === 1 ? ' part' : ' parts') + ' of this page have a sign language video. Click a marked part to watch it.', true);
    else if (core.config.sign_hook) this.report('asl', 'on', 'On. Select some text, then press the button below to see it signed.', true);
    else this.report('asl', 'warn', 'On, but this page has no sign language videos yet.', true);
  };
  // How many elements have a sign video
  core.sign_language.count = function () { return document.querySelectorAll('[data-acc-sign],[data-sign-video]').length; };
});
