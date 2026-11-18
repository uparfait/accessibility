/* reader-view/reader-view.js: Reader view: the page text in a clean, simple layout */
accessibles_core.define('reader-view/reader-view.js', [], function (core) {
  'use strict';
  // Opens or closes reader view
  core.ui.reader = function (is_on) {
    var box = core.find_one('.reader');
    if (!is_on) { box.hidden = true; box.innerHTML = ''; if (core.speech.active) core.speech.stop(); return; }
    var main = core.find_main();
    var title = (document.querySelector('h1') && core.text_of(document.querySelector('h1'))) || document.title || 'Reader view';
    var frag = core.clean_copy(main, 0);
    box.innerHTML = '<div class="rbar"><button type="button" class="ib" data-act="reader-close" aria-label="Close reader view">' + core.icon_svg('back') + '</button><span class="sp"></span>' +
      '<button type="button" class="tt" data-theme="light" aria-pressed="true" aria-label="Light theme">Light</button><button type="button" class="tt" data-theme="sepia" aria-pressed="false" aria-label="Sepia theme">Sepia</button><button type="button" class="tt" data-theme="dark" aria-pressed="false" aria-label="Dark theme">Dark</button>' +
      '<button type="button" class="ib" data-act="reader-smaller" aria-label="Smaller text">' + core.icon_svg('minus') + '</button><button type="button" class="ib" data-act="reader-bigger" aria-label="Larger text">' + core.icon_svg('plus') + '</button>' +
      '<button type="button" class="ib" data-act="reader-font" aria-label="Switch font">' + core.icon_svg('font') + '</button>' +
      (core.speech.ok ? '<button type="button" class="ib" data-act="reader-read" aria-label="Read aloud">' + core.icon_svg('speak') + '</button>' : '') + '</div>' +
      '<article class="rbody"></article>';
    var article = core.find_one('.rbody', box);
    var has_h1 = frag.querySelector && frag.querySelector('h1');
    if (!has_h1) { var element = document.createElement('h1'); element.textContent = title; article.appendChild(element); }
    article.appendChild(frag);
    box.style.setProperty('--rfs', (this.reader_font_size || 20) + 'px');
    box.hidden = false;
    box.scrollTop = 0;
    this.close();
    this.reader_theme(this.reader_theme_name || 'light');
    try { core.find_one('[data-act="reader-close"]', box).focus(); } catch (error) { /* ignore */ }
  };
  // Changes the colors of reader view
  core.ui.reader_theme = function (theme) {
    this.reader_theme_name = theme;
    var box = core.find_one('.reader');
    box.classList.remove('sepia', 'dark');
    if (theme !== 'light') box.classList.add(theme);
    core.find_all('[data-theme]', box).forEach(function (button) { button.setAttribute('aria-pressed', button.getAttribute('data-theme') === theme); });
  };
  // Changes the text size of reader view
  core.ui.reader_size = function (step) { this.reader_font_size = core.clamp((this.reader_font_size || 20) + step, 14, 36); core.find_one('.reader').style.setProperty('--rfs', this.reader_font_size + 'px'); };
  // Switches reader view between its two fonts
  core.ui.reader_font = function () { core.find_one('.rbody').classList.toggle('sans'); };
  core.register('click_attribute', { folder: 'reader-view', attribute: 'data-theme', order: 150, run: function (target) {
    core.ui.reader_theme(target.getAttribute('data-theme'));
  } });
  core.register('action', { folder: 'reader-view', names: ['reader-close'], run: function (target) {
    core.ui.reader(false);
  } });
  core.register('action', { folder: 'reader-view', names: ['reader-smaller'], run: function (target) {
    core.ui.reader_size(-2);
  } });
  core.register('action', { folder: 'reader-view', names: ['reader-bigger'], run: function (target) {
    core.ui.reader_size(2);
  } });
  core.register('action', { folder: 'reader-view', names: ['reader-font'], run: function (target) {
    core.ui.reader_font();
  } });
  core.register('action', { folder: 'reader-view', names: ['reader-read'], run: function (target) {
    core.speech.read_page(core.find_one('.rbody'));
  } });
});
