/* translate/translate-4.js: Translate, continued */
accessibles_core.define('translate/translate-4.js', [], function (core) {
  'use strict';
  // Adds the hidden box Google Translate needs
  core.page_translation.ensure_box = function () {
    if (document.getElementById('acc-gt-box')) return;
    var element = document.createElement('div');
    element.id = 'acc-gt-box';
    element.setAttribute('aria-hidden', 'true');
    element.style.cssText = 'position:absolute!important;left:-9999px!important;top:0!important;width:1px!important;height:1px!important;overflow:hidden!important';
    document.body.appendChild(element);
  };
  // Shows the page in its own language again
  core.page_translation.restore = function () {
    this.busy = false;
    core.ui.translate_wait();
    if (!this.engine) return Promise.resolve();
    var restored = false;
    Array.prototype.forEach.call(document.querySelectorAll('iframe.skiptranslate,iframe.goog-te-banner-frame,iframe[id^=":"]'), function (item) {
      if (restored) return;
      try { var element = item.contentDocument && item.contentDocument.querySelector('[id$=".restore"],button[id*="restore"]'); if (element) { element.click(); restored = true; } } catch (error) { /* cross-origin */ }
    });
    if (!restored) {
      var combo = document.querySelector('select.goog-te-combo'), src = this.page_lang();
      if (combo) {
        var is_ok = Array.prototype.some.call(combo.options, function (option) { return option.value === src; });
        combo.value = is_ok ? src : '';
        combo.dispatchEvent(new Event('change'));
      }
    }
    ['', ';domain=' + location.hostname, ';domain=.' + location.hostname.replace(/^www\./, '')].forEach(function (detail) { document.cookie = 'googtrans=;path=/;max-age=0' + detail; });
    core.run_later(function () {
      var html = document.documentElement;
      if (html.classList.contains('translated-ltr') || html.classList.contains('translated-rtl')) location.reload();
    }, 900);
    return Promise.resolve();
  };
  core.ui.views.translate = {
      title: 'Translate',
      render: function (box) {
        var current = core.page_translation.target || core.state.translateTo || '';
        box.innerHTML = '<div class="tr-note" role="alert"' + (core.page_translation.error ? '' : ' hidden') + '>' + core.icon_svg('alert') + '<span>' + core.escape_html(core.page_translation.error) + '</span></div>' +
          '<div class="qbox">' + core.icon_svg('search') + '<input type="text" class="inp" data-filter="lang" placeholder="Search language" aria-label="Search language" autocomplete="off" spellcheck="false">' + core.clear_button_html() + '</div>' +
          '<div class="opts biglist" data-list="lang" role="listbox" aria-label="Languages">' + this.options_html(core.language_options().map(function (option) { option.native = true; return option; }), current) + '</div>';
        this.after_list(core.find_one('.biglist', box));
        var action = core.find_one('.biglist .opt[aria-selected="true"]', box);
        if (action && current) core.run_later(function () { action.scrollIntoView({ block: 'center' }); }, 0);
        if (core.page_translation.busy && action) { this.set_busy(action, 'translate'); this.progress(Math.max(0.01, core.page_translation.progress), 'translate'); }
      }
    };
});
