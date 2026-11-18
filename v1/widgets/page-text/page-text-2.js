/* page-text/page-text-2.js: Finds the main text of the page and makes a clean copy of it, continued */
accessibles_core.define('page-text/page-text-2.js', [], function (core) {
  'use strict';
  // The main text of the page
  core.main_text = function (main, no_headings) {
    main = main || core.find_main();
    var parts = [];
    Array.prototype.forEach.call(main.querySelectorAll(no_headings ? 'p,li,blockquote,dd,td,figcaption' : 'p,li,h1,h2,h3,h4,blockquote,dd,td,figcaption'), function (element) {
      if (core.is_ours(element) || element.closest('nav,footer,aside,form,[aria-hidden="true"]') || !core.is_visible(element)) return;
      if (element.querySelector('p,li')) return;
      var text = core.text_of(element);
      if (text.length > 1) parts.push(text);
    });
    return parts.length ? parts.join('\n') : core.text_of(main);
  };
  core.reader_keep_tags = { H1: 1, H2: 1, H3: 1, H4: 1, H5: 1, H6: 1, P: 1, UL: 1, OL: 1, LI: 1, BLOCKQUOTE: 1, PRE: 1, CODE: 1, EM: 1, STRONG: 1, B: 1, I: 1, U: 1, A: 1, IMG: 1, FIGURE: 1, FIGCAPTION: 1, TABLE: 1, THEAD: 1, TBODY: 1, TFOOT: 1, TR: 1, TD: 1, TH: 1, CAPTION: 1, BR: 1, HR: 1, DL: 1, DT: 1, DD: 1, SUP: 1, SUB: 1, MARK: 1, ABBR: 1, Q: 1, CITE: 1, SMALL: 1, TIME: 1 };
  core.reader_drop_tags = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, IFRAME: 1, FORM: 1, BUTTON: 1, INPUT: 1, SELECT: 1, TEXTAREA: 1, NAV: 1, ASIDE: 1, FOOTER: 1, SVG: 1, svg: 1, CANVAS: 1, VIDEO: 1, AUDIO: 1, OBJECT: 1, EMBED: 1, TEMPLATE: 1, DIALOG: 1, LINK: 1, META: 1 };
  core.clutter_pattern = /(^|[\s_-])(share|social|comment|related|advert|ads?|promo|cookie|newsletter|sidebar|breadcrumb|menu|popup|modal|banner|sponsor|subscribe|widget)([\s_-]|$)/i;
});
