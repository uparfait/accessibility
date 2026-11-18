/* sign-language/sign-language-4.js: Sign language, continued */
accessibles_core.define('sign-language/sign-language-4.js', [], function (core) {
  'use strict';
    // Turning Libras off removes its button and window from the page
  core.sign_language.remove_libras = function (quiet) {
    core.cancel_later(this.wait_timer);
    var width = this.wrap;
    this.wrap = null;
    if (width) width.remove();
    Array.prototype.forEach.call(document.querySelectorAll('[data-acc-libras],[vw-plugin-wrapper]:not([vw]:not([data-acc-libras]) *)'), function (element) { if (!core.is_ours(element)) element.remove(); });
    if (!quiet) this.report('libras', 'off', 'Off. The Libras button was removed from the page.', !core.state.sign);
  };
  core.sign_language.on_click = core.sign_language.on_click.bind(core.sign_language);
  core.register('module', { folder: 'sign-language', order: 160, module: core.sign_language });
  core.ui.views.sign = {
      title: 'Sign language',
      render: function (box) {
        box.innerHTML = '<div class="plist">' + this.sign_row('asl', 'ASL (American)') + this.sign_row('libras', 'Libras (Brazilian)') + '</div>' +
          (core.config.sign_hook ? '<div class="btns"><button type="button" class="btn" data-act="sign-provide">' + core.icon_svg('play') + 'Show the selected text in sign language</button></div>' : '');
        this.sign_status('asl'); this.sign_status('libras');
      }
    };
  // The HTML for a sign language choice
  core.ui.sign_row = function (kind, label) {
    return '<div class="prow-w sg" data-sg="' + kind + '"><button type="button" class="prow" data-act="sign-' + kind + '" aria-pressed="false" aria-describedby="acc-sg-' + kind + '"><span class="pi">' + core.icon_svg('sign') + '</span>' +
      '<span class="pt"><span class="pn">' + label + '</span><span class="pd sgs" id="acc-sg-' + kind + '" aria-live="polite"></span></span><span class="sw" aria-hidden="true"></span></button></div>';
  };
    // Shows what the sign language service is doing, with a tick when it works and a cross when it does not
  core.ui.sign_status = function (kind) {
    var row = core.find_one('[data-sg="' + kind + '"]');
    if (!row) return;
    var status = core.sign_language.statuses[kind], is_on = core.state.sign === kind && status.s !== 'error';
    row.classList.toggle('on', is_on);
    core.find_one('.prow', row).setAttribute('aria-pressed', String(is_on));
    var line = core.find_one('.sgs', row);
    line.className = 'pd sgs ' + status.s;
    var icon = { on: core.icon_svg('check'), error: core.icon_svg('close'), warn: core.icon_svg('alert'), loading: core.icon_svg('spinner', 'spin') }[status.s] || '';
    line.innerHTML = icon + '<span></span>';
    line.lastChild.textContent = status.message;
    core.panel_translation.apply(row);
  };
  // Shows or hides the sign language video
  core.ui.sign_player = function (src, label) {
    var box = core.find_one('.signp');
    if (!src) { box.hidden = true; box.innerHTML = ''; return; }
    if (src === 'loading') { box.innerHTML = '<div class="sh2">' + core.icon_svg('spinner', 'spin') + '<span>Loading sign language…</span></div>'; box.hidden = false; return; }
    var safe = /^(https?:|blob:|data:video\/|\/|\.\/|\.\.\/)/i.test(src) || !/^[a-z]+:/i.test(src);
    if (!safe) return;
    box.innerHTML = '<div class="sh2"><span>' + core.escape_html(label || 'Sign language') + '</span><button type="button" class="ib" data-act="sign-close" aria-label="Close video">' + core.icon_svg('close') + '</button></div><video controls autoplay playsinline muted></video>';
    core.find_one('video', box).src = src;
    box.hidden = false;
  };
  core.register('action', { folder: 'sign-language', names: ['sign-close'], run: function (target) {
    core.ui.sign_player(null);
  } });
  core.register('action', { folder: 'sign-language', names: ['sign-provide'], run: function (target) {
    core.sign_language.provide();
  } });
});
