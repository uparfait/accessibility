/* fonts/fonts-2.js: Font, continued */
accessibles_core.define('fonts/fonts-2.js', [], function (core) {
  'use strict';
  core.register('page_css', { folder: 'fonts', order: 50, rules: function (body) {
    var list = [];
    if (core.state.font) list.push(body + core.not_icon + ',' + body + ' *' + core.not_icon + '{font-family:' + core.font_info(core.state.font).stack + '!important}');
    return list;
  } });
  core.register('module', { folder: 'fonts', order: 10, module: { sync: function () { if (core.state.font) return core.load_font(core.state.font); } } });
  core.fonts_loaded = {};
  core.font_ready = {};
  core.previews_loaded = false;
  // Every font as an option for a list
  core.ui.font_options = function () {
    return core.font_list.map(function (font) { return { v: font.id, l: font.name, s: core.translate_ui(font.note || ''), k: font.google_family || font.family || '', font: font.stack || '' }; });
  };
  core.ui.views.fonts = {
      title: 'Font',
      render: function (box) {
        core.load_font_previews();
        box.innerHTML = '<div class="qbox">' + core.icon_svg('search') + '<input type="text" class="inp" data-filter="font" placeholder="Search fonts" aria-label="Search fonts" autocomplete="off" spellcheck="false">' + core.clear_button_html() + '</div>' +
          '<div class="opts biglist fontlist" data-list="font" role="listbox" aria-label="Fonts">' + this.options_html(this.font_options(), core.state.font) + '</div>';
        this.after_list(core.find_one('.biglist', box));
      }
    };
});
