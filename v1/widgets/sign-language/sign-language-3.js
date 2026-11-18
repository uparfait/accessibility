/* sign-language/sign-language-3.js: Sign language, continued */
accessibles_core.define('sign-language/sign-language-3.js', [], function (core) {
  'use strict';
  // Loads the Libras avatar from the official VLibras service
  core.sign_language.load_libras = function () {
    var self = this;
    if (this.native_libras()) { this.report('libras', 'on', 'On. This website already has Libras. Use its blue hand button at the side of the page.', true); return; }
    this.report('libras', 'loading', 'Loading the Libras service…');
    var wrap = this.wrap = document.createElement('div');
    wrap.setAttribute('vw', ''); wrap.setAttribute('data-acc-libras', ''); wrap.className = 'enabled';
    wrap.innerHTML = '<div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
    // The interpreter goes in the widget's top-layer box, so the page cannot cover it
    wrap.style.pointerEvents = 'auto';
    core.top_box().appendChild(wrap);
    core.raise_widget();
    return new Promise(function (resolve) {
      var fail = function (message) {
        if (self.wrap !== wrap) { resolve(); return; }
        self.remove_libras(true);
        self.report('libras', 'error', message, true);
        if (core.state.sign === 'libras') { self.mode = ''; core.set_state('sign', '', true); }
        resolve();
      };
      var init = function () {
        if (self.wrap !== wrap) { resolve(); return; }
        try {
          var previous_value = window.onload;
          new window.VLibras.Widget('https://vlibras.gov.br/app');
          if (document.readyState === 'complete' && window.onload && window.onload !== previous_value) { var callback = window.onload; window.onload = previous_value; callback(); }
        } catch (error) { fail('The Libras service could not start on this page. Please try again later.'); return; }
        // Ready when the plugin has drawn its button
        var start_target = Date.now();
        var check = function () {
          if (self.wrap !== wrap) { resolve(); return; }
          if (wrap.querySelector('[vw-access-button] *, img')) {
            self.report('libras', 'on', 'On. Libras is ready. Press the blue hand button at the side of the page, then select any text.', true);
            resolve(); return;
          }
          core.ui.progress(Math.min(0.95, 0.5 + (Date.now() - start_target) / 24000));
          if (Date.now() - start_target > 12000) { fail('The Libras service did not answer. Check your internet connection and try again.'); return; }
          self.wait_timer = core.run_later(check, 300);
        };
        check();
      };
      if (window.VLibras && window.VLibras.Widget) { init(); return; }
      if (self.script_state === 'error') { fail('The Libras service could not be reached. It may be blocked on this website, or you may be offline.'); return; }
      core.ui.progress(0.2);
      var script = document.createElement('script');
      script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
      script.async = true; script.setAttribute('data-accessibles', '');
      script.onload = function () { self.script_state = 'ok'; core.ui.progress(0.5); init(); };
      script.onerror = function () { self.script_state = 'error'; script.remove(); fail('The Libras service could not be reached. It may be blocked on this website, or you may be offline.'); };
      document.head.appendChild(script);
    });
  };
});
