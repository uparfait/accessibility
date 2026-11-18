/* sign-language/sign-language-2.js: Sign language, continued */
accessibles_core.define('sign-language/sign-language-2.js', [], function (core) {
  'use strict';
  // Handles a click
  core.sign_language.on_click = function (event) {
    if (core.is_ours(event.target)) return;
    var target = event.target.closest && event.target.closest('[data-acc-sign],[data-sign-video]');
    if (!target) return;
    var src = target.getAttribute('data-acc-sign') || target.getAttribute('data-sign-video');
    if (src) { event.preventDefault(); core.ui.sign_player(src, core.text_of(target).slice(0, 80)); }
  };
  // Asks the site for sign videos
  core.sign_language.provide = function () {
    var selector = String(window.getSelection ? window.getSelection() : '').trim() || core.main_text().slice(0, 600);
    if (!core.config.sign_hook) return;
    core.ui.sign_player('loading');
    Promise.resolve(core.config.sign_hook(selector, core.state.sign || 'asl')).then(function (url) { if (url) core.ui.sign_player(url, selector.slice(0, 80)); else throw 0; })
      .catch(function () { core.ui.sign_player(null); core.toast(core.translate_ui('No sign language video is available for this text')); });
  };
    // The website may already include the Libras plugin itself
  core.sign_language.native_libras = function () { return document.querySelector('[vw]:not([data-acc-libras])'); };
});
