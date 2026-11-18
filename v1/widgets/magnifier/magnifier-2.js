/* magnifier/magnifier-2.js: Magnifier, continued: the look of the glass and the copy of the page inside it */
accessibles_core.define('magnifier/magnifier-2.js', [], function (core) {
  'use strict';
  // The look of the glass: round, with a soft shine, a shadow and a small dot on the spot being pointed at
  core.magnifier.css = 'lens-glass{display:block;position:relative;box-sizing:border-box;border-radius:50%;overflow:hidden;border:3px solid rgba(255,255,255,.95);box-shadow:0 0 0 1px rgba(0,0,0,.28),0 14px 34px rgba(0,0,0,.35),inset 0 0 20px rgba(0,0,0,.2);touch-action:none}' +
    'lens-glass::after{content:"";position:absolute;inset:0;z-index:2;border-radius:50%;pointer-events:none;background:radial-gradient(circle at 30% 24%,rgba(255,255,255,.5),rgba(255,255,255,0) 36%),radial-gradient(circle,rgba(255,255,255,0) 64%,rgba(0,0,0,.14) 100%)}' +
    'lens-glass::before{content:"";position:absolute;left:50%;top:50%;z-index:3;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:rgba(0,0,0,.45);box-shadow:0 0 0 2px rgba(255,255,255,.8)}' +
    'lens-view{display:block;position:absolute;left:0;top:0;transform-origin:0 0;pointer-events:none}';
  // Copies the page into the glass: its styles, its colors and its content
  core.magnifier.copy_page = function () {
    var view = this.view, root = document.documentElement, body = document.body;
    if (!view || !body) return;
    view.innerHTML = '';
    this.copied_at = Date.now();
    // The page's own stylesheets, so the copy looks the same
    Array.prototype.forEach.call(document.querySelectorAll('link[rel~="stylesheet"],style'), function (sheet) { view.appendChild(sheet.cloneNode(true)); });
    try { this.shadow.adoptedStyleSheets = (document.adoptedStyleSheets || []).slice(); } catch (error) { /* older browsers */ }
    // The <html> element with its classes and its color variables
    var page = root.cloneNode(false), computed = getComputedStyle(root);
    for (var index = 0; index < computed.length; index++) {
      if (computed[index].indexOf('--') === 0) page.style.setProperty(computed[index], computed.getPropertyValue(computed[index]));
    }
    page.style.setProperty('width', root.clientWidth + 'px');
    page.style.setProperty('display', 'block');
    // Color filters already reach the glass from the real page, so the copy must not get them twice
    page.style.setProperty('filter', 'none', 'important');
    var copy = body.cloneNode(true);
    if (core.use_top_layer) copy.style.setProperty('filter', 'none', 'important');
    this.clean(copy, body);
    page.appendChild(copy);
    view.appendChild(page);
    this.glass.style.background = this.page_background();
  };
});
