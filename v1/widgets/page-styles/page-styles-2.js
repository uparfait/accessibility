/* page-styles/page-styles-2.js: Builds the one stylesheet the page gets from every loaded feature, continued */
accessibles_core.define('page-styles/page-styles-2.js', [], function (core) {
  'use strict';
  // The one stylesheet the page gets: the widget's helper rules, the colour filter, then each loaded feature's rules
  core.build_page_css = function () {
    var accent = core.to_hex(core.palette.accent_on_light), ink = core.to_hex(core.contrast_ratio(core.palette.accent_on_light, [255, 255, 255]) >= 4.5 ? [255, 255, 255] : [16, 19, 22]);
    var list = [], body = 'body';
    list.push('.acc-sr-only{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;white-space:nowrap!important;border:0!important}');
    list.push('a.acc-skip{position:fixed!important;left:12px!important;top:-200px!important;z-index:2147483646!important;padding:12px 18px!important;background:' + accent + '!important;color:' + ink + '!important;font:600 16px/1.2 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif!important;border-radius:10px!important;text-decoration:none!important;box-shadow:0 6px 20px rgba(0,0,0,.2)!important}');
    list.push('a.acc-skip:focus{top:12px!important;outline:3px solid ' + ink + '!important;outline-offset:2px!important}');
    list.push('.acc-reading{outline:3px solid ' + accent + '!important;outline-offset:4px!important;border-radius:3px;scroll-margin:30vh}');
    list.push('.acc-target{outline:3px solid ' + accent + '!important;outline-offset:4px!important;transition:outline-color .3s}');
    list.push('.acc-mark{outline:3px dashed #c62828!important;outline-offset:2px!important}');
    list.push('.acc-pick{outline:2px dashed ' + accent + '!important;outline-offset:3px!important}');
    list.push('.acc-pick-on{outline:3px solid ' + accent + '!important;outline-offset:3px!important;box-shadow:0 0 0 7px rgba(255,255,255,.85)!important}');
    list.push('[data-acc-signable]{outline:2px dotted ' + accent + '!important;outline-offset:3px!important;cursor:help!important}');
    var filters = core.filter_value();
    if (filters) list.push((core.use_top_layer ? 'html' : body) + '{filter:' + filters + '!important;-webkit-filter:' + filters + '!important}');
    core.registered('page_css').forEach(function (part) {
      if (!core.has(part.folder)) return;
      try { list = list.concat(part.rules(body, accent, ink) || []); } catch (error) { if (window.console) console.warn('[Accessibles]', error); }
    });
    return list.join('\n');
  };
  core.palette = undefined;
  core.use_top_layer = typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function';
  core.can_adopt_sheets = 'adoptedStyleSheets' in Document.prototype && typeof CSSStyleSheet === 'function' && 'replaceSync' in CSSStyleSheet.prototype;
  core.page_sheet = null; core.page_style_element = null;
  core.not_icon = ':not(i):not([class*="icon"]):not([class*="Icon"]):not([class^="fa"]):not([class*=" fa"]):not([class*="material-"]):not([class*="glyph"]):not([class*="symbol"]):not(code):not(pre):not(kbd):not(samp):not(svg):not(svg *)';
  core.not_media = ':not(img):not(video):not(picture):not(canvas):not(iframe):not(svg):not(svg *):not(object):not(embed)';
  core.headings = 'h1,h2,h3,h4,h5,h6,[role="heading"]';
});
