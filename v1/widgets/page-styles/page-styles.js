/* page-styles/page-styles.js: Builds the one stylesheet the page gets from every loaded feature */
accessibles_core.define('page-styles/page-styles.js', ['page-styles-2.js'], function (core) {
  'use strict';
  // Puts the page stylesheet in place (or replaces it)
  core.set_page_css = function (css) {
    if (core.can_adopt_sheets) {
      try {
        if (!core.page_sheet) {
          core.page_sheet = new CSSStyleSheet();
          document.adoptedStyleSheets = Array.prototype.slice.call(document.adoptedStyleSheets).concat([core.page_sheet]);
        } else if (Array.prototype.indexOf.call(document.adoptedStyleSheets, core.page_sheet) < 0) {
          document.adoptedStyleSheets = Array.prototype.slice.call(document.adoptedStyleSheets).concat([core.page_sheet]);
        }
        core.page_sheet.replaceSync(css);
        return;
      } catch (error) { core.can_adopt_sheets = false; }
    }
    if (!core.page_style_element) {
      core.page_style_element = document.createElement('style');
      core.page_style_element.id = 'accessibles-page-style';
    }
    if (!core.page_style_element.isConnected) (document.head || document.documentElement).appendChild(core.page_style_element);
    core.page_style_element.textContent = css;
  };
  // A large arrow or hand cursor as a CSS url()
  core.svg_cursor = function (fill, stroke, kind) {
    var path = kind === 'hand'
      ? 'M18 4.5c1.9 0 3.4 1.5 3.4 3.4v11.2l1.2-.3c1.8-.4 3.5.7 3.8 2.5l.1.6 1.1-.2c1.8-.3 3.5.9 3.7 2.7l.1.5.8-.1c1.9-.2 3.5 1.2 3.6 3.1l.2 4.4c.3 5-3.6 9.2-8.6 9.2h-5.8c-3 0-5.7-1.6-7.2-4.2l-5.3-9c-1-1.7-.4-3.8 1.3-4.7 1.5-.8 3.4-.3 4.3 1.1l.9 1.4V7.9c0-1.9 1.5-3.4 3.4-3.4z'
      : 'M6 3.5v34.5l9.2-9 5.8 13.8 6.4-2.7-5.8-13.6h12.9z';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="' + path + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2.4" stroke-linejoin="round"/></svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '") ' + (kind === 'hand' ? '17 5' : '6 4');
  };

  // The colour filter for the whole page, made from the filters of the loaded features
  core.filter_value = function () {
    return core.registered('page_filter').filter(function (part) { return core.has(part.folder); })
      .map(function (part) { return part.filter(); }).filter(Boolean).join(' ');
  };
});
