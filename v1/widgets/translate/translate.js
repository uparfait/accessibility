/* translate/translate.js: Translate: translates the page into another language */
accessibles_core.define('translate/translate.js', ['translate-2.js', 'translate-3.js', 'translate-4.js'], function (core) {
  'use strict';
  core.register('page_css', { folder: 'translate', order: 5, rules: function () {
    var list = [];
    if (core.page_translation.engine === 'google') list.push('.goog-te-banner-frame,.skiptranslate>iframe,#goog-gt-tt,.goog-te-balloon-frame{display:none!important}body{top:0!important}.goog-text-highlight{background:none!important;box-shadow:none!important}');
    return list;
  } });

  // Page translation: always Google's website translator, with no Google interface shown
  core.page_translation = {
    engine: '',
    busy: false,
    target: '',
    progress: 0,
    script_added: false,
    sequence: 0,
    error: '',
    ready: null
  };
  // The language the page is written in
  core.page_translation.page_lang = function () { var parts = (document.documentElement.getAttribute('lang') || '').split('-')[0].toLowerCase(); return parts || 'auto'; };
  // True when Google Translate has translated the page
  core.page_translation.is_translated = function () { var height = document.documentElement; return height.classList.contains('translated-ltr') || height.classList.contains('translated-rtl'); };
    // One call does the whole job: the panel and the page are translated together, or neither is
  core.page_translation.run = function (target, quiet) {
    var self = this, sequence = ++this.sequence, previous_value = core.state.translateTo || '';
    var src = this.page_lang();
    if (target && src !== 'auto' && target.split('-')[0].toLowerCase() === src) target = '';
    this.target = target; this.error = '';
    core.set_state('translateTo', target, true);
    core.panel_translation.set(target);
    if (!target) return this.restore();
    this.busy = true; this.progress = 0;
    core.ui.translate_wait();
    var attempt = 0;
    var run_next = function () {
      attempt++;
      return self.google(target).then(function () { return self.wait_done(target, sequence); }).then(function (is_ok) {
        if (sequence !== self.sequence) return;
        // Google sometimes ignores the first request: ask again, up to three times
        if (!is_ok && attempt < 3) return run_next();
        if (!is_ok) throw new Error('timeout');
        self.busy = false; self.progress = 1; core.ui.translate_wait(true);
      });
    };
    return run_next().catch(function (error_value) {
      if (sequence !== self.sequence) return;
      var reason = String(error_value && error_value.message || error_value);
      self.busy = false;
      self.error = reason === 'language not offered' ? 'This language is not available for this page.' :
        reason === 'blocked' ? 'The translation service could not be reached. It may be blocked on this website, or you may be offline.' :
        'The translation service did not answer. Please try again.';
      // Keep the panel and the page in the same language
      self.target = previous_value; core.set_state('translateTo', previous_value, true); core.panel_translation.set(previous_value);
      core.ui.translate_wait(false);
      if (!quiet) core.toast(core.translate_ui(self.error));
    });
  };
});
