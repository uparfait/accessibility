/* translate/translate-3.js: Translate, continued */
accessibles_core.define('translate/translate-3.js', [], function (core) {
  'use strict';
    // Loads Google's page translator once; every later call reuses it
  core.page_translation.load = function () {
    var self = this;
    if (this.ready) return this.ready;
    this.ensure_box();
    this.ready = new Promise(function (resolve, reject) {
      var make = function () {
        try { new window.google.translate.TranslateElement({ pageLanguage: self.page_lang(), autoDisplay: false }, 'acc-gt-box'); } catch (error) { reject(error); return; }
        var tries = 0;
        var poll = core.native_set_interval.call(window, function () {
          var combo = document.querySelector('select.goog-te-combo');
          if (combo && combo.options.length > 1) { clearInterval(poll); self.engine = 'google'; resolve(combo); }
          else if (++tries > 120) { clearInterval(poll); reject(new Error('timeout')); }
        }, 125);
      };
      var google_api = window.google && window.google.translate;
      if (google_api && google_api.TranslateElement) {
        var have = document.querySelector('select.goog-te-combo');
        if (have && have.options.length > 1) { self.engine = 'google'; resolve(have); } else make();
        return;
      }
      window.__accessiblesGT = make;
      var script = document.createElement('script');
      script.src = 'https://translate.google.com/translate_a/element.js?cb=__accessiblesGT';
      script.async = true;
      script.onerror = function () { script.remove(); reject(new Error('blocked')); };
      (document.head || document.documentElement).appendChild(script);
      core.run_later(function () { reject(new Error('timeout')); }, 20000);
    });
    // A failed load can be tried again on the next request
    this.ready.catch(function () { self.ready = null; });
    return this.ready;
  };
  // Translates the page with Google Translate
  core.page_translation.google = function (target) {
    var self = this;
    return this.load().then(function () {
      var combo = document.querySelector('select.goog-te-combo');
      if (!combo) { self.ready = null; throw new Error('timeout'); }
      var is_offered = Array.prototype.some.call(combo.options, function (option) { return option.value === target; });
      if (!is_offered) throw new Error('language not offered');
      // The cookie makes Google keep the language on the next pages too
      var canvas = '/' + (self.page_lang() === 'auto' ? 'auto' : self.page_lang()) + '/' + target;
      try { document.cookie = 'googtrans=' + canvas + ';path=/'; } catch (error) { /* ignore */ }
      if (combo.value === target && self.is_translated()) combo.value = '';
      combo.value = target;
      var event;
      try { event = new Event('change', { bubbles: true }); } catch (error) { event = document.createEvent('HTMLEvents'); event.initEvent('change', true, true); }
      combo.dispatchEvent(event);
      core.last_page_css = ''; core.schedule_apply();
    });
  };
});
