/*!
 * Accessibles v1.0.0
 * Drop-in accessibility widget. No dependencies, no build step, no changes to your pages.
 *
 *   <div class="accessibles-widget"></div>
 *   <script src="accessibles.js?color=%232F6B5A&position=bottom-right" defer></script>
 *
 * Query options (all optional):
 *   color          primary color, any CSS color (default #2F6B5A; encode # as %23, a raw # also works)
 *   bg             panel background color (default #000000); text and surfaces adapt to it
 *   site-name      your site's name, shown as the panel title and in the statement and reports
 *   site-icon-url  your site's icon, shown in the panel header and in the button's hover card
 *   position       bottom-right (default) | bottom-left | bottom-center | top-right | top-left |
 *                  top-center | right-center | left-center   (short forms and common typos accepted)
 *   offset         distance from the screen edge in px (default 20). offsetx / offsety per axis
 *   title          panel title when no site-name is set (default "Accessibility")
 *   statement      URL of your accessibility statement
 *   report         URL (receives JSON POST) or email address for the issue report form
 *   analytics      URL that receives usage events via sendBeacon
 *   size           "large" starts with the larger interface
 *   draggable      "false" to lock the button in place
 * The same options can be set as data-* attributes on the .accessibles-widget div,
 * or on window.AccessiblesConfig before the script loads (that object can also hold hooks).
 */
(function (window, document) {
  'use strict';
  if (!window || !document || window.__accessiblesLoaded) return;
  if (!document.documentElement || typeof document.documentElement.attachShadow !== 'function') return;
  window.__accessiblesLoaded = true;

  var VERSION = '1.0.0';
  var nativeSetTimeout = window.setTimeout;
  var nativeClearTimeout = window.clearTimeout;
  var nativeSetInterval = window.setInterval;
  function later(fn, ms) { return nativeSetTimeout.call(window, fn, ms || 0); }
  function cancel(id) { nativeClearTimeout.call(window, id); }

  /* ------------------------------------------------------------------ *
   * 1. Configuration
   * ------------------------------------------------------------------ */
  var SCRIPT = document.currentScript || (function () {
    var list = document.querySelectorAll('script[src]');
    for (var i = list.length - 1; i >= 0; i--) {
      if (/accessibles(\.min)?\.js/i.test(list[i].getAttribute('src') || '')) return list[i];
    }
    return null;
  })();
  var SCRIPT_SRC = SCRIPT ? (SCRIPT.getAttribute('src') || '') : '';
  var SCRIPT_BASE = '';
  try { SCRIPT_BASE = SCRIPT ? new URL('.', SCRIPT.src).href : ''; } catch (e) { SCRIPT_BASE = ''; }

  function dec(s) { try { return decodeURIComponent(String(s).replace(/\+/g, ' ')); } catch (e) { return String(s); } }
  function normKey(k) { return String(k).toLowerCase().replace(/[^a-z0-9]/g, ''); }

  // Parsed by hand (not with URL) so an unencoded "#" in color=#2F6B5A still works.
  function parseQuery(src) {
    var out = {};
    var qi = src.indexOf('?');
    if (qi < 0) return out;
    src.slice(qi + 1).split(/[&;]/).forEach(function (pair) {
      if (!pair) return;
      var eq = pair.indexOf('=');
      var k = normKey(dec(eq < 0 ? pair : pair.slice(0, eq)));
      var v = eq < 0 ? 'true' : dec(pair.slice(eq + 1)).trim();
      if (k) out[k] = v;
    });
    return out;
  }

  function truthy(v) { return v === true || /^(1|true|yes|on)$/i.test(String(v || '')); }
  function num(v, d) { var n = parseFloat(v); return isFinite(n) ? n : d; }

  // Accepts common spellings and typos: "ritgh", "rigth", "botom", "centre", "middle"…
  function normPosition(v) {
    var s = String(v || '').toLowerCase().replace(/[\s_]+/g, '-')
      .replace(/rigth|ritgh|rihgt|rght|riht|rigt|rgiht/g, 'right')
      .replace(/botom|bottm|buttom|bottem|botton/g, 'bottom')
      .replace(/lfet|leftt|lef(?!t)/g, 'left')
      .replace(/tpo(?!s)/g, 'top')
      .replace(/middle|centre|centr(?!e)|cener|cntr/g, 'center');
    var hasTop = s.indexOf('top') > -1, hasBottom = s.indexOf('bottom') > -1;
    var hasLeft = s.indexOf('left') > -1, hasRight = s.indexOf('right') > -1;
    if (!hasTop && !hasBottom && !hasLeft && !hasRight) return { v: 'bottom', h: 'right', key: 'bottom-right' };
    var vert = hasTop ? 'top' : hasBottom ? 'bottom' : 'center';
    var hor = hasLeft ? 'left' : hasRight ? 'right' : 'center';
    return { v: vert, h: hor, key: vert === 'center' ? hor + '-center' : hor === 'center' ? vert + '-center' : vert + '-' + hor };
  }

  function readConfig(mount) {
    var g = window.AccessiblesConfig || window.accessiblesConfig || {};
    var raw = {};
    Object.keys(g).forEach(function (k) { if (typeof g[k] !== 'function' && typeof g[k] !== 'object') raw[normKey(k)] = g[k]; });
    var q = parseQuery(SCRIPT_SRC);
    Object.keys(q).forEach(function (k) { raw[k] = q[k]; });
    if (mount && mount.attributes) {
      for (var i = 0; i < mount.attributes.length; i++) {
        var a = mount.attributes[i];
        if (a.name.indexOf('data-') === 0) raw[normKey(a.name.slice(5))] = a.value;
      }
    }
    var off = num(raw.offset, 20);
    return {
      color: raw.color || raw.primary || raw.colour || '#2F6B5A',
      bg: raw.bg || raw.background || raw.backgroundcolor || '#000000',
      siteName: String(raw.sitename || raw.site || '').trim(),
      siteIcon: String(raw.siteiconurl || raw.siteicon || raw.icon || '').trim(),
      position: normPosition(raw.position || raw.pos || 'bottom-right'),
      offsetX: num(raw.offsetx, off),
      offsetY: num(raw.offsety, off),
      title: raw.title || 'Accessibility',
      statement: raw.statement || '',
      report: raw.report || '',
      analytics: raw.analytics || '',
      large: /^(large|big|xl)$/i.test(raw.size || ''),
      draggable: !/^(false|0|no|off)$/i.test(String(raw.draggable == null ? 'true' : raw.draggable)),
      lang: raw.lang || '',
      readableFontUrl: raw.readablefonturl || 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&display=swap',
      dyslexicFontUrl: raw.dyslexicfonturl || 'https://fonts.googleapis.com/css2?family=Lexend:wght@300..700&display=swap',
      dictionaryUrl: raw.dictionary || '',
      // Optional hooks (functions) — only from window.AccessiblesConfig
      altTextProvider: typeof g.altText === 'function' ? g.altText : null,
      summarizeProvider: typeof g.summarize === 'function' ? g.summarize : null,
      signProvider: typeof g.signProvider === 'function' ? g.signProvider : null,
      glossary: (g.glossary && typeof g.glossary === 'object') ? g.glossary : (window.AccessiblesGlossary || null),
      signVideos: (g.signVideos && typeof g.signVideos === 'object') ? g.signVideos : null
    };
  }

  /* ------------------------------------------------------------------ *
   * 2. Small helpers
   * ------------------------------------------------------------------ */
  var host, shadow, R, CFG;
  function $(sel, root) { return (root || shadow).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || shadow).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function vw() { return document.documentElement.clientWidth || window.innerWidth; }
  function vh() { return window.innerHeight || document.documentElement.clientHeight; }
  function isOurs(n) { return !!n && !!host && (n === host || host.contains(n)); }
  function textOf(el) { return ((el && (el.innerText || el.textContent)) || '').replace(/\s+/g, ' ').trim(); }
  function visible(el) {
    if (!el || !el.getClientRects || !el.getClientRects().length) return false;
    var cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none' && parseFloat(cs.opacity) > 0.02;
  }
  function inViewport(el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < vh() && r.left < vw();
  }
  function debounce(fn, ms) { var t; return function () { cancel(t); t = later(fn, ms); }; }
  function pageLang() { return (CFG && CFG.lang) || document.documentElement.getAttribute('lang') || navigator.language || 'en'; }
  // The language the visitor uses: the language they chose to translate into, else the panel language, else the page language
  function userLang() { return (typeof S !== 'undefined' && S.translateTo) || (typeof I18N !== 'undefined' && I18N.lang) || pageLang(); }
  function isEditable(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.isContentEditable) return true;
    if (el.tagName === 'TEXTAREA') return !el.readOnly && !el.disabled;
    if (el.tagName !== 'INPUT') return false;
    var t = (el.type || 'text').toLowerCase();
    return /^(text|search|email|url|tel|password|number)$/.test(t) && !el.readOnly && !el.disabled;
  }
  function humanize(s) {
    s = String(s || '').replace(/\.[a-z0-9]{2,5}(\?.*)?$/i, '').replace(/[-_.+]+/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\s+/g, ' ').trim();
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }
  // Unicode-aware patterns, built at runtime so older engines fall back instead of failing to parse
  function re(src, flags, fallback) { try { return new RegExp(src, flags); } catch (e) { return fallback; } }
  var LATINISH = 'A-Za-z0-9\\u00C0-\\u024F\\u0370-\\u03FF\\u0400-\\u04FF\\u0590-\\u06FF\\u0900-\\u0DFF\\u0E00-\\u0E7F\\u1200-\\u137F\\u3040-\\u30FF\\u3400-\\u9FFF\\uAC00-\\uD7AF';
  var RE_WORDS = re("[\\p{L}\\p{N}']+", 'gu', new RegExp('[' + LATINISH + "']+", 'g'));
  var RE_HAS_LETTERS = re('\\p{L}{2,}', 'u', new RegExp('[' + LATINISH.replace('0-9', '') + ']{2,}'));
  var RE_EDGE_PUNCT = re('^[^\\p{L}\\p{N}]+|[^\\p{L}\\p{N}]+$', 'gu', new RegExp('^[^' + LATINISH + ']+|[^' + LATINISH + ']+$', 'g'));
  function words(s) { RE_WORDS.lastIndex = 0; return String(s).match(RE_WORDS) || []; }
  function hasLetters(s) { return RE_HAS_LETTERS.test(String(s)); }
  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEMPLATE: 1, IFRAME: 1, CANVAS: 1, VIDEO: 1, AUDIO: 1, IMG: 1, OBJECT: 1, EMBED: 1, svg: 1, SVG: 1, MATH: 1, HEAD: 1, LINK: 1, META: 1 };
  function focusEl(el) {
    if (!el) return;
    var focusable = el.matches && el.matches('a[href],button,input,select,textarea,summary,[tabindex],[contenteditable="true"]');
    if (!focusable) el.setAttribute('tabindex', '-1');
    try { el.scrollIntoView({ block: 'center', behavior: 'auto' }); } catch (e) { el.scrollIntoView(); }
    try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
    el.classList.add('acc-target');
    later(function () { el.classList.remove('acc-target'); }, 1600);
  }

  /* ------------------------------------------------------------------ *
   * 3. Color system — every widget color is derived from the primary
   * ------------------------------------------------------------------ */
  var ctx2d = null;
  try { ctx2d = document.createElement('canvas').getContext('2d'); } catch (e) { ctx2d = null; }
  function parseColor(input) {
    if (!input) return null;
    var s = String(input).trim();
    if (/^[0-9a-f]{3}([0-9a-f]{3})?([0-9a-f]{2})?$/i.test(s)) s = '#' + s;
    var m = /^#([0-9a-f]{3,8})$/i.exec(s);
    if (m) {
      var h = m[1];
      if (h.length === 3 || h.length === 4) h = h.split('').map(function (c) { return c + c; }).join('');
      if (h.length !== 6 && h.length !== 8) return null;
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    }
    m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(s);
    if (m) return [+m[1], +m[2], +m[3]].map(function (v) { return clamp(Math.round(v), 0, 255); });
    if (!ctx2d) return null;
    ctx2d.fillStyle = '#010203';
    ctx2d.fillStyle = s;
    var out = String(ctx2d.fillStyle);
    if (out === '#010203') return null;
    return out.charAt(0) === '#' ? parseColor(out) : parseColor(out.replace(/\s/g, ''));
  }
  function lum(c) {
    var a = c.map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }
  function contrast(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function mix(a, b, t) { return a.map(function (v, i) { return Math.round(v * (1 - t) + b[i] * t); }); }
  function hex(c) { return '#' + c.map(function (v) { return ('0' + clamp(Math.round(v), 0, 255).toString(16)).slice(-2); }).join(''); }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function ensureContrast(c, toward, bg, ratio) {
    var t = 0, r = c;
    while (contrast(r, bg) < ratio && t < 1) { t += 0.03; r = mix(c, toward, t); }
    return r;
  }

  // Two inputs drive every color: the primary (accents, button) and the panel background.
  function buildPalette(input, bgInput) {
    var p = parseColor(input) || [47, 107, 90];
    var bg = parseColor(bgInput) || [0, 0, 0];
    var W = [255, 255, 255], K = [14, 16, 19];
    var dark = lum(bg) < 0.3;
    function inkOn(c) { return contrast(c, W) >= contrast(c, K) ? W : K; }
    var fg = ensureContrast(dark ? [242, 244, 245] : [21, 24, 28], dark ? W : K, bg, 12);
    var accent = ensureContrast(p, dark ? W : K, bg, 4.6);
    var muted = ensureContrast(mix(fg, bg, 0.38), fg, bg, 4.6);
    var shadowC = dark ? 'rgba(0,0,0,.55)' : rgba(mix(p, K, 0.7), 0.18);
    return {
      primary: p, ink: inkOn(p), accentLight: ensureContrast(p, K, W, 4.6), dark: dark,
      vars: {
        '--p': hex(p), '--p-ink': hex(inkOn(p)),
        '--p-edge': contrast(p, W) < 1.5 || contrast(p, K) < 1.5 ? hex(mix(p, contrast(p, W) < 1.5 ? K : W, 0.4)) : 'transparent',
        '--p-shadow': rgba(mix(p, K, 0.5), 0.3),
        '--bg': hex(bg), '--text': hex(fg), '--muted': hex(muted),
        '--surface': hex(mix(bg, fg, dark ? 0.06 : 0.025)), '--hover': hex(mix(bg, fg, dark ? 0.11 : 0.06)),
        '--field': hex(mix(bg, fg, dark ? 0.13 : 0.06)),
        '--line': hex(mix(bg, fg, dark ? 0.15 : 0.12)), '--line-2': hex(mix(bg, fg, dark ? 0.34 : 0.3)),
        '--accent': hex(accent), '--accent-ink': hex(inkOn(accent)),
        '--soft': hex(mix(bg, accent, dark ? 0.16 : 0.1)), '--soft-2': hex(mix(bg, accent, dark ? 0.28 : 0.2)),
        '--bad': dark ? '#ffb4ab' : '#b42318', '--bad-bg': dark ? '#3d1714' : '#fde8e8',
        '--shadow': '0 18px 48px ' + shadowC + ', 0 2px 6px rgba(0,0,0,' + (dark ? '.4' : '.06') + ')'
      }
    };
  }

  /* ------------------------------------------------------------------ *
   * 4. Icons — one consistent 24px line set, drawn for this widget
   * ------------------------------------------------------------------ */
  var DOT = 'stroke-width="2.6"';
  var I = {
    logo: '<circle cx="12" cy="6.4" r="1.7" fill="currentColor" stroke="none"/><path d="M6.6 9.7c1.8.6 3.6.9 5.4.9s3.6-.3 5.4-.9"/><path d="M12 10.6v3.6M12 14.2l-2.6 4.5M12 14.2l2.6 4.5"/><path d="M20.6 9.4A9 9 0 1 1 15.2 3.6"/><circle cx="18.4" cy="5.6" r="1.1" fill="currentColor" stroke="none"/>',
    close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    back: '<path d="M14.5 5.5 8 12l6.5 6.5"/>',
    next: '<path d="M9.5 5.5 16 12l-6.5 6.5"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    reset: '<path d="M4.6 12a7.4 7.4 0 1 0 2.3-5.4"/><path d="M4.4 4.3v3.9h3.9"/>',
    check: '<path d="m5.5 12.5 4 4L18.5 7.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    // profiles
    seizure: '<path d="M13.2 3 6.4 13.3h5.4L10.8 21l6.8-10.3h-5.4z"/>',
    vision: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    adhd: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/>',
    cognitive: '<path d="M9.3 18h5.4M10.2 21h3.6"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
    dyslexia: '<path d="M3 5.6c2.9-1 5.9-.7 9 1.3 3.1-2 6.1-2.3 9-1.3V19c-2.9-1-5.9-.7-9 1.3-3.1-2-6.1-2.3-9-1.3z"/><path d="M12 6.9v13.4"/>',
    colorblind: '<path d="M12 3.5s-6 6.4-6 10.6a6 6 0 0 0 6 6z" fill="currentColor" stroke="none"/><path d="M12 3.5s-6 6.4-6 10.6a6 6 0 0 0 12 0C18 9.9 12 3.5 12 3.5z"/>',
    motor: '<path d="M9 12V5.2a1.5 1.5 0 0 1 3 0V11"/><path d="M12 10.6V9a1.5 1.5 0 0 1 3 0v1.8"/><path d="M15 10.8a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-.7a5 5 0 0 1-4-2l-2.6-3.6a1.5 1.5 0 0 1 2.3-1.9L9 15.3"/>',
    blind: '<path d="M7 9.2a5 5 0 0 1 10 0c0 3.2-3 4-3 7a3 3 0 0 1-5.6 1.4"/><path d="M10 9.6a2 2 0 0 1 4 0c0 1.2-.9 1.6-1.5 2.4"/>',
    elderly: '<circle cx="6.5" cy="14.5" r="3.5"/><circle cx="17.5" cy="14.5" r="3.5"/><path d="M10 14.4c1.3-.9 2.7-.9 4 0M3 14.5l1.4-7M21 14.5l-1.4-7"/>',
    // text
    scale: '<path d="M14 4h6v6M10 20H4v-6M20 4l-6.5 6.5M4 20l6.5-6.5"/>',
    fontSize: '<path d="M3 19 8.2 5.5 13.4 19M5 14.8h6.4"/><path d="M18 8.5v7M14.5 12h7"/>',
    font: '<path d="M3 19 8 5.5 13 19M4.8 14.6h6.4"/><circle cx="17.6" cy="16" r="2.7"/><path d="M20.3 12.8V19"/>',
    lineHeight: '<path d="M10.5 6h10M10.5 12h10M10.5 18h10"/><path d="M5 4.5v15M3 6.5l2-2 2 2M3 17.5l2 2 2-2"/>',
    letterSpacing: '<path d="M4 13 7.5 4.5 11 13M5.3 10.2h4.4M13 4.5l3.5 8.5L20 4.5"/><path d="M4 19h16M6.2 17l-2 2 2 2M17.8 17l2 2-2 2"/>',
    wordSpacing: '<path d="M3 7h6.5M3 11h4.5M14.5 7H21M16.5 11H21"/><path d="M4 18.5h16M6.2 16.5l-2 2 2 2M17.8 16.5l2 2-2 2"/>',
    fontWeight: '<path d="M7.5 4.5h5.3a3.4 3.4 0 0 1 0 6.8H7.5zM7.5 11.3h6.2a3.9 3.9 0 0 1 0 7.8H7.5z" stroke-width="2.3"/>',
    textAlign: '<path d="M4 6h16M4 10h10M4 14h16M4 18h10"/>',
    titles: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M8.5 8.5v7M15.5 8.5v7M8.5 12h7"/>',
    links: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    magnifier: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.6-4.6M10.5 7.6v5.8M7.6 10.5h5.8"/>',
    // color
    dark: '<path d="M19.8 14.6A8.4 8.4 0 0 1 9.4 4.2a8.4 8.4 0 1 0 10.4 10.4z"/>',
    light: '<circle cx="12" cy="12" r="4"/><path d="M12 2.6v2M12 19.4v2M2.6 12h2M19.4 12h2M5.4 5.4l1.4 1.4M17.2 17.2l1.4 1.4M5.4 18.6l1.4-1.4M17.2 6.8l1.4-1.4"/>',
    contrast: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" stroke="none"/>',
    invert: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M4.4 19.6 19.6 4.4c.6.6.9 1.3.9 2.1v11a3 3 0 0 1-3 3h-11c-.8 0-1.5-.3-2.1-.9z" fill="currentColor" stroke="none"/>',
    mono: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17M12 7.5h6.8M12 12h8.5M12 16.5h6.8"/>',
    lowSat: '<path d="M12 3.5s-6 6.4-6 10.6a6 6 0 0 0 12 0C18 9.9 12 3.5 12 3.5z"/><path d="M9.5 15.5h5"/>',
    highSat: '<path d="M12 3.5s-6 6.4-6 10.6a6 6 0 0 0 12 0C18 9.9 12 3.5 12 3.5z" fill="currentColor"/>',
    filters: '<circle cx="9" cy="9.5" r="5"/><circle cx="15" cy="9.5" r="5"/><circle cx="12" cy="14.5" r="5"/>',
    textColor: '<path d="M6.5 16 12 4l5.5 12M8.6 11.5h6.8"/><path d="M4 20.2h16" stroke-width="2.6"/>',
    titleColor: '<path d="M6.5 4v12M17.5 4v12M6.5 10h11"/><path d="M4 20.2h16" stroke-width="2.6"/>',
    bgColor: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M3.8 13.4 13.4 3.8M8 20.4 20.4 8"/>',
    brightness: '<circle cx="12" cy="12" r="4"/><path d="M12 8a4 4 0 0 1 0 8z" fill="currentColor" stroke="none"/><path d="M12 2.6v2M12 19.4v2M2.6 12h2M19.4 12h2M5.4 5.4l1.4 1.4M17.2 17.2l1.4 1.4M5.4 18.6l1.4-1.4M17.2 6.8l1.4-1.4"/>',
    // navigation
    keyboard: '<rect x="2.5" y="6" width="19" height="12" rx="2.2"/><path d="M6 10h0M9 10h0M12 10h0M15 10h0M18 10h0" ' + DOT + '/><path d="M7.5 14.2h9"/>',
    focus: '<path d="M4 8.5V5.5a1.5 1.5 0 0 1 1.5-1.5h3M15.5 4h3A1.5 1.5 0 0 1 20 5.5v3M20 15.5v3a1.5 1.5 0 0 1-1.5 1.5h-3M8.5 20h-3A1.5 1.5 0 0 1 4 18.5v-3"/><circle cx="12" cy="12" r="3"/>',
    structure: '<rect x="3.5" y="3.5" width="7" height="5" rx="1.3"/><path d="M7 8.5V17a1.5 1.5 0 0 0 1.5 1.5H12M7 12.5h5"/><rect x="12" y="10" width="8.5" height="5" rx="1.3"/><rect x="12" y="16" width="8.5" height="5" rx="1.3"/>',
    cursorBlack: '<path d="M5.5 3.5 18.5 11.6l-5.9 1.4-3 5.5z" fill="currentColor"/>',
    cursorWhite: '<path d="M5.5 3.5 18.5 11.6l-5.9 1.4-3 5.5z"/>',
    vkeyboard: '<rect x="2.5" y="10" width="19" height="10" rx="2.2"/><path d="M6 13.8h0M9 13.8h0M12 13.8h0M15 13.8h0M18 13.8h0" ' + DOT + '/><path d="M8 17.2h8"/><path d="M9 6.5 12 3.5l3 3"/>',
    voice: '<rect x="6.5" y="2.5" width="6" height="11" rx="3"/><path d="M3.5 11a6 6 0 0 0 12 0M9.5 17v4"/><path d="M15.5 19.5H21M18.6 17l2.5 2.5-2.5 2.5"/>',
    dictation: '<rect x="5" y="2.5" width="6" height="11" rx="3"/><path d="M2 11a6 6 0 0 0 12 0M8 17v4"/><path d="M16.5 9H21M16.5 13H21M16.5 17h3"/>',
    targets: '<circle cx="12" cy="12" r="3.2"/><circle cx="12" cy="12" r="8.5" stroke-dasharray="2.6 2.9"/>',
    timer: '<circle cx="11" cy="13" r="7.5"/><path d="M11 9v4l2.6 1.8M9 2.8h4"/><path d="M19.5 3v4M17.5 5h4"/>',
    // reading
    speak: '<path d="M4 9.5h3l4.5-4v13l-4.5-4H4z"/><path class="w1" d="M15 9a4 4 0 0 1 0 6"/><path class="w2" d="M17.8 6.4a7.6 7.6 0 0 1 0 11.2"/><path class="w3" d="M20.5 3.9a11.2 11.2 0 0 1 0 16.2"/>',
    guide: '<path d="M5 5.5h14M5 9h10"/><rect x="2.5" y="12" width="19" height="3.4" rx="1.7" fill="currentColor" stroke="none"/><path d="M5 18.8h12"/>',
    mask: '<path d="M5 4h14a2.5 2.5 0 0 1 2.5 2.5V9.5h-19V6.5A2.5 2.5 0 0 1 5 4zM2.5 14.5h19v3a2.5 2.5 0 0 1-2.5 2.5H5a2.5 2.5 0 0 1-2.5-2.5z" fill="currentColor" stroke="none" opacity=".35"/><rect x="2.5" y="4" width="19" height="16" rx="2.5"/><path d="M6.5 12h11"/>',
    pause: '<circle cx="12" cy="12" r="8.5"/><path d="M10 9v6M14 9v6"/>',
    hideImg: '<rect x="3.5" y="5" width="17" height="14" rx="2.2"/><circle cx="9" cy="10" r="1.6"/><path d="m20.5 15.5-4-4-9 7.5"/><path d="M3 3.5l18 17"/>',
    mute: '<path d="M4 9.5h3l4.5-4v13l-4.5-4H4z"/><path d="M15.5 9.5l5 5M20.5 9.5l-5 5"/>',
    reader: '<rect x="5" y="3" width="14" height="18" rx="2.2"/><path d="M8.5 8h7M8.5 11.5h7M8.5 15h4.5"/>',
    dictionary: '<path d="M5 5a2 2 0 0 1 2-2h12v15H7a2 2 0 0 0-2 2z"/><path d="M5 19a2 2 0 0 0 2 2h12v-3"/><path d="M9.5 13.2 12 6.8l2.5 6.4M10.3 11.2h3.4"/>',
    summary: '<path d="M4 5.5h16M4 10h13M4 14.5h9"/><path d="M4 19h5.5"/>',
    sign: '<path d="M8 13V5.6a1.5 1.5 0 0 1 3 0V11M11 10.5V4a1.5 1.5 0 0 1 3 0v6.6M14 10.6V5.6a1.5 1.5 0 0 1 3 0V12"/><path d="M17 10a1.5 1.5 0 0 1 3 0v5a7 7 0 0 1-7 7h-.8a6 6 0 0 1-4.7-2.3L4.3 16a1.6 1.6 0 0 1 2.4-2.1L8 15.4V13"/>',
    translate: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.5 3.7 5.3 3.7 8.5s-1.3 6-3.7 8.5c-2.4-2.5-3.7-5.3-3.7-8.5S9.6 6 12 3.5z"/>',
    // tools
    aria: '<path d="M8 7.5 3.5 12 8 16.5M16 7.5l4.5 4.5-4.5 4.5M13.6 5l-3.2 14"/>',
    altText: '<rect x="3" y="3.5" width="18" height="12.5" rx="2.2"/><circle cx="8.5" cy="8.2" r="1.4"/><path d="m21 13-4-3.6L9.5 16"/><path d="M6 20.2h12"/>',
    forms: '<rect x="3" y="4" width="18" height="6" rx="1.6"/><rect x="3" y="14" width="18" height="6" rx="1.6"/><path d="M6.5 7h5M6.5 17h3"/>',
    oversized: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M9 15l6-6M10.2 9H15v4.8"/>',
    position: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><circle cx="15.6" cy="15.6" r="2.1" fill="currentColor" stroke="none"/>',
    remember: '<path d="M7 3.5h10a1 1 0 0 1 1 1V21l-6-4-6 4V4.5a1 1 0 0 1 1-1z"/>',
    audit: '<path d="M12 3 5 6v5.5c0 4.4 3 7.9 7 9.5 4-1.6 7-5.1 7-9.5V6z"/><path d="m9 12 2.2 2.2L15.4 10"/>',
    report: '<path d="M5.5 21V4M5.5 4h11.5l-2 4.2 2 4.2H5.5"/>',
    statement: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 14l2 2 4-4"/>',
    // controls
    play: '<path d="M8 5.6v12.8l10-6.4z"/>',
    pauseSm: '<path d="M9 5.5v13M15 5.5v13"/>',
    stop: '<rect x="6.5" y="6.5" width="11" height="11" rx="1.6"/>',
    backspace: '<path d="M8.5 5H20a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H8.5L3 12z"/><path d="m11 9 6 6M17 9l-6 6"/>',
    shift: '<path d="M12 4 4.5 11.5h4V19h7v-7.5h4z"/>',
    enter: '<path d="M19 5v7a2 2 0 0 1-2 2H5.5M9.5 10l-4 4 4 4"/>',
    left: '<path d="M14.5 6 8.5 12l6 6"/>',
    right: '<path d="M9.5 6l6 6-6 6"/>',
    copy: '<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2"/><path d="M15.5 8.5V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v9.5a1 1 0 0 0 1 1h3.5"/>',
    external: '<path d="M14 4h6v6M20 4l-8.5 8.5M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    mic: '<rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4"/>',
    smartContrast: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" stroke="none"/><path d="m15.2 9.5-4.2 5-2.3-2.3" stroke="var(--bg,#fff)"/>',
    hover: '<path d="M8 3.5H5A1.5 1.5 0 0 0 3.5 5v3M16 3.5h3A1.5 1.5 0 0 1 20.5 5v3M3.5 16v3A1.5 1.5 0 0 0 5 20.5h3"/><path d="M11 11l9.5 3.6-4 1.4-1.4 4z"/>',
    tooltip: '<path d="M4.5 4h15A1.5 1.5 0 0 1 21 5.5v9a1.5 1.5 0 0 1-1.5 1.5H13l-4 4v-4H4.5A1.5 1.5 0 0 1 3 14.5v-9A1.5 1.5 0 0 1 4.5 4z"/><path d="M8 8.5h8M8 12h5"/>',
    sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    direction: '<path d="M4 8h14M14.5 4.5 18 8l-3.5 3.5M20 16H6M9.5 12.5 6 16l3.5 3.5"/>',
    spinner: '<circle cx="12" cy="12" r="9" opacity=".22"/><path d="M12 3a9 9 0 0 1 9 9"/>',
    loading: '<circle cx="12" cy="12" r="8.5" stroke-dasharray="2.4 2.9"/><path d="M12 7.5V12l3 2"/>',
    web: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.3 2.4 3.4 5.2 3.4 8.5s-1.1 6.1-3.4 8.5c-2.3-2.4-3.4-5.2-3.4-8.5S9.7 5.9 12 3.5z"/>',
    tips: '<path d="M4.5 5h15a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H11l-4.5 3.5V16h-2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/><path d="M12 8.4v.1M12 10.8v2.6"/>',
    alert: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5.5M12 16.4v.2"/>',
    help: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.1-2.4 3.6"/><path d="M12 16.8h0" stroke-width="2.4"/>',
    move: '<path d="M12 3v18M3 12h18M12 3 9.5 5.5M12 3l2.5 2.5M12 21l-2.5-2.5M12 21l2.5-2.5M3 12l2.5-2.5M3 12l2.5 2.5M21 12l-2.5-2.5M21 12l-2.5 2.5"/>',
    gtranslate: '<path fill="currentColor" stroke="none" d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>',
    chevron: '<path d="M9.5 5.5 16 12l-6.5 6.5"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8h0" stroke-width="2.4"/>'
  };
  function ic(name, cls) {
    return '<svg class="i' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (I[name] || '') + '</svg>';
  }

  /* ------------------------------------------------------------------ *
   * 5. Feature catalogue
   * ------------------------------------------------------------------ */
  var PROFILES = [
    { id: 'seizure', icon: 'seizure', label: 'Seizure safe', desc: 'Stops motion and flashing, softens color', set: { stopAnimations: true, saturation: 'low' } },
    { id: 'vision', icon: 'vision', label: 'Vision impaired', desc: 'Larger, clearer text and stronger focus', set: { fontSize: 1.3, font: 'readable', highlightTitles: true, highlightLinks: true, focusRing: true, cursor: 'black', smartContrast: true } },
    { id: 'adhd', icon: 'adhd', label: 'ADHD friendly', desc: 'Fewer distractions, focused reading', set: { readingMask: true, stopAnimations: true, saturation: 'low' } },
    { id: 'cognitive', icon: 'cognitive', label: 'Cognitive disability', desc: 'Clear structure, tips and a calmer page', set: { highlightTitles: true, highlightLinks: true, stopAnimations: true, focusRing: true, font: 'readable', tooltips: true } },
    { id: 'dyslexia', icon: 'dyslexia', label: 'Dyslexia', desc: 'Dyslexia-friendly font and spacing', set: { font: 'dyslexic', letterSpacing: 0.05, wordSpacing: 0.16, lineHeight: 1.8, textAlign: 'left' } },
    { id: 'colorblind', icon: 'colorblind', label: 'Color blind', desc: 'Corrects colors for color vision deficiency', set: { colorBlind: 'deuteranopia', saturation: 'high' } },
    { id: 'motor', icon: 'motor', label: 'Motor impaired', desc: 'Keyboard support and bigger targets', set: { keyboardNav: true, focusRing: true, bigTargets: true, cursor: 'black', extendedTime: true, stopAnimations: true, hoverHighlight: true } },
    { id: 'blind', icon: 'blind', label: 'Blind users', desc: 'Optimized for screen readers and keyboard', set: { ariaFix: true, altText: true, formFix: true, keyboardNav: true, focusRing: true } },
    { id: 'elderly', icon: 'elderly', label: 'Older adults', desc: 'Larger text, clearer links, more time', set: { fontSize: 1.3, font: 'readable', cursor: 'black', highlightLinks: true, bigTargets: true, extendedTime: true, smartContrast: true } }
  ];

  function pct(v) { return Math.round(v * 100) + '%'; }
  var F = [
    // Text
    { id: 'contentScale', tab: 'text', t: 'cycle', key: 'contentScale', icon: 'scale', label: 'Content scaling', opts: [1, 1.1, 1.25, 1.4, 1.6], fmt: pct, kw: 'zoom page size' },
    { id: 'fontSize', tab: 'text', t: 'cycle', key: 'fontSize', icon: 'fontSize', label: 'Bigger text', opts: [1, 1.15, 1.3, 1.5, 1.75], fmt: pct, kw: 'font size large' },
    { id: 'font', tab: 'text', t: 'view', view: 'fonts', key: 'font', icon: 'font', label: 'Font', val: function () { return fontName(S.font); }, kw: 'readable dyslexia typeface legible family' },
    { id: 'lineHeight', tab: 'text', t: 'cycle', key: 'lineHeight', icon: 'lineHeight', label: 'Line height', opts: [0, 1.5, 1.8, 2.1], fmt: function (v) { return v ? v + '×' : 'Default'; }, kw: 'spacing lines' },
    { id: 'letterSpacing', tab: 'text', t: 'cycle', key: 'letterSpacing', icon: 'letterSpacing', label: 'Letter spacing', opts: [0, 0.05, 0.1, 0.16], fmt: function (v) { return ['Default', 'Light', 'Medium', 'Wide'][[0, 0.05, 0.1, 0.16].indexOf(v)]; }, kw: 'text spacing tracking' },
    { id: 'wordSpacing', tab: 'text', t: 'cycle', key: 'wordSpacing', icon: 'wordSpacing', label: 'Word spacing', opts: [0, 0.16, 0.3, 0.45], fmt: function (v) { return ['Default', 'Light', 'Medium', 'Wide'][[0, 0.16, 0.3, 0.45].indexOf(v)]; }, kw: 'spacing words' },
    { id: 'fontWeight', tab: 'text', t: 'cycle', key: 'fontWeight', icon: 'fontWeight', label: 'Bolder text', opts: [0, 600, 700], fmt: function (v) { return v ? (v === 600 ? 'Semibold' : 'Bold') : 'Default'; }, kw: 'font weight thick' },
    { id: 'textAlign', tab: 'text', t: 'cycle', key: 'textAlign', icon: 'textAlign', label: 'Text align', opts: ['', 'left', 'center', 'right', 'justify'], fmt: function (v) { return v ? v.charAt(0).toUpperCase() + v.slice(1) : 'Default'; }, kw: 'alignment justify center' },
    { id: 'textDir', tab: 'text', t: 'cycle', key: 'textDir', icon: 'direction', label: 'Text direction', opts: ['', 'ltr', 'rtl'], fmt: function (v) { return { '': 'Default', ltr: 'Left to right', rtl: 'Right to left' }[v]; }, kw: 'rtl ltr right left arabic hebrew' },
    { id: 'highlightTitles', tab: 'text', t: 'toggle', key: 'highlightTitles', icon: 'titles', label: 'Highlight titles', kw: 'headings' },
    { id: 'highlightLinks', tab: 'text', t: 'toggle', key: 'highlightLinks', icon: 'links', label: 'Highlight links', kw: 'underline' },
    { id: 'magnifier', tab: 'text', t: 'toggle', key: 'magnifier', icon: 'magnifier', label: 'Text magnifier', kw: 'zoom lens hover' },
    // Color
    { id: 'darkContrast', tab: 'color', t: 'radio', key: 'contrast', val: 'dark', icon: 'dark', label: 'Dark contrast', kw: 'night black' },
    { id: 'lightContrast', tab: 'color', t: 'radio', key: 'contrast', val: 'light', icon: 'light', label: 'Light contrast', kw: 'white bright' },
    { id: 'highContrast', tab: 'color', t: 'radio', key: 'contrast', val: 'high', icon: 'contrast', label: 'High contrast', kw: 'strong' },
    { id: 'smartContrast', tab: 'color', t: 'toggle', key: 'smartContrast', icon: 'smartContrast', label: 'Smart contrast', kw: 'fix low contrast readable' },
    { id: 'invert', tab: 'color', t: 'toggle', key: 'invert', icon: 'invert', label: 'Invert colors', kw: 'negative reverse' },
    { id: 'mono', tab: 'color', t: 'radio', key: 'saturation', val: 'mono', icon: 'mono', label: 'Monochrome', kw: 'grayscale grey gray black white' },
    { id: 'lowSat', tab: 'color', t: 'radio', key: 'saturation', val: 'low', icon: 'lowSat', label: 'Low saturation', kw: 'muted soft color' },
    { id: 'highSat', tab: 'color', t: 'radio', key: 'saturation', val: 'high', icon: 'highSat', label: 'High saturation', kw: 'vivid color' },
    { id: 'colorBlind', tab: 'color', t: 'cycle', key: 'colorBlind', icon: 'filters', label: 'Color blindness', opts: ['', 'protanopia', 'deuteranopia', 'tritanopia'], fmt: function (v) { return v ? v.charAt(0).toUpperCase() + v.slice(1) : 'Off'; }, kw: 'protanopia deuteranopia tritanopia filter daltonism' },
    // Navigation
    { id: 'keyboardNav', tab: 'nav', t: 'toggle', key: 'keyboardNav', icon: 'keyboard', label: 'Keyboard navigation', kw: 'tab shortcuts' },
    { id: 'focusRing', tab: 'nav', t: 'toggle', key: 'focusRing', icon: 'focus', label: 'Focus highlight', kw: 'visible focus indicator outline' },
    { id: 'hoverHighlight', tab: 'nav', t: 'toggle', key: 'hoverHighlight', icon: 'hover', label: 'Highlight hover', kw: 'pointer frame outline mouse' },
    { id: 'structure', tab: 'nav', t: 'view', view: 'structure', icon: 'structure', label: 'Page structure', kw: 'skip links headings landmarks outline' },
    { id: 'cursorBlack', tab: 'nav', t: 'radio', key: 'cursor', val: 'black', icon: 'cursorBlack', label: 'Big black cursor', kw: 'mouse pointer' },
    { id: 'cursorWhite', tab: 'nav', t: 'radio', key: 'cursor', val: 'white', icon: 'cursorWhite', label: 'Big white cursor', kw: 'mouse pointer' },
    { id: 'vkeyboard', tab: 'nav', t: 'toggle', key: 'vkeyboard', icon: 'vkeyboard', label: 'On-screen keyboard', kw: 'virtual keyboard typing' },
    { id: 'voiceNav', tab: 'nav', t: 'toggle', key: 'voiceNav', icon: 'voice', label: 'Voice commands', kw: 'speech navigation control' },
    { id: 'dictation', tab: 'nav', t: 'toggle', key: 'dictation', icon: 'dictation', label: 'Talk & type', kw: 'speech to text dictation' },
    { id: 'bigTargets', tab: 'nav', t: 'toggle', key: 'bigTargets', icon: 'targets', label: 'Bigger targets', kw: 'click touch buttons size' },
    { id: 'extendedTime', tab: 'nav', t: 'toggle', key: 'extendedTime', icon: 'timer', label: 'More time', kw: 'extended timeout hover duration' },
    // Reading
    { id: 'tts', tab: 'reading', t: 'toggle', key: 'tts', icon: 'speak', label: 'Read aloud', kw: 'text to speech screen reader voice' },
    { id: 'readingGuide', tab: 'reading', t: 'toggle', key: 'readingGuide', icon: 'guide', label: 'Reading guide', kw: 'line ruler' },
    { id: 'readingMask', tab: 'reading', t: 'toggle', key: 'readingMask', icon: 'mask', label: 'Reading mask', kw: 'spotlight focus' },
    { id: 'stopAnimations', tab: 'reading', t: 'toggle', key: 'stopAnimations', icon: 'pause', label: 'Stop animations', kw: 'motion pause gif' },
    { id: 'hideImages', tab: 'reading', t: 'toggle', key: 'hideImages', icon: 'hideImg', label: 'Hide images', kw: 'pictures media' },
    { id: 'mute', tab: 'reading', t: 'toggle', key: 'mute', icon: 'mute', label: 'Mute sounds', kw: 'audio silence' },
    { id: 'tooltips', tab: 'reading', t: 'toggle', key: 'tooltips', icon: 'tooltip', label: 'Tooltips', kw: 'title alt description hover' },
    { id: 'spokenTips', tab: 'reading', t: 'toggle', key: 'spokenTips', icon: 'tips', label: 'Spoken tips', kw: 'voice guide instructions sound help commands' },
    { id: 'reader', tab: 'reading', t: 'action', icon: 'reader', label: 'Reader view', kw: 'simplified view reader mode clean' },
    { id: 'dictionary', tab: 'reading', t: 'toggle', key: 'dictionary', icon: 'dictionary', label: 'Dictionary', kw: 'glossary define lookup meaning' },
    { id: 'summary', tab: 'reading', t: 'view', view: 'summary', icon: 'summary', label: 'Page summary', kw: 'summarize summarizer key points' },
    { id: 'sign', tab: 'reading', t: 'view', view: 'sign', icon: 'sign', label: 'Sign language', kw: 'asl libras deaf interpretation' },
    { id: 'translate', tab: 'reading', t: 'view', view: 'translate', icon: 'gtranslate', label: 'Translate', kw: 'language multilingual' },
    // Tools
    { id: 'ariaFix', tab: 'tools', t: 'toggle', key: 'ariaFix', icon: 'aria', label: 'ARIA fixes', kw: 'roles landmarks screen reader semantics' },
    { id: 'altText', tab: 'tools', t: 'toggle', key: 'altText', icon: 'altText', label: 'Image descriptions', kw: 'alt text images' },
    { id: 'formFix', tab: 'tools', t: 'toggle', key: 'formFix', icon: 'forms', label: 'Form fixes', kw: 'labels errors inputs' },
    { id: 'oversized', tab: 'tools', t: 'toggle', key: 'oversized', icon: 'oversized', label: 'Larger features', kw: 'oversized interface bigger menu widget' },
    { id: 'position', tab: 'tools', t: 'view', view: 'position', icon: 'position', label: 'Feature position', kw: 'move place corner button widget' },
    { id: 'remember', tab: 'tools', t: 'toggle', key: 'remember', icon: 'remember', label: 'Remember settings', kw: 'persistent save cookie memory' },
    { id: 'audit', tab: 'tools', t: 'view', view: 'audit', icon: 'audit', label: 'Page check', kw: 'compliance analytics audit wcag report' },
    { id: 'reportIssue', tab: 'tools', t: 'view', view: 'report', icon: 'report', label: 'Report an issue', kw: 'feedback problem form' },
    { id: 'statementLink', tab: 'tools', t: 'action', icon: 'statement', label: 'Accessibility statement', kw: 'policy' },
    { id: 'resetAll', tab: 'tools', t: 'action', icon: 'reset', label: 'Reset all', kw: 'clear default restore' }
  ];
  var FMAP = {};
  F.forEach(function (f) { FMAP[f.id] = f; });

  /* Help texts, written as short guides.
   * Format, one item per line:  plain text = paragraph,  "## Title" = small heading,
   * "- text" = bullet,  "1. text" = numbered step,  "@name" = small illustration from ILL. */
  var DESC = {
    seizure: 'Makes the page calmer and safer if flashing or movement can trigger seizures.\n## It will\n- Stop animations, slideshows and moving pictures\n- Pause videos that play by themselves\n- Soften strong, bright colors\n## Good for\n- People with photosensitive epilepsy\n- Anyone who finds moving content uncomfortable\n@stopAnimations',
    vision: 'Makes the page easier to see.\n## It will\n- Make text bigger and clearer\n- Outline headings and links so they are easy to find\n- Fix text that is hard to read against its background\n- Show a big black mouse pointer\n- Draw a clear frame around the item you select with the keyboard\n@fontSize',
    adhd: 'Helps you focus on one part of the page at a time.\n## It will\n- Dim the page, except the lines you are reading\n- Stop moving content\n- Make colors calmer\n## Tip\n- Move your mouse or finger down the page to move the reading area\n@readingMask',
    cognitive: 'Makes the page simpler to follow and understand.\n## It will\n- Make headings and links stand out\n- Use a clear, easy-to-read font\n- Stop moving content\n- Show short tips when you point at buttons and pictures\n- Frame the item you select with the keyboard\n@highlightTitles',
    dyslexia: 'Makes text easier to read with dyslexia.\n## It will\n- Use a dyslexia-friendly font\n- Add space between letters, words and lines\n- Line text up on the left\n@letterSpacing',
    colorblind: 'Adjusts colors so they are easier to tell apart if you are color blind.\n## It will\n- Correct colors for green weakness, the most common type\n- Make colors a little stronger\n## Tip\n- For red or blue weakness, open the Color tab and press Color blindness\n@colorBlind',
    motor: 'Makes the page easier to use if a mouse is hard for you.\n## It will\n- Let you use the whole page with the keyboard\n- Make buttons and boxes bigger\n- Show a big mouse pointer\n- Give you more time and keep menus open longer\n- Stop moving content\n- Frame whatever your pointer is over\n@bigTargets',
    blind: 'Prepares the page for screen readers such as NVDA, JAWS, VoiceOver and TalkBack.\n## It will\n- Add missing names to buttons, links and form fields\n- Describe pictures that have no description\n- Mark the main parts of the page\n- Turn on keyboard navigation',
    elderly: 'Makes the page more comfortable to read and use.\n## It will\n- Make text bigger and clearer\n- Make links stand out\n- Fix text that is hard to read\n- Make buttons bigger and show a big mouse pointer\n- Give you more time to read and act\n@fontSize',
    contentScale: 'Makes the whole page bigger: text, pictures and buttons together.\n@contentScale\n## How to use\n1. Press once to make the page bigger\n2. Press again for the next size\n3. Keep pressing to go back to the normal size\n## Sizes\n- 110%, 125%, 140% and 160%',
    fontSize: 'Makes only the text bigger. Pictures and layout stay the same.\n@fontSize\n## How to use\n1. Press once to make text bigger\n2. Press again for the next size, up to 175%\n3. Keep pressing to go back to normal',
    font: 'Changes the letters used on the whole page.\n## Choices\n- Easy to read: very clear letters, good for low vision\n- Dyslexia friendly: letters that are harder to mix up\n- About 80 other fonts, each shown in its own style\n## How to use\n1. Open the list\n2. Type a name in the search box, or scroll\n3. Choose a font\n4. Choose Original font to undo',
    lineHeight: 'Adds space between lines of text, so your eyes can follow each line.\n@lineHeight\n## How to use\n1. Press once to add space\n2. Press again for more space\n3. Keep pressing to go back to normal',
    letterSpacing: 'Adds space between letters, so they do not run together.\n@letterSpacing\n## How to use\n1. Press to choose Light, Medium or Wide\n2. Keep pressing to go back to normal',
    wordSpacing: 'Adds space between words, so each word stands on its own.\n@wordSpacing\n## How to use\n1. Press to choose Light, Medium or Wide\n2. Keep pressing to go back to normal',
    fontWeight: 'Makes thin text thicker and darker.\n## How to use\n1. Press once for semibold\n2. Press again for bold\n3. Press again to go back to normal',
    textAlign: 'Changes how lines of text line up.\n@textAlign\n## Choices\n- Left: easiest to read for most people\n- Center\n- Right\n- Justify: straight edges on both sides\n## How to use\n- Press to go through the choices. Keep pressing to go back to normal',
    textDir: 'Changes the direction of the whole page.\n@textDir\n## Choices\n- Right to left: mirrors the page like Arabic, Hebrew or Persian websites. Text starts on the right and menus swap sides\n- Left to right: the usual layout for English, French and similar languages\n## Good to know\n- Translating the page into a right-to-left language turns this on by itself',
    highlightTitles: 'Draws a box around every heading, so you can see how the page is organized at a glance.\n@highlightTitles',
    highlightLinks: 'Underlines and outlines every link, so you always know what you can click.\n@highlightLinks',
    magnifier: 'Shows the text under your pointer in large letters next to it.\n@magnifier\n## How to use\n1. Turn it on\n2. Point at any text on the page\n3. Read it in the large box',
    darkContrast: 'Shows light text on a dark background.\n@darkContrast\n## Good for\n- Less glare and eye strain\n- Reading at night',
    lightContrast: 'Shows dark text on a plain white background.\n@lightContrast\n## Good for\n- Busy or faded designs\n- Strong, clear reading',
    highContrast: 'Makes the difference between light and dark parts stronger, so text and edges stand out.\n@highContrast',
    smartContrast: 'Fixes only the text that is hard to read because its color is too close to the background.\n@smartContrast\n## Good to know\n- The rest of the design stays the same\n- It pauses while dark or light contrast is on',
    invert: 'Swaps light and dark colors on the page.\n@invert\n## Good to know\n- Photos and videos keep their normal colors',
    mono: 'Shows the page in black, white and gray, which removes color distractions.\n@mono',
    lowSat: 'Makes colors softer and calmer.\n@lowSat',
    highSat: 'Makes colors stronger and brighter. This can help if colors look faded to you.\n@highSat',
    colorBlind: 'Corrects the page colors for color blindness, so colors that look alike become easier to tell apart.\n@colorBlind\n## Choices\n- Protanopia: red weakness\n- Deuteranopia: green weakness, the most common\n- Tritanopia: blue weakness\n## How to use\n- Press to go through the choices. Keep pressing to turn it off',
    keyboardNav: 'Lets you use the whole page with the keyboard.\n@keyboardNav\n## Keys\n- Tab: move to the next item\n- Shift + Tab: move back\n- Enter: press the selected item\n- Alt + H: next heading\n- Alt + L: next link\n- Alt + F: next form field\n- Alt + B: next button\n- Add Shift to any Alt shortcut to go back\n## Also\n- Adds a "Skip to main content" link at the top of the page',
    focusRing: 'Draws a thick outline around the item you selected with the keyboard, so you never lose your place.\n@focusRing',
    hoverHighlight: 'Draws a frame around whatever your pointer is over, so you can see exactly what you are about to click.\n@hoverHighlight',
    structure: 'Shows a list of the parts of the page, so you can jump straight to one.\n@structure\n## Lists\n- Headings: the titles of each section\n- Regions: main areas such as the menu and the footer\n- Links: every link on the page\n## How to use\n1. Choose a list at the top\n2. Choose an item to jump to it',
    cursorBlack: 'Shows a big black mouse pointer. It is easiest to see on light pages.\n@cursorBlack',
    cursorWhite: 'Shows a big white mouse pointer. It is easiest to see on dark pages.\n@cursorWhite',
    vkeyboard: 'Shows a keyboard on the screen, so you can type with a mouse, a touch screen or another pointing device.\n@vkeyboard\n## How to use\n1. Click into a text box\n2. Press the keys on the screen keyboard\n3. Drag the top bar to move the keyboard\n## Special keys\n- Shift: one capital letter. Press twice for all capitals\n- 123: numbers and symbols\n- Arrows: move inside the text',
    voiceNav: 'Control the page with your voice.\n@voiceNav\n## How to use\n1. Turn it on and allow the microphone\n2. Say a command\n## Examples\n- "Scroll down" or "Scroll up"\n- "Click Contact"\n- "Show numbers", then say a number\n- "Go back"\n- "Stop listening"\n## Good to know\n- Works in Chrome, Edge and Safari',
    dictation: 'Type by speaking.\n## How to use\n1. Click into a text box\n2. Turn this on and allow the microphone\n3. Speak\n## You can say\n- "Period", "comma", "question mark": add punctuation\n- "New line", "new paragraph": start a new line\n- "Delete that": remove the last word',
    bigTargets: 'Makes buttons, check boxes and form fields bigger, so they are easier to click or tap.\n@bigTargets',
    extendedTime: 'Gives you more time.\n## It will\n- Make messages and slideshows that change by themselves wait longer\n- Keep menus open a little after your pointer leaves them',
    tts: 'Reads the page out loud.\n@tts\n## How to use\n- Click any text to hear it\n- Select text to hear only that part\n- Press play on the bar at the bottom of the screen to read the whole page\n## Change how it sounds\n- Open the Reading tab and scroll to Reading voice\n- You can choose the language, the voice, the speed and the pitch',
    readingGuide: 'Shows a line under your pointer that moves with you, to help you keep your place while reading.\n@readingGuide',
    readingMask: 'Darkens the page above and below your pointer and leaves a clear band where you read.\n@readingMask\n## Good for\n- Focusing on a few lines at a time',
    stopAnimations: 'Stops everything that moves: animations, moving pictures, slideshows and videos that play by themselves.\n@stopAnimations',
    hideImages: 'Hides pictures and background images, so you can focus on the text.\n@hideImages\n## Good to know\n- Each hidden picture is replaced by a small label with its description, so you do not miss what it shows\n- Decorative pictures are removed completely',
    mute: 'Turns off all sound on the page, including videos.',
    tooltips: 'Shows the hidden name or description of buttons, links and pictures in a small bubble when you point at them or select them.\n@tooltips',
    reader: 'Shows the main text of the page in a clean, simple view.\n## It removes\n- Menus, side boxes and adverts\n## You can\n- Make the text bigger or smaller\n- Choose light, sepia or dark colors\n- Switch the font\n- Have it read aloud',
    dictionary: 'Shows what a word means.\n@dictionary\n## How to use\n1. Turn it on\n2. Select a word on the page\n3. Read the meaning in the box next to it',
    summary: 'Gives you the main points of the page in a few sentences.\n## You also get\n- The number of words and the reading time\n- A list of the sections\n## You can\n- Listen to the summary\n- Copy it',
    sign: 'Shows the page in sign language.\n## Choices\n- Libras (Brazilian): an avatar signs the text live\n- ASL (American): plays videos the website has made. Parts of the page with a video get an outline. Select one to watch',
    translate: 'Translates the whole page, and this menu, into your language.\n## How to use\n1. Type your language in the search box\n2. Choose it and wait a moment\n3. To undo, choose Original language\n## Good to know\n- Right-to-left languages such as Arabic also mirror the page',
    ariaFix: 'Adds information that screen readers need. You will not see any change.\n## It adds\n- Names for buttons that only show an icon\n- Labels for the main parts of the page\n- The right role for items you can click',
    altText: 'Adds short descriptions to pictures that have none, so screen reader users know what they show.',
    formFix: 'Makes forms easier to use with a screen reader.\n## It will\n- Connect each box to its label\n- Connect error messages to the right box\n- Mark boxes that must be filled in',
    oversized: 'Makes this menu bigger, with larger text and buttons.',
    position: 'Moves the accessibility button.\n@position\n## How to use\n- Choose a spot on the grid\n- Or drag the button anywhere on the screen\n- Or select the button and press Alt + arrow keys',
    remember: 'Keeps your settings for your next visit and for other pages.\n## Good to know\n- When it is off, your settings last only until you close the browser',
    audit: 'Checks this page for common accessibility problems and gives it a score.\n## How to use\n- Choose a problem to outline it on the page\n- Press the help icon next to a problem to see how to fix it\n## Good to know\n- Automatic checks find common problems only. A full review needs real people\n- If color settings are on, the contrast result describes the changed page',
    reportIssue: 'Tells the website owner about a problem, so they can fix it.\n## How to use\n1. Choose the kind of problem\n2. Describe what happened\n3. Add your email if you want a reply\n4. Send the report\n## Good to know\n- The report includes this page address, your browser and your accessibility settings',
    statementLink: 'Explains how this website supports accessibility and how to get help.',
    resetAll: 'Turns every setting off and puts the page and this menu back the way they were at the start.'
  };

  // Help for headings that are not features (opened by clicking a heading with a help icon)
  var INFO = {
    panel: { title: 'Accessibility features', icon: 'logo', kind: 'About', desc: 'These features let you change this website to suit you.\n## How to use\n- Profiles turn on several settings at once\n- Each setting can also be changed on its own in the other tabs\n- Search for a feature by name in the search box\n- Reset all settings to undo everything\n## Shortcut\n- Alt + A: open or close this menu' },
    'tab-profiles': { title: 'Profiles', icon: 'logo', kind: 'About', desc: 'Profiles turn on a group of settings for a common need.\n## Good to know\n- You can turn on more than one profile\n- You can still change each setting in the other tabs\n- Turning a profile off undoes exactly what it changed\n## Shortcut\n- Alt + A: open or close this menu' },
    'tab-text': { title: 'Text', icon: 'fontSize', kind: 'About', desc: 'Change how text looks.\n## In this tab\n- Size, font and spacing\n- Alignment and page direction\n- Highlights for headings and links\n- A magnifier for small text\n## Good to know\n- Buttons with small bars have several levels. Press again for the next level' },
    'tab-color': { title: 'Color', icon: 'contrast', kind: 'About', desc: 'Change the colors of the page.\n## In this tab\n- Dark, light, high and smart contrast\n- Inverted colors and saturation\n- Corrections for color blindness\n- Your own colors for text, titles and background\n- Brightness' },
    'tab-nav': { title: 'Navigate', icon: 'keyboard', kind: 'About', desc: 'Make the page easier to move around.\n## In this tab\n- Keyboard use and focus highlight\n- A list of the parts of the page\n- Big mouse pointers\n- An on-screen keyboard\n- Voice control and typing by speaking\n- Bigger targets and more time' },
    'tab-reading': { title: 'Reading', icon: 'speak', kind: 'About', desc: 'Help with reading, sound and media.\n## In this tab\n- Read aloud, reading guide and reading mask\n- Stop animations, hide images and mute sounds\n- Tooltips, reader view, dictionary and summary\n- Sign language and translation\n- Reading language, voice, speed and pitch, at the bottom' },
    'tab-tools': { title: 'Tools', icon: 'aria', kind: 'About', desc: 'Repairs and options.\n## In this tab\n- Automatic repairs for screen readers, pictures and forms\n- Menu size, button position and saving your settings\n- Page check, problem report and accessibility statement\n- Reset all settings' },
    customColors: { title: 'Custom colors', icon: 'textColor', kind: 'Color', desc: 'Choose your own colors for text, titles and the page background.\n## How to use\n- Press a color circle to use it\n- Press + for more colors, or to type a color code\n- Press × to go back to the original color' },
    display: { title: 'Brightness', icon: 'brightness', kind: 'Color', desc: 'Makes the whole page darker or lighter.\n## How to use\n- Drag the slider\n- Or select it and use the arrow keys' },
    readingVoice: { title: 'Reading voice', icon: 'speak', kind: 'Reading', desc: 'Choose how read aloud sounds.\n## You can change\n- Language: the text is translated and read in that language\n- Voice: who is speaking\n- Speed: how fast\n- Pitch: how high or low\n## Good to know\n- The voices depend on your device\n- Press "Test the reading voice" to hear your choice' },
    usage: { title: 'Usage on this device', icon: 'audit', kind: 'Tools', desc: 'Shows which features were used most on this device.\n## Good to know\n- This stays in your browser, unless the website owner collects anonymous counts' },
    shortcuts: { title: 'Shortcuts', icon: 'keyboard', kind: 'Navigate', desc: 'Keys and spoken commands you can use.\n## Keyboard\n- Alt + A: open or close this menu\n- Esc: close a window or this menu\n## With Keyboard navigation on\n- Alt + H, L, F, B, M or G: next heading, link, field, button, region or picture\n- Add Shift to go back\n## With Voice commands on\n- Say any command from the list on this page' },
    statement: { title: 'Accessibility statement', icon: 'statement', kind: 'About', desc: '' }
  };
  var VIEW_HELP = { structure: 'structure', summary: 'summary', translate: 'translate', fonts: 'font', sign: 'sign', position: 'position', audit: 'audit', report: 'reportIssue', shortcuts: 'i:shortcuts' };

  // Every spoken command and reading key, in one place. The Shortcuts view, the help guides,
  // the spoken "What can I say" answer and the command matching all come from this list.
  var CMDS = {
    read: { title: 'Reading aloud', need: 'Say these with Voice commands on', items: [
      ['Read page', 'reads the whole page from the top'],
      ['Read this', 'reads the selected text, or the item you are on'],
      ['Read headings', 'reads only the headings, to get an overview'],
      ['Pause', 'pauses reading'],
      ['Continue', 'carries on from where it paused'],
      ['Next', 'skips to the next paragraph'],
      ['Previous', 'goes back one paragraph'],
      ['Repeat', 'reads the current paragraph again'],
      ['Faster', 'reads faster'],
      ['Slower', 'reads slower'],
      ['Stop reading', 'stops reading']
    ] },
    readKeys: { title: 'Reading keys', need: 'Work when Read aloud is on', keys: true, items: [
      ['Alt + R', 'read the page, or pause and continue'],
      ['Alt + N', 'next paragraph'],
      ['Alt + Shift + N', 'previous paragraph'],
      ['Esc', 'stop reading']
    ] },
    nav: { title: 'Moving around', need: 'Say these with Voice commands on', items: [
      ['Scroll down', 'moves the page down'],
      ['Scroll up', 'moves the page up'],
      ['Go to top', 'jumps to the top of the page'],
      ['Go to bottom', 'jumps to the end of the page'],
      ['Click', 'then the name of a link or button, for example "Click Contact"'],
      ['Show numbers', 'puts a number on everything you can press. Then say the number'],
      ['Hide numbers', 'removes the numbers'],
      ['Next heading', 'moves to the next heading'],
      ['Previous heading', 'moves to the heading before'],
      ['Next link', 'moves to the next link'],
      ['Next field', 'moves to the next box you can type in'],
      ['Search for', 'then your words, to use the search box of the page'],
      ['Zoom in', 'makes the page bigger'],
      ['Zoom out', 'makes the page smaller'],
      ['Go back', 'opens the page before'],
      ['Go forward', 'opens the next page'],
      ['Reload', 'loads the page again'],
      ['Open menu', 'opens the accessibility menu'],
      ['Close menu', 'closes the accessibility menu'],
      ['What can I say', 'reads this list out loud'],
      ['Stop listening', 'turns voice commands off']
    ] },
    dict: { title: 'Talk & type', need: 'Say these while Talk & type is on', items: [
      ['Period', 'adds a full stop. You can also say "full stop"'],
      ['Comma', 'adds a comma'],
      ['Question mark', 'adds ?'],
      ['Exclamation mark', 'adds !'],
      ['Colon', 'adds :'],
      ['Semicolon', 'adds ;'],
      ['Dash', 'adds -'],
      ['Open quote', 'adds " before a quote. Say "close quote" after it'],
      ['Open bracket', 'adds ( . Say "close bracket" after it'],
      ['New line', 'starts a new line'],
      ['New paragraph', 'leaves an empty line'],
      ['Delete that', 'removes what you said last'],
      ['Delete last word', 'removes one word'],
      ['Clear all', 'empties the box'],
      ['Next field', 'moves to the next box'],
      ['Previous field', 'moves to the box before'],
      ['Send', 'sends the form. You can also say "submit"'],
      ['What can I say', 'reads this list out loud'],
      ['Stop typing', 'turns Talk & type off']
    ] }
  };
  // Help guides for the sound features list every command, straight from CMDS
  DESC.tts = 'Reads the page out loud.\n@tts\n## How to use\n- Click any text to hear it\n- Select text to hear only that part\n- Press play on the bar at the bottom of the screen to read the whole page\n- Use the arrows on the bar to go back or skip a paragraph\n## Keys\n' + '%readKeys%' + '\n## Say it\n- Turn on Voice commands in the Navigate tab, then say:\n' + '%read%' + '\n## Change how it sounds\n- Open the Reading tab and scroll to Reading voice\n- Choose the language, the voice, the speed and the pitch';
  DESC.voiceNav = 'Control the page with your voice.\n@voiceNav\n## How to use\n1. Turn it on and allow the microphone\n2. A red dot at the top of the screen shows it is listening\n3. Say a command. The words you said appear next to the dot\n4. If it is not sure, it asks "Did you mean …?". Say yes or no, or press a button\n## Moving around\n' + '%nav%' + '\n## Reading aloud\n' + '%read%' + '\n## Good to know\n- Speak in your own language. Commands are understood in the language you chose for this website\n- It keeps listening until you turn it off\n- Works in Chrome, Edge and Safari';
  DESC.dictation = 'Type by speaking.\n@dictation\n## How to use\n1. Click into a text box\n2. Turn this on and allow the microphone\n3. Speak. Your words are typed where the cursor is\n4. The red dot at the top shows which box you are typing in\n## Punctuation and editing\n' + '%dict%' + '\n## Good to know\n- Sentences start with a capital letter by themselves\n- In an email box, say "at" and "dot", for example "anna at mail dot com"\n- If a short phrase sounds like a command, it asks first. Say yes, or no to type it as text';
  DESC.spokenTips = 'Short spoken help when you use a sound feature.\n## You will hear\n- How to start, when you turn on Read aloud, Voice commands or Talk & type\n- A question such as "Did you mean scroll down?" when a spoken command was not clear\n## Good to know\n- Saying "What can I say" always reads the commands out loud, even with this off\n- Tips are spoken in the language you chose for this website';
  INFO.shortcuts.desc = 'Keys and spoken commands you can use.\n## Keyboard\n- Alt + A: open or close this menu\n- Esc: close a window or this menu\n## While Read aloud is on\n' + '%readKeys%' + '\n## With Keyboard navigation on\n- Alt + H, L, F, B, M or G: next heading, link, field, button, region or picture\n- Add Shift to go back\n## With Voice commands or Talk & type on\n- Say "What can I say" to hear every command\n- The full lists are on this page';
  ['tts', 'voiceNav', 'dictation'].forEach(function (k) { DESC[k] = DESC[k].replace(/%(\w+)%/g, function (m, g) { return cmdLines(g); }); });
  INFO.shortcuts.desc = INFO.shortcuts.desc.replace(/%(\w+)%/g, function (m, g) { return cmdLines(g); });

  // Guide lines ("- ...") for a group of commands
  function cmdLines(g) {
    var c = CMDS[g];
    return c.items.map(function (it) { return '- ' + (c.keys ? it[0] : '"' + it[0] + '"') + ': ' + it[1]; }).join('\n');
  }
  // Plain sentences for speaking a group of commands out loud
  function cmdSpeech(g) {
    var c = CMDS[g];
    return [c.title + '. ' + c.need + '.'].concat(c.items.map(function (it) { return (c.keys ? it[0].replace(/\+/g, 'plus') : it[0]) + ': ' + it[1] + '.'; }));
  }

  // Human-friendly help for each page check
  var AUDIT_HELP = {
    alt: 'Some pictures have no text description, so screen reader users cannot know what they show.\n## How to fix\n- Add an alt text to every picture that carries meaning, for example alt="Team at the 2019 open day"\n- Use alt="" for pictures that are only decoration',
    labels: 'Some form boxes have no label, so people cannot tell what to type.\n## How to fix\n- Give every box a visible label\n- Connect it with <label for="…">',
    names: 'Some links or buttons show only an icon and have no name.\n## How to fix\n- Add a text label, or an aria-label such as aria-label="Search"',
    headings: 'Some heading levels are skipped, which makes the page outline confusing.\n## How to fix\n- Go one level at a time: H1, then H2, then H3',
    emptyHeadings: 'Some headings are empty.\n## How to fix\n- Remove them, or give them text',
    h1: 'The page should have exactly one main heading.\n## How to fix\n- Use one H1 that says what the page is about',
    lang: 'The page language is not set, so screen readers may use the wrong pronunciation.\n## How to fix\n- Add lang="en" (or your language) to the html element',
    title: 'The page has no title.\n## How to fix\n- Add a short, clear title in the head of the page',
    frames: 'Some embedded frames have no title.\n## How to fix\n- Add a title, for example title="Map of our location"',
    landmark: 'The page has no main area marked.\n## How to fix\n- Wrap the main content in a <main> element',
    ids: 'Some IDs are used more than once, which can break labels and links.\n## How to fix\n- Make every id value unique',
    tabindex: 'Some items force their own keyboard order, which makes Tab jump around.\n## How to fix\n- Use tabindex="0" or "-1" only',
    zoom: 'The page stops people from zooming in on phones.\n## How to fix\n- Remove user-scalable=no and maximum-scale from the viewport tag',
    contrast: 'Some text is hard to read because its color is too close to the background.\n## How to fix\n- Make the text darker or the background lighter (or the other way round)\n- Aim for a contrast of at least 4.5 to 1, or 3 to 1 for large text'
  };

  // Small before-and-after illustrations. Each panel is a mini page (100 × 72) drawn in the panel's own colors.
  var ILL = (function () {
    function pg(x, inner, dark) { return '<g transform="translate(' + x + ' 8)"><rect width="100" height="72" rx="9" class="' + (dark ? 'pgd' : 'pg') + '"/>' + inner + '</g>'; }
    function lines(ys, h, x, w, cls) { return ys.map(function (y, i) { return '<rect x="' + (x || 12) + '" y="' + y + '" width="' + (Array.isArray(w) ? w[i % w.length] : (w || 76)) + '" height="' + (h || 4) + '" rx="' + Math.min(2, (h || 4) / 2) + '" class="' + (cls || 'tx') + '"/>'; }).join(''); }
    function arrow() { return '<path d="M110 44h16m-5-5 5 5-5 5" class="ar"/>'; }
    function pair(a, b, darkA, darkB) { return pg(4, a, darkA) + arrow() + pg(136, b, darkB); }
    function dots(cols) { return cols.map(function (c, i) { return '<circle cx="' + (26 + i * 24) + '" cy="36" r="9" fill="' + c + '"/>'; }).join(''); }
    var arrowCursor = function (x, y, s, fill, stroke) { return '<path transform="translate(' + x + ' ' + y + ') scale(' + s + ')" d="M0 0v20l5.5-5 3.6 8.4 3.4-1.5-3.6-8.2H16z" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.4" stroke-linejoin="round"/>'; };
    return {
      fontSize: pair(lines([16, 24, 32, 40, 48], 3, 12, [76, 70, 74, 60, 68]), lines([14, 30, 46], 8, 12, [76, 66, 54])),
      contentScale: pair('<rect x="30" y="18" width="40" height="36" rx="5" class="tx"/>' + lines([24, 32, 40], 3, 36, 28, 'pgl'), '<rect x="10" y="8" width="80" height="56" rx="7" class="tx"/>' + lines([18, 30, 42], 6, 20, 58, 'pgl')),
      lineHeight: pair(lines([14, 21, 28, 35, 42, 49], 3), lines([14, 28, 42, 56], 3)),
      letterSpacing: pair('<g class="txf">' + [0, 1, 2, 3, 4, 5].map(function (i) { return '<rect x="' + (26 + i * 8) + '" y="30" width="6" height="12" rx="1.5"/>'; }).join('') + '</g>', '<g class="txf">' + [0, 1, 2, 3, 4, 5].map(function (i) { return '<rect x="' + (14 + i * 13) + '" y="30" width="6" height="12" rx="1.5"/>'; }).join('') + '</g>'),
      wordSpacing: pair(lines([22, 36, 50], 4, 12, 18).replace(/x="12"/g, 'x="12"') + lines([22, 36, 50], 4, 33, 22) + lines([22, 36, 50], 4, 58, 28), lines([22, 36, 50], 4, 8, 16) + lines([22, 36, 50], 4, 36, 18) + lines([22, 36, 50], 4, 66, 22)),
      textAlign: pair(lines([18, 28, 38, 48], 4, 12, [52, 76, 40, 64]), lines([18, 28, 38, 48], 4, 12, 76)),
      textDir: pair('<rect x="10" y="10" width="26" height="52" rx="4" class="soft"/>' + lines([16, 26, 36, 46], 4, 44, [46, 36, 42, 30]), '<rect x="64" y="10" width="26" height="52" rx="4" class="soft"/>' + '<rect x="' + (56 - 46) + '" y="16" width="46" height="4" rx="2" class="tx"/><rect x="20" y="26" width="36" height="4" rx="2" class="tx"/><rect x="14" y="36" width="42" height="4" rx="2" class="tx"/><rect x="26" y="46" width="30" height="4" rx="2" class="tx"/>'),
      highlightTitles: pair('<rect x="12" y="12" width="50" height="7" rx="2" class="dkf"/>' + lines([26, 34, 42], 3) + '<rect x="12" y="50" width="40" height="7" rx="2" class="dkf"/>', '<rect x="8" y="8" width="58" height="15" rx="4" class="acs"/><rect x="12" y="12" width="50" height="7" rx="2" class="dkf"/>' + lines([28, 36], 3) + '<rect x="8" y="46" width="48" height="15" rx="4" class="acs"/><rect x="12" y="50" width="40" height="7" rx="2" class="dkf"/>'),
      highlightLinks: pair(lines([20, 30, 40, 50], 4, 12, [76, 50, 76, 60]) + '<rect x="66" y="30" width="22" height="4" rx="2" class="tx"/>', lines([20, 30, 40, 50], 4, 12, [76, 50, 76, 60]) + '<rect x="64" y="27" width="26" height="10" rx="3" class="acs"/><rect x="66" y="30" width="22" height="4" rx="2" class="acf"/><rect x="66" y="36" width="22" height="1.6" class="acf"/>'),
      magnifier: pair(lines([16, 24, 32, 40, 48, 56], 3), lines([16, 24, 32, 40, 48, 56], 3) + '<rect x="30" y="18" width="62" height="26" rx="6" class="lz"/><rect x="36" y="25" width="50" height="5" rx="2" class="dkf"/><rect x="36" y="34" width="34" height="5" rx="2" class="dkf"/>'),
      darkContrast: pair(lines([18, 28, 38, 48], 4, 12, [76, 60, 70, 50]), lines([18, 28, 38, 48], 4, 12, [76, 60, 70, 50], 'lt'), false, true),
      lightContrast: pair('<rect width="100" height="72" rx="9" fill="#d9cbb8"/>' + lines([18, 28, 38, 48], 4, 12, [76, 60, 70, 50], 'faint'), '<rect width="100" height="72" rx="9" fill="#fff"/>' + lines([18, 28, 38, 48], 4, 12, [76, 60, 70, 50], 'blk')),
      highContrast: pair(lines([18, 28, 38, 48], 4, 12, [76, 60, 70, 50], 'faint'), lines([18, 28, 38, 48], 5, 12, [76, 60, 70, 50], 'dkf')),
      smartContrast: pair(lines([18, 38, 48], 4, 12, [76, 70, 50]) + '<rect x="12" y="28" width="60" height="4" rx="2" class="faint"/>', lines([18, 38, 48], 4, 12, [76, 70, 50]) + '<rect x="12" y="28" width="60" height="4" rx="2" class="dkf"/><path d="M78 30l3 3 6-6" class="acl"/>'),
      invert: pair('<rect x="12" y="12" width="76" height="24" rx="4" fill="#f4c27a"/>' + lines([44, 54], 4), '<rect x="12" y="12" width="76" height="24" rx="4" fill="#f4c27a"/>' + lines([44, 54], 4, 12, 76, 'lt'), false, true),
      mono: pair(dots(['#d94b3d', '#3b9a57', '#3a6fd8', '#e7b23a']), dots(['#6b6b6b', '#8a8a8a', '#5d5d5d', '#a7a7a7'])),
      lowSat: pair(dots(['#e2412f', '#22a34a', '#2563eb', '#f2b01e']), dots(['#b97c74', '#7aa185', '#7a8fb8', '#c9b07a'])),
      highSat: pair(dots(['#b97c74', '#7aa185', '#7a8fb8', '#c9b07a']), dots(['#e2412f', '#22a34a', '#2563eb', '#f2b01e'])),
      colorBlind: pair(dots(['#a39a3c', '#9e9a42', '#4b6fb5', '#b0a35a']), dots(['#d2432f', '#1f9a8a', '#3b6fd8', '#e5ad26'])),
      keyboardNav: '<g transform="translate(4 14)">' + [['Tab', 0, 52], ['Enter', 60, 62], ['Alt', 130, 44], ['H', 180, 40]].map(function (k) { return '<rect x="' + k[1] + '" y="10" width="' + k[2] + '" height="40" rx="10" class="kc"/><text x="' + (k[1] + k[2] / 2) + '" y="35" text-anchor="middle" class="kt">' + k[0] + '</text>'; }).join('') + '<text x="174" y="35" text-anchor="middle" class="kt">+</text></g>',
      focusRing: pair('<rect x="22" y="26" width="56" height="20" rx="10" class="tx"/>', '<rect x="16" y="20" width="68" height="32" rx="16" class="acs" stroke-width="3"/><rect x="22" y="26" width="56" height="20" rx="10" class="tx"/>'),
      hoverHighlight: pair(lines([16, 26], 4) + '<rect x="12" y="38" width="44" height="16" rx="8" class="tx"/>' + arrowCursor(48, 46, .8, 'var(--text)', 'var(--bg)'), lines([16, 26], 4) + '<rect x="8" y="34" width="52" height="24" rx="10" class="acs" stroke-width="2.5"/><rect x="12" y="38" width="44" height="16" rx="8" class="tx"/>' + arrowCursor(48, 46, .8, 'var(--text)', 'var(--bg)')),
      structure: pg(70, '<rect x="12" y="10" width="40" height="7" rx="2" class="dkf"/><path d="M16 20v36M16 30h8M16 44h8M16 56h8" class="ln"/><rect x="28" y="27" width="50" height="6" rx="2" class="tx"/><rect x="28" y="41" width="40" height="6" rx="2" class="acf"/><rect x="28" y="53" width="46" height="6" rx="2" class="tx"/>'),
      cursorBlack: pair(arrowCursor(42, 22, .9, '#000', '#fff'), arrowCursor(32, 12, 2, '#000', '#fff')),
      cursorWhite: pair(arrowCursor(42, 22, .9, '#fff', '#000'), arrowCursor(32, 12, 2, '#fff', '#000'), true, true),
      vkeyboard: pg(70, '<g class="kc">' + [0, 1, 2, 3, 4, 5].map(function (i) { return '<rect x="' + (8 + i * 14.5) + '" y="16" width="12" height="11" rx="5"/><rect x="' + (12 + i * 13.5) + '" y="31" width="11" height="11" rx="5"/>'; }).join('') + '<rect x="24" y="46" width="52" height="11" rx="5"/></g>'),
      bigTargets: pair('<rect x="36" y="31" width="28" height="10" rx="5" class="acf"/>', '<rect x="20" y="22" width="60" height="28" rx="14" class="acf"/>'),
      voiceNav: pg(70, '<rect x="14" y="18" width="14" height="24" rx="7" class="acs" stroke-width="2.5"/><path d="M9 34a12 12 0 0 0 24 0M21 46v8" class="acl"/><rect x="40" y="18" width="50" height="22" rx="11" class="tx"/><rect x="48" y="26" width="34" height="5" rx="2" class="pgl"/>'),
      dictation: pg(70, '<rect x="12" y="14" width="76" height="22" rx="6" class="lz"/><rect x="18" y="22" width="30" height="5" rx="2" class="dkf"/><rect x="51" y="20" width="2" height="10" class="acf"/><rect x="40" y="44" width="12" height="20" rx="6" class="acs" stroke-width="2.4"/><path d="M34 56a12 12 0 0 0 24 0" class="acl"/>'),
      tts: pg(70, lines([16, 26, 36, 46, 56], 3, 12, [60, 52, 60, 44, 56]) + '<path d="M78 30h4l5-4v16l-5-4h-4z" class="acf"/><path d="M90 30a6 6 0 0 1 0 8" class="acl"/>'),
      readingGuide: pg(70, lines([14, 24, 34, 44, 54], 3, 12, [76, 70, 76, 64, 72]) + '<rect x="8" y="39" width="84" height="3.5" rx="1.75" class="acf"/><path d="M50 35l3.5 4h-7z" class="acf"/>'),
      readingMask: pg(70, lines([14, 24, 34, 44, 54], 3, 12, [76, 70, 76, 64, 72]) + '<path d="M0 9a9 9 0 0 1 9-9h82a9 9 0 0 1 9 9v21H0zM0 44h100v19a9 9 0 0 1-9 9H9a9 9 0 0 1-9-9z" fill="rgba(0,0,0,.6)"/>'),
      stopAnimations: pair('<rect x="30" y="20" width="40" height="32" rx="6" class="tx"/><path d="M14 36h10M76 36h10M18 28l6 4M18 44l6-4M82 28l-6 4M82 44l-6-4" class="acl"/>', '<rect x="30" y="20" width="40" height="32" rx="6" class="tx"/><circle cx="50" cy="36" r="11" class="pgf"/><path d="M46.5 31v10M53.5 31v10" class="acl"/>'),
      hideImages: pair('<rect x="12" y="10" width="76" height="30" rx="4" fill="#9cc3a4"/><path d="M12 36l20-14 16 10 14-8 26 12" fill="#5d8f6a"/>' + lines([48, 58], 4), '<rect x="12" y="10" width="76" height="30" rx="4" class="dash"/><rect x="20" y="22" width="56" height="6" rx="3" class="tx"/>' + lines([48, 58], 4)),
      tooltips: pg(70, '<rect x="30" y="44" width="40" height="16" rx="8" class="tx"/><rect x="12" y="10" width="76" height="22" rx="8" class="bub"/><path d="M45 32l5 6 5-6z" class="bubf"/><rect x="20" y="18" width="52" height="5" rx="2" class="lt"/>'),
      dictionary: pg(70, lines([16, 26, 36], 3, 12, [76, 70, 60]) + '<rect x="30" y="25" width="22" height="6" rx="2" class="acsel"/><rect x="18" y="40" width="70" height="24" rx="6" class="lz"/><rect x="24" y="46" width="30" height="4" rx="2" class="dkf"/><rect x="24" y="54" width="54" height="3" rx="1.5" class="tx"/>'),
      position: pg(70, '<rect x="8" y="8" width="84" height="56" rx="6" class="dash"/>' + [[14, 14], [50, 14], [86, 14], [14, 36], [86, 36], [14, 58], [50, 58]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3" class="tx"/>'; }).join('') + '<circle cx="86" cy="58" r="6" class="acf"/>')
    };
  })();

  function guideLines(text) { return String(text || '').split('\n').map(function (l) { return l.trim(); }).filter(Boolean); }
  function guideHTML(text) {
    var out = '', list = null;
    var close = function () { if (list) { out += '</' + list + '>'; list = null; } };
    guideLines(text).forEach(function (l, i) {
      var m;
      if (l.charAt(0) === '@') { close(); if (ILL[l.slice(1)]) out += '<figure class="ill" aria-hidden="true"><svg viewBox="0 0 240 88" focusable="false">' + ILL[l.slice(1)] + '</svg></figure>'; return; }
      if ((m = /^##\s*(.*)$/.exec(l))) { close(); out += '<h3 class="gh" data-l="' + i + '">' + esc(m[1]) + '</h3>'; return; }
      if ((m = /^-\s+(.*)$/.exec(l))) { if (list !== 'ul') { close(); out += '<ul class="gl">'; list = 'ul'; } out += '<li data-l="' + i + '">' + esc(m[1]) + '</li>'; return; }
      if ((m = /^\d+\.\s+(.*)$/.exec(l))) { if (list !== 'ol') { close(); out += '<ol class="gs">'; list = 'ol'; } out += '<li data-l="' + i + '">' + esc(m[1]) + '</li>'; return; }
      close(); out += '<p data-l="' + i + '">' + esc(l) + '</p>';
    });
    close();
    return out;
  }
  // The words of a guide (without markers), so they can be translated and put back in place
  function guideWords(text) { return guideLines(text).map(function (l) { return l.charAt(0) === '@' ? '' : l.replace(/^##\s*|^-\s+|^\d+\.\s+/, ''); }); }

  var TABS = [
    { id: 'profiles', label: 'Profiles' },
    { id: 'text', label: 'Text' },
    { id: 'color', label: 'Color' },
    { id: 'nav', label: 'Navigate' },
    { id: 'reading', label: 'Reading' },
    { id: 'tools', label: 'Tools' }
  ];

  var DEFAULTS = {
    profiles: [],
    contentScale: 1, fontSize: 1, font: '', lineHeight: 0, letterSpacing: 0, wordSpacing: 0, fontWeight: 0, textAlign: '',
    textDir: '', highlightTitles: false, highlightLinks: false, magnifier: false, smartContrast: false, hoverHighlight: false, tooltips: false,
    contrast: '', invert: false, saturation: '', colorBlind: '', textColor: '', titleColor: '', bgColor: '', brightness: 100,
    keyboardNav: false, focusRing: false, cursor: '', vkeyboard: false, voiceNav: false, dictation: false, bigTargets: false, extendedTime: false,
    tts: false, ttsRate: 1, ttsPitch: 1, ttsVoice: '', ttsLang: '', readingGuide: false, readingMask: false, stopAnimations: false,
    hideImages: false, mute: false, dictionary: false, sign: '', translateTo: '', spokenTips: true,
    ariaFix: true, altText: true, formFix: true, oversized: true, remember: true, position: ''
  };
  // Settings that are about the page view, used for the "something is active" dot on the button
  var VISUAL_KEYS = Object.keys(DEFAULTS).filter(function (k) {
    return ['profiles', 'ariaFix', 'altText', 'formFix', 'remember', 'position', 'ttsRate', 'ttsPitch', 'ttsVoice', 'oversized', 'spokenTips'].indexOf(k) < 0;
  });

  /* ------------------------------------------------------------------ *
   * 6. Storage (localStorage → cookie → memory), session when "remember" is off
   * ------------------------------------------------------------------ */
  var KEY = 'accessibles.v1';
  var Store = {
    read: function () {
      var raw = null;
      try { raw = window.localStorage.getItem(KEY); } catch (e) { /* blocked */ }
      if (!raw) { try { raw = window.sessionStorage.getItem(KEY); } catch (e) { /* blocked */ } }
      if (!raw) {
        try { var m = document.cookie.match(/(?:^|;\s*)accessibles=([^;]*)/); if (m) raw = decodeURIComponent(m[1]); } catch (e) { /* blocked */ }
      }
      try { return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
    },
    write: function (data, persistent) {
      var s = JSON.stringify(data);
      var primary = persistent ? 'localStorage' : 'sessionStorage';
      var other = persistent ? 'sessionStorage' : 'localStorage';
      try { window[other].removeItem(KEY); } catch (e) { /* ignore */ }
      try { window[primary].setItem(KEY, s); return; } catch (e) { /* fall through */ }
      try {
        document.cookie = 'accessibles=' + encodeURIComponent(s) + ';path=/;SameSite=Lax' + (persistent ? ';max-age=31536000' : '');
      } catch (e) { /* ignore */ }
    }
  };

  var S = JSON.parse(JSON.stringify(DEFAULTS));
  var dragPos = null;   // {x,y} launcher center as fraction of viewport
  var usage = {};
  (function load() {
    var d = Store.read();
    if (!d) return;
    if (d.s && typeof d.s === 'object') {
      Object.keys(DEFAULTS).forEach(function (k) {
        if (d.s[k] !== undefined && typeof d.s[k] === typeof DEFAULTS[k]) S[k] = d.s[k];
      });
    }
    if (d.pos && isFinite(d.pos.x) && isFinite(d.pos.y)) dragPos = { x: clamp(d.pos.x, 0, 1), y: clamp(d.pos.y, 0, 1) };
    if (d.u && typeof d.u === 'object') usage = d.u;
  })();
  // Voice input only comes back on a new page when the microphone is already allowed (checked at start-up)
  var voiceWas = S.voiceNav ? 'voiceNav' : S.dictation ? 'dictation' : '';
  S.voiceNav = false; S.dictation = false;

  function save() {
    var data = { s: S, pos: dragPos, u: usage, v: VERSION };
    if (!S.remember) data.s = { remember: false };
    Store.write(data, S.remember);
    if (!S.remember) {
      try { window.sessionStorage.setItem(KEY + '.session', JSON.stringify({ s: S })); } catch (e) { /* ignore */ }
    }
  }
  if (!S.remember) {
    try { var sess = JSON.parse(window.sessionStorage.getItem(KEY + '.session') || 'null'); if (sess && sess.s) Object.keys(DEFAULTS).forEach(function (k) { if (sess.s[k] !== undefined) S[k] = sess.s[k]; }); } catch (e) { /* ignore */ }
    voiceWas = S.voiceNav ? 'voiceNav' : S.dictation ? 'dictation' : voiceWas;
    S.voiceNav = false; S.dictation = false;
  }

  /* ------------------------------------------------------------------ *
   * 7. Page stylesheet — every visual adjustment is one generated sheet
   * ------------------------------------------------------------------ */
  var PAL;
  var useTopLayer = typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function';
  var canAdopt = 'adoptedStyleSheets' in Document.prototype && typeof CSSStyleSheet === 'function' && 'replaceSync' in CSSStyleSheet.prototype;
  var pageSheet = null, pageStyleEl = null;

  function setPageCSS(css) {
    if (canAdopt) {
      try {
        if (!pageSheet) {
          pageSheet = new CSSStyleSheet();
          document.adoptedStyleSheets = Array.prototype.slice.call(document.adoptedStyleSheets).concat([pageSheet]);
        } else if (Array.prototype.indexOf.call(document.adoptedStyleSheets, pageSheet) < 0) {
          document.adoptedStyleSheets = Array.prototype.slice.call(document.adoptedStyleSheets).concat([pageSheet]);
        }
        pageSheet.replaceSync(css);
        return;
      } catch (e) { canAdopt = false; }
    }
    if (!pageStyleEl) {
      pageStyleEl = document.createElement('style');
      pageStyleEl.id = 'accessibles-page-style';
    }
    if (!pageStyleEl.isConnected) (document.head || document.documentElement).appendChild(pageStyleEl);
    pageStyleEl.textContent = css;
  }

  var NOT_ICON = ':not(i):not([class*="icon"]):not([class*="Icon"]):not([class^="fa"]):not([class*=" fa"]):not([class*="material-"]):not([class*="glyph"]):not([class*="symbol"]):not(code):not(pre):not(kbd):not(samp):not(svg):not(svg *)';
  var NOT_MEDIA = ':not(img):not(video):not(picture):not(canvas):not(iframe):not(svg):not(svg *):not(object):not(embed)';
  var HEADINGS = 'h1,h2,h3,h4,h5,h6,[role="heading"]';
  // Fonts the visitor can apply to the website. g = Google Fonts, s = installed on most systems.
  var FONT_LIST = (function () {
    var out = [
      { id: '', name: 'Original font', note: 'As designed' },
      { id: 'readable', name: 'Easy to read', note: 'Atkinson Hyperlegible', fam: 'Atkinson Hyperlegible', g: 'Atkinson Hyperlegible', stack: '"Atkinson Hyperlegible", Verdana, Tahoma, "Segoe UI", Arial, sans-serif' },
      { id: 'dyslexic', name: 'Dyslexia friendly', note: 'OpenDyslexic or Lexend', fam: 'Lexend', g: 'Lexend', stack: '"OpenDyslexic", "Lexend", Verdana, Tahoma, "Trebuchet MS", sans-serif' }
    ];
    var G = { sans: 'Inter,Roboto,Open Sans,Lato,Montserrat,Poppins,Nunito,Figtree,Source Sans 3,Noto Sans,PT Sans,Work Sans,IBM Plex Sans,DM Sans,Manrope,Raleway,Rubik,Karla,Mulish,Quicksand,Ubuntu,Fira Sans,Cabin,Arimo,Space Grotesk,Josefin Sans,Sora,Outfit,Plus Jakarta Sans,Public Sans,Red Hat Display,Barlow,Hind,Titillium Web,Archivo,Libre Franklin,Varela Round,Overpass,Asap,Heebo,Assistant,Kanit,Mukta,Lexend Deca,Andika,Comic Neue,Atkinson Hyperlegible,Lexend',
      serif: 'Merriweather,Lora,Playfair Display,PT Serif,Libre Baskerville,Source Serif 4,Noto Serif,IBM Plex Serif,Crimson Pro,EB Garamond,Cormorant Garamond,Roboto Slab,Bitter,Zilla Slab,Tinos,DM Serif Display',
      monospace: 'JetBrains Mono,Roboto Mono,IBM Plex Mono,Inconsolata,Space Mono' };
    var seen = {};
    Object.keys(G).forEach(function (cat) {
      G[cat].split(',').forEach(function (n) { if (seen[n]) return; seen[n] = 1; out.push({ id: n, name: n, note: cat === 'sans' ? 'Sans serif' : cat === 'serif' ? 'Serif' : 'Monospace', fam: n, g: n, stack: '"' + n + '", ' + (cat === 'sans' ? 'sans-serif' : cat) }); });
    });
    [['Arial', 'sans-serif'], ['Verdana', 'sans-serif'], ['Tahoma', 'sans-serif'], ['Trebuchet MS', 'sans-serif'], ['Segoe UI', 'sans-serif'], ['Helvetica', 'sans-serif'], ['Georgia', 'serif'], ['Times New Roman', 'serif'], ['Palatino Linotype', 'serif'], ['Courier New', 'monospace'], ['Comic Sans MS', 'cursive']].forEach(function (f) {
      out.push({ id: f[0], name: f[0], note: 'System font', fam: f[0], stack: '"' + f[0] + '", ' + f[1] });
    });
    return out;
  })();
  function fontInfo(id) { for (var i = 0; i < FONT_LIST.length; i++) if (FONT_LIST[i].id === id) return FONT_LIST[i]; return id ? { id: id, name: id, fam: id, stack: '"' + id + '", sans-serif' } : FONT_LIST[0]; }
  function fontName(id) { var f = fontInfo(id); return id ? f.name : 'Original'; }

  function svgCursor(fill, stroke, kind) {
    var path = kind === 'hand'
      ? 'M18 4.5c1.9 0 3.4 1.5 3.4 3.4v11.2l1.2-.3c1.8-.4 3.5.7 3.8 2.5l.1.6 1.1-.2c1.8-.3 3.5.9 3.7 2.7l.1.5.8-.1c1.9-.2 3.5 1.2 3.6 3.1l.2 4.4c.3 5-3.6 9.2-8.6 9.2h-5.8c-3 0-5.7-1.6-7.2-4.2l-5.3-9c-1-1.7-.4-3.8 1.3-4.7 1.5-.8 3.4-.3 4.3 1.1l.9 1.4V7.9c0-1.9 1.5-3.4 3.4-3.4z'
      : 'M6 3.5v34.5l9.2-9 5.8 13.8 6.4-2.7-5.8-13.6h12.9z';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="' + path + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2.4" stroke-linejoin="round"/></svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '") ' + (kind === 'hand' ? '17 5' : '6 4');
  }

  function filterValue() {
    var f = [];
    if (S.invert) f.push('invert(1) hue-rotate(180deg)');
    if (S.contrast === 'high') f.push('contrast(1.35)');
    if (S.saturation === 'mono') f.push('grayscale(1)');
    else if (S.saturation === 'low') f.push('saturate(0.45)');
    else if (S.saturation === 'high') f.push('saturate(1.8)');
    if (S.brightness !== 100) f.push('brightness(' + (S.brightness / 100) + ')');
    if (S.colorBlind) f.push('url(#acc-cb-' + S.colorBlind + ')');
    return f.join(' ');
  }

  function buildPageCSS() {
    var A = hex(PAL.accentLight), INK = hex(contrast(PAL.accentLight, [255, 255, 255]) >= 4.5 ? [255, 255, 255] : [16, 19, 22]);
    var c = [];
    var B = 'body';
    // Always present: helpers used by the widget's own features
    c.push('.acc-sr-only{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;white-space:nowrap!important;border:0!important}');
    c.push('a.acc-skip{position:fixed!important;left:12px!important;top:-200px!important;z-index:2147483646!important;padding:12px 18px!important;background:' + A + '!important;color:' + INK + '!important;font:600 16px/1.2 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif!important;border-radius:10px!important;text-decoration:none!important;box-shadow:0 6px 20px rgba(0,0,0,.2)!important}');
    c.push('a.acc-skip:focus{top:12px!important;outline:3px solid ' + INK + '!important;outline-offset:2px!important}');
    c.push('.acc-reading{outline:3px solid ' + A + '!important;outline-offset:4px!important;border-radius:3px;scroll-margin:30vh}');
    c.push('.acc-target{outline:3px solid ' + A + '!important;outline-offset:4px!important;transition:outline-color .3s}');
    c.push('.acc-mark{outline:3px dashed #c62828!important;outline-offset:2px!important}');
    c.push('[data-acc-signable]{outline:2px dotted ' + A + '!important;outline-offset:3px!important;cursor:help!important}');
    if (Translate.engine === 'google') c.push('.goog-te-banner-frame,.skiptranslate>iframe,#goog-gt-tt,.goog-te-balloon-frame{display:none!important}body{top:0!important}.goog-text-highlight{background:none!important;box-shadow:none!important}');

    // Filters (invert / saturation / brightness / color blindness / high contrast)
    var fv = filterValue();
    if (fv) {
      c.push((useTopLayer ? 'html' : B) + '{filter:' + fv + '!important;-webkit-filter:' + fv + '!important}');
      if (S.invert) c.push(B + ' :is(img,video,picture,canvas,iframe,embed,object){filter:invert(1) hue-rotate(180deg)!important}');
    }

    // Content scaling (zoom keeps layout proportional; widget lives outside <body>)
    if (S.contentScale !== 1) {
      if ('zoom' in document.documentElement.style) c.push(B + '{zoom:' + S.contentScale + '!important}');
      else c.push(B + '{transform:scale(' + S.contentScale + ')!important;transform-origin:0 0!important;width:' + (100 / S.contentScale) + '%!important}');
    }

    if (S.font) c.push(B + NOT_ICON + ',' + B + ' *' + NOT_ICON + '{font-family:' + fontInfo(S.font).stack + '!important}');
    if (S.fontWeight) {
      c.push(B + ' *' + NOT_ICON + '{font-weight:' + S.fontWeight + '!important}');
      c.push(B + ' :is(' + HEADINGS + ',b,strong,th){font-weight:800!important}');
    }
    if (S.lineHeight) c.push(B + ',' + B + ' *:not(svg *){line-height:' + S.lineHeight + '!important}');
    if (S.letterSpacing) c.push(B + ',' + B + ' *:not(svg *){letter-spacing:' + S.letterSpacing + 'em!important}');
    if (S.wordSpacing) c.push(B + ',' + B + ' *:not(svg *){word-spacing:' + S.wordSpacing + 'em!important}');
    var pd = pageDir();
    if (pd) {
      c.push(B + ',' + B + ' *:not(svg):not(svg *):not(code):not(pre):not(kbd):not(samp):not(input[type="email"]):not(input[type="url"]):not(input[type="tel"]){direction:' + pd + '!important}');
      c.push(B + ' :is(code,pre,kbd,samp){direction:ltr!important;text-align:left!important}');
    }
    if (S.textAlign) c.push(B + ',' + B + ' *:not(svg *){text-align:' + S.textAlign + '!important}');
    if (S.highlightTitles) c.push(B + ' :is(' + HEADINGS + '){outline:2px solid ' + A + '!important;outline-offset:4px!important;border-radius:2px}');
    if (S.highlightLinks) c.push(B + ' :is(a[href],[role="link"]){text-decoration:underline!important;text-decoration-thickness:2px!important;text-underline-offset:3px!important;outline:2px dashed ' + A + '!important;outline-offset:2px!important}');

    // Contrast themes
    if (S.contrast === 'dark') {
      c.push(B + ',' + B + ' *' + NOT_MEDIA + '{background-color:#121417!important;color:#eef0f2!important;border-color:#3d434a!important;text-shadow:none!important}');
      c.push(B + ' :is(' + HEADINGS + '),' + B + ' :is(' + HEADINGS + ') *{color:#ffffff!important}');
      c.push(B + ' :is(a[href],a[href] *){color:#8fc9ff!important}');
      c.push(B + ' :is(input,textarea,select,button){background-color:#1c2025!important;border-color:#7a838c!important}');
      c.push(B + ' ::placeholder{color:#a6adb4!important}');
    } else if (S.contrast === 'light') {
      c.push(B + ',' + B + ' *' + NOT_MEDIA + '{background-color:#ffffff!important;color:#141414!important;border-color:#6b6b6b!important;text-shadow:none!important}');
      c.push(B + ' :is(' + HEADINGS + '),' + B + ' :is(' + HEADINGS + ') *{color:#000000!important}');
      c.push(B + ' :is(a[href],a[href] *){color:#0645ad!important}');
      c.push(B + ' :is(input,textarea,select,button){background-color:#ffffff!important;border-color:#444!important}');
    }
    // Custom colors
    if (S.bgColor) c.push(B + ',' + B + ' *' + NOT_MEDIA + '{background-color:' + S.bgColor + '!important}');
    if (S.textColor) c.push(B + ',' + B + ' *' + NOT_MEDIA + '{color:' + S.textColor + '!important}');
    if (S.titleColor) c.push(B + ' :is(' + HEADINGS + '),' + B + ' :is(' + HEADINGS + ') *{color:' + S.titleColor + '!important}');

    // Cursor
    if (S.cursor) {
      var fill = S.cursor === 'black' ? '#000' : '#fff', stroke = S.cursor === 'black' ? '#fff' : '#000';
      c.push(B + ',' + B + ' *{cursor:' + svgCursor(fill, stroke, 'arrow') + ',auto!important}');
      c.push(B + ' :is(a[href],a[href] *,button,button *,[role="button"],[role="link"],label,select,summary,[onclick],input[type="submit"],input[type="button"],input[type="checkbox"],input[type="radio"]){cursor:' + svgCursor(fill, stroke, 'hand') + ',pointer!important}');
    }

    // Focus
    if (S.focusRing || S.keyboardNav) {
      c.push(B + ' *:focus{outline:3px solid ' + A + '!important;outline-offset:2px!important;box-shadow:0 0 0 6px rgba(255,255,255,.9)!important}');
    }
    // Bigger targets
    if (S.bigTargets) {
      c.push(B + ' :is(button,[role="button"],input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]),select,summary){min-height:44px!important;min-width:44px!important}');
      c.push(B + ' input:is([type="checkbox"],[type="radio"]){width:22px!important;height:22px!important;margin:6px!important}');
      c.push(B + ' a[href]{padding-top:.25em!important;padding-bottom:.25em!important}');
    }
    // Motion
    if (S.stopAnimations) {
      c.push('html,' + B + ',' + B + ' *,' + B + ' *::before,' + B + ' *::after{animation-duration:.001ms!important;animation-delay:0s!important;animation-iteration-count:1!important;transition-duration:.001ms!important;transition-delay:0s!important;scroll-behavior:auto!important}');
    }
    if (S.hideImages) {
      c.push(B + ' :is(img,picture,video,[role="img"]:not(svg),input[type="image"],object,embed){display:none!important}');
      c.push('.acc-imgalt{display:inline-flex!important;align-items:center!important;gap:.4em!important;max-width:100%!important;padding:.3em .65em!important;margin:.15em 0!important;border:1px dashed currentColor!important;border-radius:999px!important;font:500 .85em/1.35 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif!important;opacity:.85!important;vertical-align:middle!important}');
      c.push(B + ' *:not(svg *){background-image:none!important}');
    }
    if (Sign.libras && S.sign !== 'libras') c.push('[vw]{display:none!important}');
    return c.join('\n');
  }

  // Color-vision correction (daltonization) matrices, computed once
  function buildColorBlindSVG() {
    var SIM = {
      protanopia: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
      deuteranopia: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
      tritanopia: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]]
    };
    var SHIFT_RG = [[0, 0, 0], [0.7, 1, 0], [0.7, 0, 1]];
    var SHIFT_B = [[1, 0, 0.7], [0, 1, 0.7], [0, 0, 0]];
    function mul(a, b) {
      return a.map(function (row) { return [0, 1, 2].map(function (j) { return row[0] * b[0][j] + row[1] * b[1][j] + row[2] * b[2][j]; }); });
    }
    var out = '';
    Object.keys(SIM).forEach(function (k) {
      var s = SIM[k];
      var err = [0, 1, 2].map(function (i) { return [0, 1, 2].map(function (j) { return (i === j ? 1 : 0) - s[i][j]; }); });
      var corr = mul(k === 'tritanopia' ? SHIFT_B : SHIFT_RG, err);
      var m = [0, 1, 2].map(function (i) { return [0, 1, 2].map(function (j) { return (i === j ? 1 : 0) + corr[i][j]; }); });
      var vals = m.map(function (r) { return r.map(function (v) { return v.toFixed(4); }).join(' ') + ' 0 0'; }).join(' ') + ' 0 0 0 1 0';
      out += '<filter id="acc-cb-' + k + '"><feColorMatrix type="matrix" values="' + vals + '"/></filter>';
    });
    var wrap = document.createElement('div');
    wrap.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" id="accessibles-filters"><defs>' + out + '</defs></svg>';
    var svg = wrap.firstChild;
    svg.style.cssText = 'position:absolute!important;width:0!important;height:0!important;overflow:hidden!important;pointer-events:none!important';
    return svg;
  }

  /* ------------------------------------------------------------------ *
   * 8. Text scaling — works on px, em, rem and inline font sizes alike
   * ------------------------------------------------------------------ */
  var FontScale = {
    factor: 1, lhMode: false, map: new WeakMap(), list: [],
    sync: function () {
      var f = S.fontSize, lh = !!S.lineHeight;
      if (f === this.factor && lh === this.lhMode) return;
      this.restore();
      this.factor = f; this.lhMode = lh;
      if (f !== 1 && document.body) return this.applyAsync(document.body);
    },
    applyAsync: function (root) {
      var self = this, all = this.collect(root), total = all.length, i = 0, size = 600, run = ++this.run;
      if (total <= size * 2) { this.applyList(all); return null; }
      return new Promise(function (resolve) {
        (function next() {
          if (run !== self.run) { resolve(); return; }
          self.applyList(all.slice(i, i + size));
          i += size;
          UI.progress(Math.min(1, i / total));
          if (i < total) later(next, 0); else resolve();
        })();
      });
    },
    hasText: function (el) {
      if (/^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(el.tagName)) return true;
      for (var n = el.firstChild; n; n = n.nextSibling) {
        if (n.nodeType === 3 && /\S/.test(n.nodeValue)) return true;
      }
      return false;
    },
    collect: function (root) {
      var out = [];
      if (!root || root.nodeType !== 1 || isOurs(root)) return out;
      if (this.hasText(root)) out.push(root);
      var w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
        acceptNode: function (n) {
          if (SKIP_TAGS[n.tagName] || n.namespaceURI === 'http://www.w3.org/2000/svg' || isOurs(n)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      var n;
      while ((n = w.nextNode())) { if (this.hasText(n)) out.push(n); }
      return out;
    },
    run: 0,
    apply: function (root) { if (this.factor !== 1) this.applyList(this.collect(root)); },
    applyList: function (list) {
      if (this.factor === 1) return;
      var self = this, f = this.factor;
      var targets = list.filter(function (el) { return !self.map.has(el); });
      // Measure everything first, then write, so we never read a value we already scaled
      var measured = targets.map(function (el) {
        var cs = getComputedStyle(el);
        var size = parseFloat(cs.fontSize) || 16;
        var lh = /px$/.test(cs.lineHeight) ? parseFloat(cs.lineHeight) : 0;
        // New content inside an already scaled element inherits the scaled size; undo that once
        var anc = el.parentElement, pr = null;
        while (anc && !pr) { pr = self.map.get(anc) || null; anc = anc.parentElement; }
        if (pr && Math.abs(size - pr.size * f) < 0.05) { size = pr.size; if (lh) lh = lh / f; }
        return { el: el, size: size, lh: lh };
      });
      measured.forEach(function (m) {
        var st = m.el.style;
        var rec = { had: m.el.hasAttribute('style'), size: m.size, fs: st.getPropertyValue('font-size'), fsp: st.getPropertyPriority('font-size'), lh: st.getPropertyValue('line-height'), lhp: st.getPropertyPriority('line-height'), setLh: false };
        st.setProperty('font-size', (m.size * f).toFixed(2) + 'px', 'important');
        if (!self.lhMode && m.lh) { st.setProperty('line-height', (m.lh * f).toFixed(2) + 'px', 'important'); rec.setLh = true; }
        self.map.set(m.el, rec);
        self.list.push(m.el);
      });
    },
    restore: function () {
      var self = this;
      this.run++;
      this.list.forEach(function (el) {
        var r = self.map.get(el);
        if (!r) return;
        if (r.fs) el.style.setProperty('font-size', r.fs, r.fsp); else el.style.removeProperty('font-size');
        if (r.setLh) { if (r.lh) el.style.setProperty('line-height', r.lh, r.lhp); else el.style.removeProperty('line-height'); }
        if (!r.had && !el.getAttribute('style')) el.removeAttribute('style');
        self.map.delete(el);
      });
      this.list = [];
    }
  };

  /* ------------------------------------------------------------------ *
   * 9. Change recorder — every DOM fix can be undone exactly
   * ------------------------------------------------------------------ */
  function Recorder() { this.recs = []; this.nodes = []; }
  Recorder.prototype.set = function (el, attr, val) {
    this.recs.push([el, attr, el.getAttribute(attr)]);
    el.setAttribute(attr, val);
  };
  Recorder.prototype.add = function (node) { this.nodes.push(node); return node; };
  Recorder.prototype.revert = function () {
    for (var i = this.recs.length - 1; i >= 0; i--) {
      var r = this.recs[i];
      if (r[2] === null) r[0].removeAttribute(r[1]); else r[0].setAttribute(r[1], r[2]);
    }
    this.nodes.forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); });
    this.recs = []; this.nodes = [];
  };
  function markFixed(rec, el, kind) {
    var cur = el.getAttribute('data-acc-fixed') || '';
    if ((' ' + cur + ' ').indexOf(' ' + kind + ' ') < 0) rec.set(el, 'data-acc-fixed', (cur + ' ' + kind).trim());
  }

  function accName(el) {
    if (!el) return '';
    var v = el.getAttribute('aria-label');
    if (v && v.trim()) return v.trim();
    var lb = el.getAttribute('aria-labelledby');
    if (lb) {
      var t = lb.split(/\s+/).map(function (id) { var n = document.getElementById(id); return n ? textOf(n) : ''; }).join(' ').trim();
      if (t) return t;
    }
    if (el.labels && el.labels.length) {
      var lt = Array.prototype.map.call(el.labels, textOf).join(' ').trim();
      if (lt) return lt;
    }
    if (el.tagName === 'IMG' || (el.tagName === 'INPUT' && el.type === 'image')) return (el.getAttribute('alt') || '').trim();
    var txt = textOf(el);
    if (txt) return txt;
    var imgs = el.querySelectorAll ? el.querySelectorAll('img[alt],svg title,[aria-label]') : [];
    for (var i = 0; i < imgs.length; i++) {
      var a = imgs[i].tagName === 'title' ? imgs[i].textContent : (imgs[i].getAttribute('alt') || imgs[i].getAttribute('aria-label'));
      if (a && a.trim()) return a.trim();
    }
    if (el.getAttribute('title')) return el.getAttribute('title').trim();
    if (el.tagName === 'INPUT' && /^(submit|reset|button)$/i.test(el.type)) return el.value || '';
    return '';
  }

  var ICON_WORDS = [
    [/close|times|dismiss|(^|[-_ ])x($|[-_ ])/, 'Close'], [/hamburger|menu|bars|navicon/, 'Menu'], [/search|magnif|loupe/, 'Search'],
    [/cart|basket|bag|shop/, 'Shopping cart'], [/user|account|profile|person|avatar/, 'Account'], [/home|house/, 'Home'],
    [/facebook/, 'Facebook'], [/twitter/, 'Twitter'], [/instagram/, 'Instagram'], [/linkedin/, 'LinkedIn'], [/youtube/, 'YouTube'],
    [/whatsapp/, 'WhatsApp'], [/tiktok/, 'TikTok'], [/github/, 'GitHub'], [/telegram/, 'Telegram'],
    [/arrow[-_ ]?left|prev|chevron[-_ ]?left|angle[-_ ]?left|back/, 'Previous'], [/arrow[-_ ]?right|next|chevron[-_ ]?right|angle[-_ ]?right|forward/, 'Next'],
    [/arrow[-_ ]?up|to[-_ ]?top|chevron[-_ ]?up/, 'Back to top'], [/caret|chevron[-_ ]?down|angle[-_ ]?down|dropdown|expand/, 'Expand'],
    [/play/, 'Play'], [/pause/, 'Pause'], [/download/, 'Download'], [/upload/, 'Upload'], [/share/, 'Share'], [/heart|like|favou?rite|star/, 'Favorite'],
    [/mail|envelope|email/, 'Email'], [/phone|call/, 'Phone'], [/plus|add/, 'Add'], [/minus|remove/, 'Remove'], [/edit|pencil|pen/, 'Edit'],
    [/trash|delete|bin/, 'Delete'], [/settings|gear|cog/, 'Settings'], [/bell|notif/, 'Notifications'], [/globe|language|lang/, 'Language'],
    [/filter/, 'Filter'], [/sort/, 'Sort'], [/info/, 'Information'], [/help|question/, 'Help'], [/calendar|date/, 'Calendar'],
    [/location|map|marker|pin/, 'Location'], [/print/, 'Print'], [/login|sign[-_ ]?in/, 'Sign in'], [/logout|sign[-_ ]?out/, 'Sign out']
  ];
  function guessName(el) {
    var bits = [el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className, el.id, el.getAttribute('data-icon'), el.getAttribute('name')];
    var kids = el.querySelectorAll('i,span,svg,use,img');
    for (var i = 0; i < kids.length && i < 6; i++) {
      var k = kids[i];
      bits.push(typeof k.className === 'string' ? k.className : (k.className && k.className.baseVal));
      bits.push(k.getAttribute('href') || k.getAttribute('xlink:href') || k.getAttribute('src') || '');
    }
    if (el.tagName === 'A' && el.hostname && el.hostname !== location.hostname) bits.push(el.hostname);
    var s = bits.filter(Boolean).join(' ').toLowerCase();
    for (var j = 0; j < ICON_WORDS.length; j++) if (ICON_WORDS[j][0].test(s)) return ICON_WORDS[j][1];
    if (el.tagName === 'A' && el.hostname && el.hostname !== location.hostname) return humanize(el.hostname.replace(/^www\./, '').split('.')[0]);
    if (el.tagName === 'A' && el.getAttribute('href')) {
      var p = (el.pathname || '').split('/').filter(Boolean).pop();
      if (p) return humanize(p);
      return 'Home';
    }
    return '';
  }

  /* ------------------------------------------------------------------ *
   * 10. ARIA, image description and form fixes (automatic, reversible)
   * ------------------------------------------------------------------ */
  var Aria = {
    on: false, rec: new Recorder(), descNewTab: null,
    sync: function () { if (S.ariaFix && !this.on) { this.on = true; this.fix(document.body); } else if (!S.ariaFix && this.on) { this.on = false; this.rec.revert(); this.descNewTab = null; if (Keyboard.on) Keyboard.fix(document.body); } },
    fix: function (root) {
      if (!this.on || !root || root.nodeType !== 1) return;
      var rec = this.rec, self = this;
      var q = function (sel) { var a = Array.prototype.slice.call(root.querySelectorAll(sel)); if (root.matches && root.matches(sel)) a.unshift(root); return a.filter(function (n) { return !isOurs(n); }); };
      // Landmarks
      if (root === document.body) {
        var LM_SKIP = 'article,aside,main,nav,section,[role]';
        var header = Array.prototype.filter.call(document.querySelectorAll('header'), function (h) { return !h.parentElement.closest(LM_SKIP); })[0];
        if (header && !header.getAttribute('role') && !document.querySelector('[role="banner"]')) { rec.set(header, 'role', 'banner'); markFixed(rec, header, 'aria'); }
        var footer = Array.prototype.filter.call(document.querySelectorAll('footer'), function (h) { return !h.parentElement.closest(LM_SKIP); })[0];
        if (footer && !footer.getAttribute('role') && !document.querySelector('[role="contentinfo"]')) { rec.set(footer, 'role', 'contentinfo'); markFixed(rec, footer, 'aria'); }
        if (!document.querySelector('main,[role="main"]')) {
          var m = findMain(true);
          if (m && m !== document.body) { rec.set(m, 'role', 'main'); markFixed(rec, m, 'aria'); }
        }
        var navs = document.querySelectorAll('nav,[role="navigation"]');
        if (navs.length > 1) Array.prototype.forEach.call(navs, function (n, i) {
          if (!accNameAttr(n)) { var h = n.querySelector('h1,h2,h3,h4,h5,h6'); rec.set(n, 'aria-label', h ? textOf(h) : 'Navigation ' + (i + 1)); markFixed(rec, n, 'aria'); }
        });
        if (CFG.lang && !document.documentElement.getAttribute('lang')) rec.set(document.documentElement, 'lang', CFG.lang);
      }
      // Clickable non-interactive elements → buttons
      q('[onclick]:not(a[href]):not(button):not(input):not(select):not(textarea):not(summary):not(label):not(body):not(html), a:not([href])[onclick]').forEach(function (el) {
        if (el.querySelector('a[href],button,input,select,textarea,[role="button"]')) return;
        if (!el.getAttribute('role')) { rec.set(el, 'role', 'button'); markFixed(rec, el, 'aria'); }
        if (!el.hasAttribute('tabindex')) rec.set(el, 'tabindex', '0');
      });
      // Buttons and links without a name
      q('a[href],button,[role="button"],[role="link"],input[type="button"],input[type="submit"]').forEach(function (el) {
        if (accName(el)) return;
        var n = guessName(el) || (el.tagName === 'BUTTON' || el.getAttribute('role') === 'button' ? 'Button' : 'Link');
        rec.set(el, 'aria-label', n); markFixed(rec, el, 'aria');
      });
      // Decorative SVGs inside named controls
      q('a svg:not([aria-hidden]):not([role]), button svg:not([aria-hidden]):not([role])').forEach(function (svg) {
        if (!svg.querySelector('title')) { rec.set(svg, 'aria-hidden', 'true'); rec.set(svg, 'focusable', 'false'); }
      });
      // Frames
      q('iframe:not([title]):not([aria-label])').forEach(function (fr) {
        var src = fr.getAttribute('src') || '', host2 = '';
        try { host2 = new URL(src, location.href).hostname.replace(/^www\./, ''); } catch (e) { host2 = ''; }
        rec.set(fr, 'title', host2 ? 'Embedded content from ' + host2 : 'Embedded content'); markFixed(rec, fr, 'aria');
      });
      // Table headers
      q('table th:not([scope])').forEach(function (th) {
        var row = th.parentElement;
        var scope = (th.closest('thead') || (row && row === th.closest('table').querySelector('tr'))) ? 'col' : (row && row.firstElementChild === th ? 'row' : 'col');
        rec.set(th, 'scope', scope);
      });
      // Links that open a new window
      var nt = q('a[target="_blank"]:not([aria-describedby])');
      if (nt.length) {
        if (!self.descNewTab || !self.descNewTab.isConnected) {
          var d = document.createElement('span');
          d.id = 'acc-desc-newtab'; d.className = 'acc-sr-only'; d.textContent = 'Opens in a new tab';
          document.body.appendChild(rec.add(d));
          self.descNewTab = d;
        }
        nt.forEach(function (a) { rec.set(a, 'aria-describedby', 'acc-desc-newtab'); });
      }
      // Live regions for status/alert style containers
      q('[class*="alert"]:not([role]):not([aria-live]),[class*="toast"]:not([role]):not([aria-live]),[class*="notification"]:not([role]):not([aria-live])').forEach(function (el) {
        if (el.children.length < 6 && textOf(el).length < 300) { rec.set(el, 'aria-live', 'polite'); }
      });
    }
  };
  function accNameAttr(el) { return (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || '').trim(); }

  var Alt = {
    on: false, rec: new Recorder(), pending: 0,
    sync: function () { if (S.altText && !this.on) { this.on = true; this.fix(document.body); } else if (!S.altText && this.on) { this.on = false; this.rec.revert(); } },
    describe: function (img) {
      var fig = img.closest('figure'), cap = fig && fig.querySelector('figcaption');
      if (cap && textOf(cap)) return textOf(cap).slice(0, 180);
      if (img.getAttribute('title')) return img.getAttribute('title').trim();
      var ar = img.getAttribute('aria-describedby');
      if (ar) { var n = document.getElementById(ar.split(/\s+/)[0]); if (n && textOf(n)) return textOf(n).slice(0, 180); }
      for (var k in img.dataset) { if (/alt|caption|title|desc/i.test(k) && img.dataset[k]) return String(img.dataset[k]).slice(0, 180); }
      var src = img.currentSrc || img.getAttribute('src') || '';
      if (/^data:/i.test(src)) return '';
      var file = '';
      try { file = decodeURIComponent(new URL(src, location.href).pathname.split('/').pop() || ''); } catch (e) { file = ''; }
      file = file.replace(/\.[a-z0-9]{2,5}$/i, '').replace(/[@-]?\d+x\d+$|[-_]?(scaled|thumb|small|large|medium|copy|final|edited)$/gi, '');
      var letters = file.replace(/[^a-z]/gi, '');
      // Hash-like or numeric file names carry no meaning
      if (letters.length < 3 || /^[a-f0-9]{8,}$/i.test(file.replace(/[-_]/g, '')) || /^(img|image|dsc|pxl|photo|pic|screenshot)[-_ ]?\d/i.test(file)) return '';
      return humanize(file);
    },
    fix: function (root) {
      if (!this.on || !root || root.nodeType !== 1) return;
      var rec = this.rec, self = this;
      var imgs = Array.prototype.slice.call(root.querySelectorAll('img:not([alt]),input[type="image"]:not([alt]),[role="img"]:not([aria-label]):not([aria-labelledby])'));
      if (root.matches && root.matches('img:not([alt])')) imgs.unshift(root);
      imgs.forEach(function (img) {
        if (isOurs(img)) return;
        if (img.getAttribute('role') === 'img' && img.tagName !== 'IMG') {
          var t = img.getAttribute('title') || (img.querySelector('title') && img.querySelector('title').textContent);
          if (t) { rec.set(img, 'aria-label', t.trim()); markFixed(rec, img, 'alt'); }
          return;
        }
        var w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
        var ctl = img.closest('a,button');
        if ((w && w <= 3 && h && h <= 3) || (ctl && textOf(ctl).length > 1) || /(spacer|pixel|tracking|blank)\./i.test(img.getAttribute('src') || '')) {
          rec.set(img, 'alt', ''); markFixed(rec, img, 'alt'); return;
        }
        var guess = self.describe(img);
        if (!guess && ctl) guess = guessName(ctl);
        rec.set(img, 'alt', guess || 'Image'); markFixed(rec, img, 'alt');
        if (CFG.altTextProvider) {
          self.pending++;
          Promise.resolve().then(function () { return CFG.altTextProvider(img); }).then(function (text) {
            if (self.on && text && typeof text === 'string') img.setAttribute('alt', text.slice(0, 300));
          }).catch(function () { /* keep heuristic alt */ }).then(function () { self.pending--; });
        }
      });
    }
  };

  var Forms = {
    on: false, rec: new Recorder(),
    sync: function () { if (S.formFix && !this.on) { this.on = true; this.fix(document.body); } else if (!S.formFix && this.on) { this.on = false; this.rec.revert(); } },
    nearbyText: function (el) {
      var prev = el.previousElementSibling;
      if (prev && !/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(prev.tagName)) { var t = textOf(prev); if (t && t.length < 80) return t; }
      var p = el.parentElement;
      if (p && p.children.length <= 3) {
        var clone = '';
        for (var n = p.firstChild; n; n = n.nextSibling) { if (n.nodeType === 3) clone += n.nodeValue; else if (n !== el && n.nodeType === 1 && !/^(INPUT|SELECT|TEXTAREA)$/.test(n.tagName)) clone += ' ' + textOf(n); }
        clone = clone.replace(/\s+/g, ' ').trim();
        if (clone && clone.length < 80) return clone;
      }
      return '';
    },
    fix: function (root) {
      if (!this.on || !root || root.nodeType !== 1) return;
      var rec = this.rec, self = this;
      var fields = Array.prototype.slice.call(root.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"]),select,textarea'));
      if (root.matches && root.matches('input,select,textarea')) fields.unshift(root);
      fields.forEach(function (el) {
        if (isOurs(el)) return;
        var has = (el.labels && Array.prototype.some.call(el.labels, function (l) { return textOf(l); })) || accNameAttr(el) || (el.getAttribute('title') || '').trim();
        if (!has) {
          var name = (el.getAttribute('placeholder') || '').trim() || self.nearbyText(el) || humanize(el.getAttribute('name') || el.id || '') || humanize(el.type || 'Field');
          rec.set(el, 'aria-label', name); markFixed(rec, el, 'form');
        }
        if (el.required && !el.hasAttribute('aria-required')) rec.set(el, 'aria-required', 'true');
        if (!el.hasAttribute('autocomplete') && el.tagName === 'INPUT') {
          var hint = ((el.getAttribute('name') || '') + ' ' + (el.id || '') + ' ' + el.type).toLowerCase();
          var ac = /e-?mail/.test(hint) ? 'email' : /(^|\W)tel|phone|mobile/.test(hint) ? 'tel' : /first.?name|given/.test(hint) ? 'given-name' : /last.?name|surname|family/.test(hint) ? 'family-name' : /(^|\W)(full.?)?name($|\W)/.test(hint) ? 'name' : /zip|postal/.test(hint) ? 'postal-code' : '';
          if (ac) rec.set(el, 'autocomplete', ac);
        }
        // Error messages near the field
        var group = el.closest('.form-group,.field,.form-field,.input-group,.form-row,.control-group,fieldset,label,p,li,div');
        var ERR_SEL = '.error,.errors,.invalid-feedback,.field-error,.error-message,.help-block.error,[class*="error-text"],[class*="errorMessage"],[role="alert"]';
        var sib = el.nextElementSibling;
        if (group && group.querySelectorAll('input:not([type="hidden"]),select,textarea').length > 2) group = null;
        if (sib && sib.matches(ERR_SEL)) group = { querySelector: function () { return sib; } };
        if (group) {
          var err = group.querySelector('.error,.errors,.invalid-feedback,.field-error,.error-message,.help-block.error,[class*="error-text"],[class*="errorMessage"],[role="alert"]');
          if (err && err !== el && textOf(err)) {
            if (!err.id) rec.set(err, 'id', 'acc-err-' + Math.random().toString(36).slice(2, 8));
            var by = el.getAttribute('aria-describedby') || '';
            if ((' ' + by + ' ').indexOf(' ' + err.id + ' ') < 0) rec.set(el, 'aria-describedby', (by + ' ' + err.id).trim());
            if (!err.hasAttribute('aria-live') && !err.getAttribute('role')) rec.set(err, 'aria-live', 'polite');
            if (visible(err) && !el.hasAttribute('aria-invalid')) rec.set(el, 'aria-invalid', 'true');
            markFixed(rec, el, 'form');
          }
        }
      });
      // Native validation messages: announce and mark invalid on submit attempts
      if (root === document.body && !this.listening) {
        this.listening = true;
        document.addEventListener('invalid', function (e) {
          if (!self.on) return;
          var t = e.target;
          if (t && t.setAttribute) { t.setAttribute('aria-invalid', 'true'); if (t.validationMessage) announce(t.validationMessage); }
        }, true);
        document.addEventListener('input', function (e) {
          var t = e.target;
          if (self.on && t && t.getAttribute && t.getAttribute('aria-invalid') === 'true' && t.checkValidity && t.checkValidity() && !t.getAttribute('aria-describedby')) t.removeAttribute('aria-invalid');
        }, true);
      }
    }
  };

  /* ------------------------------------------------------------------ *
   * 11. Keyboard navigation, skip link and page structure
   * ------------------------------------------------------------------ */
  function findMain(heuristicOnly) {
    if (!heuristicOnly) {
      var m = document.querySelector('main,[role="main"]');
      if (m && textOf(m).length > 80) return m;
    }
    var cands = document.querySelectorAll('article,#main,#content,#primary,.main,.main-content,.content,.post,.post-content,.entry-content,.article-body,.article,.page-content,[itemprop="articleBody"]');
    var best = null, bestLen = 0;
    Array.prototype.forEach.call(cands, function (c) {
      if (isOurs(c)) return;
      var len = textOf(c).length;
      if (len > bestLen * 1.15) { best = c; bestLen = len; }
    });
    if (best && bestLen > 200) return best;
    // Density scoring on paragraphs
    var scores = new Map();
    Array.prototype.forEach.call(document.querySelectorAll('p'), function (p) {
      var l = textOf(p).length;
      if (l < 40) return;
      var a = p.parentElement, b = a && a.parentElement;
      if (a) scores.set(a, (scores.get(a) || 0) + l);
      if (b) scores.set(b, (scores.get(b) || 0) + l / 2);
    });
    var top = null, topScore = 0;
    scores.forEach(function (v, k) { if (v > topScore && !isOurs(k)) { top = k; topScore = v; } });
    return top || document.body;
  }

  var Keyboard = {
    on: false, rec: new Recorder(), skip: null,
    sync: function () {
      if (S.keyboardNav && !this.on) { this.on = true; this.fix(document.body); this.addSkip(); document.addEventListener('keydown', this.onKey, true); }
      else if (!S.keyboardNav && this.on) { this.on = false; this.rec.revert(); this.skip = null; document.removeEventListener('keydown', this.onKey, true); if (Aria.on) Aria.fix(document.body); }
    },
    fix: function (root) {
      if (!this.on || !root || root.nodeType !== 1) return;
      var rec = this.rec;
      var sel = '[onclick]:not(a[href]):not(button):not(input):not(select):not(textarea):not(summary):not(label):not(body):not(html):not([tabindex]),' +
        '[role="button"]:not([tabindex]):not(button),[role="link"]:not([tabindex]):not(a[href]),[role="tab"]:not([tabindex]),[role="menuitem"]:not([tabindex]),[role="option"]:not([tabindex]),' +
        'div[class*="btn"]:not([tabindex]),span[class*="btn"]:not([tabindex]),div[class*="button"]:not([tabindex]),span[class*="button"]:not([tabindex])';
      var list = Array.prototype.slice.call(root.querySelectorAll(sel));
      list.forEach(function (el) {
        if (isOurs(el) || el.closest('a[href],button') || el.querySelector('a[href],button,input,select,textarea')) return;
        rec.set(el, 'tabindex', '0');
        rec.set(el, 'data-acc-kb', '1');
      });
    },
    addSkip: function () {
      if (document.querySelector('a.acc-skip')) return;
      var existing = Array.prototype.some.call(document.querySelectorAll('a[href^="#"]'), function (a) { return /skip/i.test(textOf(a)); });
      if (existing) return;
      var main = findMain();
      if (!main) return;
      if (!main.id) this.rec.set(main, 'id', 'acc-main');
      if (!main.hasAttribute('tabindex')) this.rec.set(main, 'tabindex', '-1');
      var a = document.createElement('a');
      a.className = 'acc-skip'; a.href = '#' + main.id; a.textContent = 'Skip to main content';
      a.addEventListener('click', function (e) { e.preventDefault(); focusEl(main); });
      document.body.insertBefore(this.rec.add(a), document.body.firstChild);
      this.skip = a;
    },
    onKey: function (e) {
      var t = e.target;
      if (isOurs(t)) return;
      // Activate injected buttons with Enter / Space
      if ((e.key === 'Enter' || e.key === ' ') && t && t.getAttribute && t.getAttribute('data-acc-kb') === '1' && !isEditable(t)) {
        e.preventDefault();
        t.click();
        return;
      }
      if (!e.altKey || e.ctrlKey || e.metaKey) return;
      var map = { KeyH: HEADINGS, KeyL: 'a[href],[role="link"]', KeyF: 'input:not([type="hidden"]),select,textarea,[contenteditable="true"]', KeyB: 'button,[role="button"],input[type="submit"],input[type="button"]', KeyM: 'main,[role="main"],nav,[role="navigation"],header,[role="banner"],footer,[role="contentinfo"],aside,[role="complementary"],[role="search"],form[aria-label]', KeyG: 'img[alt]:not([alt=""]),figure,[role="img"]' };
      var sel = map[e.code];
      if (!sel) return;
      e.preventDefault();
      moveTo(sel, e.shiftKey ? -1 : 1);
    }
  };
  Keyboard.onKey = Keyboard.onKey.bind(Keyboard);

  function moveTo(sel, dir) {
    var list = Array.prototype.filter.call(document.querySelectorAll(sel), function (el) { return !isOurs(el) && visible(el); });
    if (!list.length) { announce('None found'); return; }
    var cur = document.activeElement && document.activeElement !== document.body && !isOurs(document.activeElement) ? document.activeElement : null;
    var next = -1, i;
    if (!cur) next = dir > 0 ? 0 : list.length - 1;
    else if (dir > 0) {
      for (i = 0; i < list.length; i++) if (list[i] !== cur && (cur.compareDocumentPosition(list[i]) & Node.DOCUMENT_POSITION_FOLLOWING)) { next = i; break; }
      if (next < 0) next = 0;
    } else {
      for (i = list.length - 1; i >= 0; i--) if (list[i] !== cur && !list[i].contains(cur) && (cur.compareDocumentPosition(list[i]) & Node.DOCUMENT_POSITION_PRECEDING)) { next = i; break; }
      if (next < 0) next = list.length - 1;
    }
    var el = list[next];
    focusEl(el);
    var label = /^H[1-6]$/.test(el.tagName) ? 'Heading level ' + el.tagName.charAt(1) + ', ' : '';
    announce(label + (accName(el) || textOf(el)).slice(0, 120));
  }

  /* ------------------------------------------------------------------ *
   * 12. Text to speech
   * ------------------------------------------------------------------ */
  // Voices do not report gender, so British male voices are recognised by the names browsers and systems give them
  var MALE = /\b(male|man|george|ryan|daniel|arthur|oliver|thomas|james|brian|alfie|harry|william|noah|elliot|ethan|guy|reed|rocko|eddy|grandpa)\b/i;
  var FEMALE = /\b(female|woman|hazel|susan|libby|sonia|kate|serena|martha|stephanie|fiona|maisie|abbi|bella|hollie|olivia|amy|emma|mia|sandy|shelley|flo|grandma|karen|moira|tessa)\b/i;
  function ukMaleVoice(vs) {
    var gb = vs.filter(function (v) { return /^en[-_]gb$/i.test(v.lang || ''); });
    var pick = function (list) { return list.filter(function (v) { return MALE.test(v.name) && !FEMALE.test(v.name); })[0]; };
    return pick(gb.filter(function (v) { return v.localService; })) || pick(gb) || gb.filter(function (v) { return !FEMALE.test(v.name); })[0] || gb[0] ||
      pick(vs.filter(function (v) { return /^en/i.test(v.lang || ''); })) || null;
  }
  var TTS = {
    ok: 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function',
    on: false, sid: 0, active: false, paused: false, items: [], idx: -1, cur: null, curEl: null, curLang: '', said: [],
    voices: function () { try { return window.speechSynthesis.getVoices() || []; } catch (e) { return []; } },
    // The language text is read in: the visitor's choice, else the translation, else the page language
    readLang: function () { return this.curLang || S.ttsLang || S.translateTo || pageLang(); },
    voice: function () {
      var vs = this.voices();
      var lang = this.readLang().toLowerCase();
      var pre = lang.split('-')[0];
      if (S.ttsVoice) { for (var i = 0; i < vs.length; i++) if ((vs[i].voiceURI === S.ttsVoice || vs[i].name === S.ttsVoice) && ((!S.ttsLang && !this.curLang) || (vs[i].lang || '').toLowerCase().split(/[-_]/)[0] === pre)) return vs[i]; }
      if (pre === 'en') { var uk = ukMaleVoice(vs); if (uk) return uk; }
      return vs.filter(function (v) { return v.lang && v.lang.toLowerCase() === lang; })[0] ||
        vs.filter(function (v) { return v.lang && v.lang.toLowerCase().split(/[-_]/)[0] === pre && v.localService; })[0] ||
        vs.filter(function (v) { return v.lang && v.lang.toLowerCase().split(/[-_]/)[0] === pre; })[0] || null;
    },
    sync: function () {
      if (S.tts && !this.on) {
        if (!this.ok) { toast('Read aloud is not supported in this browser'); setState('tts', false, true); return; }
        this.on = true;
        document.addEventListener('click', this.onClick, true);
        document.addEventListener('focusin', this.onFocus, true);
        document.addEventListener('mouseup', this.onSelect, true);
        UI.ttsBar(true);
      } else if (!S.tts && this.on) {
        this.on = false;
        this.stop();
        document.removeEventListener('click', this.onClick, true);
        document.removeEventListener('focusin', this.onFocus, true);
        document.removeEventListener('mouseup', this.onSelect, true);
        UI.ttsBar(false);
      }
    },
    chunks: function (text) {
      var parts = String(text).replace(/\s+/g, ' ').match(/[^.!?;:。！？]+[.!?;:。！？]*\s*/g) || [text];
      var out = [], buf = '';
      parts.forEach(function (p) {
        while (p.length > 220) { var cut = p.lastIndexOf(' ', 200); if (cut < 60) cut = 200; out.push(p.slice(0, cut)); p = p.slice(cut); }
        if ((buf + p).length > 220) { if (buf.trim()) out.push(buf); buf = p; } else buf += p;
      });
      if (buf.trim()) out.push(buf);
      return out.filter(function (s) { return /\S/.test(s); });
    },
    say: function (text, el) { this.play([{ text: text, el: el }]); },
    // Spoken instructions from the panel, always in the visitor's language
    guide: function (lines) {
      if (!this.ok) return;
      var self = this, list = [].concat(lines), tl = userLang();
      var go = function (out, lang) { self.play(out.map(function (t) { return { text: t, el: null, lang: lang, raw: true }; })); };
      if (/^en(-|$)/i.test(tl)) { go(list, 'en'); return; }
      googleText(list, tl).then(function (out) { go(list.map(function (t, i) { return out[i] || t; }), tl); }, function () { go(list, 'en'); });
    },
    play: function (items) {
      if (!this.ok) return;
      this.stop();
      this.active = true; this.paused = false;
      this.items = items.slice(); this.idx = -1;
      this.sid++;
      this.next(this.sid);
      UI.ttsState();
    },
    // Move through what is being read: d = 1 next, -1 previous, 0 repeat
    skip: function (d) {
      if (!this.active || !this.items.length) return false;
      var to = this.idx + d;
      if (to >= this.items.length) { this.stop(); return true; }
      this.idx = clamp(to, 0, this.items.length - 1) - 1;
      this.sid++; this.paused = false;
      try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
      this.next(this.sid);
      UI.ttsState();
      return true;
    },
    speed: function (d) {
      setState('ttsRate', Math.round(clamp(S.ttsRate + d, 0.5, 2) * 10) / 10);
      if (this.active) this.skip(0);
      else this.guide(d > 0 ? 'Faster' : 'Slower');
    },
    readThis: function () {
      var s = window.getSelection && String(window.getSelection()).trim();
      if (s) { this.say(s.slice(0, 5000), null); return; }
      var a = document.activeElement;
      if (a && a !== document.body && !isOurs(a)) { var t = textOf(a) || accName(a); if (t) { this.say(t.slice(0, 5000), a); return; } }
      if (this.curEl) { this.say(textOf(this.curEl), this.curEl); return; }
      this.readPage();
    },
    readHeadings: function () {
      var hs = Array.prototype.filter.call(document.querySelectorAll(HEADINGS), function (el) { return !isOurs(el) && visible(el) && textOf(el); });
      if (!hs.length) { this.guide('This page has no headings'); return; }
      this.play(hs.map(function (el) { return { text: textOf(el), el: el }; }));
    },
    next: function (sid) {
      if (sid !== this.sid || !this.active) return;
      this.idx++;
      var item = this.items[this.idx];
      this.mark(null);
      if (!item) { this.active = false; this.curLang = ''; UI.ttsState(); Voice.heardTTS(); return; }
      this.curLang = item.lang || '';
      this.mark(item.el);
      var self = this, chunks = this.chunks(item.text);
      var go = function (list) {
        var i = 0;
        var step = function () {
          if (sid !== self.sid || !self.active) return;
          if (i >= list.length) { self.next(sid); return; }
          self.utter(list[i++], sid, step, true);
        };
        // Some browsers silently drop speech queued straight after a cancel, so wait a moment
        later(step, 90);
      };
      var tl = this.readLang(), src = (S.translateTo || pageLang()).split('-')[0].toLowerCase();
      if (!item.raw && S.ttsLang && tl.split('-')[0].toLowerCase() !== src) googleText(chunks, tl, null, 'auto').then(go, function () { go(chunks); });
      else go(chunks);
    },
    // Speak one chunk. If the chosen voice does not start, try once more with the system voice.
    utter: function (text, sid, done, withVoice) {
      var self = this, started = false, finished = false, retried = false;
      var u = new SpeechSynthesisUtterance(text);
      var v = withVoice ? this.voice() : null;
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = this.readLang();
      u.rate = S.ttsRate; u.pitch = S.ttsPitch;
      var finish = function () { if (finished) return; finished = true; done(); };
      var retry = function () {
        if (retried || finished) return;
        retried = true; finished = true;
        u.onend = u.onerror = null;
        try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
        later(function () { if (sid === self.sid && self.active) self.utter(text, sid, done, false); }, 120);
      };
      u.onstart = function () { started = true; };
      u.onend = function () { if (!started && withVoice && v) { retry(); return; } finish(); };
      u.onerror = function (ev) {
        if (ev && (ev.error === 'interrupted' || ev.error === 'canceled')) { finished = true; return; }
        if (!started && withVoice && v) retry(); else finish();
      };
      this.cur = u;
      // Remember what was spoken, so voice input can tell the page's own voice from the visitor's
      this.said.push({ t: text, at: Date.now() }); if (this.said.length > 4) this.said.shift();
      try { window.speechSynthesis.resume(); } catch (e) { /* ignore */ }
      window.speechSynthesis.speak(u);
      if (withVoice && v) later(function () { if (!started && !finished && sid === self.sid && !window.speechSynthesis.speaking) retry(); }, 2500);
    },
    mark: function (el) {
      if (this.curEl) this.curEl.classList.remove('acc-reading');
      this.curEl = el && el.classList ? el : null;
      if (this.curEl) {
        this.curEl.classList.add('acc-reading');
        var r = this.curEl.getBoundingClientRect();
        if (r.top < 0 || r.bottom > vh()) { try { this.curEl.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { this.curEl.scrollIntoView(); } }
      }
    },
    pause: function () { if (!this.active) return; if (this.paused) { window.speechSynthesis.resume(); this.paused = false; } else { window.speechSynthesis.pause(); this.paused = true; } UI.ttsState(); },
    stop: function () {
      var was = this.active;
      this.sid++; this.active = false; this.paused = false; this.items = []; this.idx = -1; this.curLang = '';
      if (was) Voice.heardTTS();
      try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
      this.mark(null);
      UI.ttsState();
    },
    readPage: function (root) {
      var main = root || findMain();
      var sel = 'h1,h2,h3,h4,h5,h6,p,li,blockquote,dt,dd,figcaption,td,th,caption,pre';
      var all = Array.prototype.filter.call(main.querySelectorAll(sel), function (el) { return !isOurs(el) && visible(el) && textOf(el).length > 1; });
      var leaves = all.filter(function (el) { return !el.querySelector(sel); });
      if (!leaves.length && textOf(main)) leaves = [main];
      this.play(leaves.map(function (el) { return { text: textOf(el), el: el }; }));
    },
    onClick: function (e) {
      if (isOurs(e.target) || !e.isTrusted) return;
      var sel = window.getSelection && String(window.getSelection());
      if (sel && sel.trim().length > 1) return;
      var t = e.target.closest && e.target.closest('h1,h2,h3,h4,h5,h6,p,li,td,th,dt,dd,blockquote,figcaption,caption,label,button,a,summary,legend,span,div,img');
      if (!t || t === document.body) return;
      var text = t.tagName === 'IMG' ? (t.getAttribute('alt') || '') : (t.matches('a,button,summary') ? accName(t) : textOf(t));
      if (t.tagName === 'DIV' && text.length > 600) return; // a wrapper, not a text block
      if (text) TTS.say(text.slice(0, 5000), t);
    },
    onFocus: function (e) {
      if (isOurs(e.target) || !S.keyboardNav) return;
      var n = accName(e.target);
      if (n) TTS.say(n.slice(0, 300), null);
    },
    onSelect: function (e) {
      if (isOurs(e.target)) return;
      later(function () {
        var s = window.getSelection && String(window.getSelection());
        if (s && s.trim().length > 2) TTS.say(s.trim().slice(0, 5000), null);
      }, 30);
    }
  };
  TTS.onClick = TTS.onClick.bind(TTS); TTS.onFocus = TTS.onFocus.bind(TTS); TTS.onSelect = TTS.onSelect.bind(TTS);

  /* ------------------------------------------------------------------ *
   * 13. Pointer aids: reading guide, reading mask, text magnifier
   * ------------------------------------------------------------------ */
  var Pointer = {
    x: -1, y: -1, raf: 0, bound: false, lastTarget: null,
    sync: function () {
      var need = S.readingGuide || S.readingMask || S.magnifier;
      if (need && !this.bound) {
        this.bound = true;
        document.addEventListener('pointermove', this.onMove, { passive: true });
        document.addEventListener('touchmove', this.onTouch, { passive: true });
      } else if (!need && this.bound) {
        this.bound = false;
        document.removeEventListener('pointermove', this.onMove);
        document.removeEventListener('touchmove', this.onTouch);
      }
      $('.guide').hidden = !S.readingGuide;
      $('.mask-t').hidden = $('.mask-b').hidden = !S.readingMask;
      if (!S.magnifier) $('.lens').hidden = true;
      if (S.readingMask && this.y < 0) { this.y = vh() / 2; this.draw(); }
      if (S.readingGuide && this.y < 0) { this.y = vh() / 2; this.draw(); }
    },
    onMove: function (e) { Pointer.x = e.clientX; Pointer.y = e.clientY; Pointer.lastTarget = e.target; Pointer.schedule(); },
    onTouch: function (e) { var t = e.touches && e.touches[0]; if (!t) return; Pointer.x = t.clientX; Pointer.y = t.clientY; Pointer.lastTarget = document.elementFromPoint(t.clientX, t.clientY); Pointer.schedule(); },
    schedule: function () { if (!this.raf) this.raf = requestAnimationFrame(function () { Pointer.raf = 0; Pointer.draw(); }); },
    draw: function () {
      var y = this.y;
      if (S.readingGuide) {
        var g = $('.guide'), gw = g.offsetWidth || 400, px = this.x < 0 ? vw() / 2 : this.x;
        var gx = clamp(px - gw / 2, 12, Math.max(12, vw() - gw - 12));
        g.style.setProperty('--gx', Math.round(clamp(px - gx, 14, gw - 14)) + 'px');
        g.style.transform = 'translate(' + Math.round(gx) + 'px,' + Math.round(y + 14) + 'px)';
      }
      if (S.readingMask) {
        var band = Math.max(60, Math.round(vh() * 0.14));
        $('.mask-t').style.height = Math.max(0, y - band / 2) + 'px';
        $('.mask-b').style.top = Math.max(0, y + band / 2) + 'px';
      }
      if (S.magnifier) this.lens();
    },
    lens: function () {
      var L = $('.lens'), t = this.lastTarget;
      if (!t || isOurs(t) || t.nodeType !== 1) { L.hidden = true; return; }
      var block = t.closest('h1,h2,h3,h4,h5,h6,p,li,td,th,dt,dd,a,button,label,span,blockquote,figcaption,caption,summary,legend,div');
      var text = block ? textOf(block) : '';
      if (!text || (block.tagName === 'DIV' && text.length > 400)) { L.hidden = true; return; }
      if (L.__t !== text) { L.textContent = text.length > 280 ? text.slice(0, 280) + '…' : text; L.__t = text; }
      L.hidden = false;
      var w = L.offsetWidth, h = L.offsetHeight, x = this.x + 18, y = this.y + 22;
      if (x + w > vw() - 8) x = Math.max(8, this.x - w - 18);
      if (y + h > vh() - 8) y = Math.max(8, this.y - h - 18);
      L.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
    }
  };

  /* ------------------------------------------------------------------ *
   * 14. Motion, media and timing
   * ------------------------------------------------------------------ */
  var Motion = {
    on: false, videos: [], gifs: [], marquees: [], svgs: [], anims: [],
    sync: function () { if (S.stopAnimations && !this.on) { this.on = true; this.fix(document.body); later(this.pauseWAAPI.bind(this), 60); } else if (!S.stopAnimations && this.on) { this.on = false; this.restore(); } },
    fix: function (root) {
      if (!this.on || !root || root.nodeType !== 1) return;
      var self = this;
      Array.prototype.forEach.call(root.querySelectorAll('video'), function (v) { if (!v.paused || v.autoplay) { try { v.pause(); } catch (e) { /* ignore */ } self.videos.push(v); } });
      Array.prototype.forEach.call(root.querySelectorAll('marquee'), function (m) { if (m.stop) { m.stop(); self.marquees.push(m); } });
      Array.prototype.forEach.call(root.querySelectorAll('svg'), function (s) { if (s.pauseAnimations && s.querySelector('animate,animateTransform,animateMotion,set')) { s.pauseAnimations(); self.svgs.push(s); } });
      Array.prototype.forEach.call(root.querySelectorAll('img'), function (img) { self.freeze(img); });
      Array.prototype.forEach.call(root.querySelectorAll('iframe'), function (f) { postToPlayer(f, 'pause'); });
    },
    freeze: function (img) {
      if (img.__accFrozen || isOurs(img)) return;
      var src = img.currentSrc || img.src || '';
      if (!/\.gif($|[?#])/i.test(src) && !/^data:image\/gif/i.test(src)) return;
      var self = this;
      var go = function () {
        if (!self.on || img.__accFrozen) return;
        try {
          var c = document.createElement('canvas');
          c.width = img.naturalWidth; c.height = img.naturalHeight;
          c.getContext('2d').drawImage(img, 0, 0);
          var url = c.toDataURL('image/png');
          self.gifs.push([img, img.getAttribute('src'), img.getAttribute('srcset')]);
          img.__accFrozen = true;
          img.removeAttribute('srcset');
          img.setAttribute('src', url);
        } catch (e) { /* cross-origin GIF without CORS: cannot be frozen */ }
      };
      if (img.complete && img.naturalWidth) go(); else img.addEventListener('load', go, { once: true });
    },
    pauseWAAPI: function () {
      if (!this.on || !document.getAnimations) return;
      var self = this;
      document.getAnimations().forEach(function (a) {
        var css = (typeof CSSAnimation !== 'undefined' && a instanceof CSSAnimation) || (typeof CSSTransition !== 'undefined' && a instanceof CSSTransition);
        if (!css && a.playState === 'running') { try { a.pause(); self.anims.push(a); } catch (e) { /* ignore */ } }
      });
    },
    restore: function () {
      this.videos.forEach(function (v) { if (v.autoplay) { var p = v.play(); if (p && p.catch) p.catch(function () { }); } }); this.videos = [];
      this.marquees.forEach(function (m) { if (m.start) m.start(); }); this.marquees = [];
      this.svgs.forEach(function (s) { s.unpauseAnimations(); }); this.svgs = [];
      this.anims.forEach(function (a) { try { a.play(); } catch (e) { /* ignore */ } }); this.anims = [];
      this.gifs.forEach(function (g) {
        g[0].__accFrozen = false;
        if (g[1] !== null) g[0].setAttribute('src', g[1]);
        if (g[2] !== null) g[0].setAttribute('srcset', g[2]);
      });
      this.gifs = [];
    }
  };

  function postToPlayer(frame, cmd) {
    var src = frame.getAttribute('src') || '';
    try {
      if (/youtube(-nocookie)?\.com\/embed/i.test(src)) {
        var fn = { pause: 'pauseVideo', mute: 'mute', unmute: 'unMute' }[cmd];
        if (fn) frame.contentWindow.postMessage(JSON.stringify({ event: 'command', func: fn, args: [] }), '*');
      } else if (/player\.vimeo\.com/i.test(src)) {
        var msg = cmd === 'pause' ? { method: 'pause' } : { method: 'setVolume', value: cmd === 'mute' ? 0 : 1 };
        frame.contentWindow.postMessage(JSON.stringify(msg), '*');
      }
    } catch (e) { /* cross-origin player not reachable */ }
  }

  var Mute = {
    on: false, prev: [], origPlay: null, OrigAC: null, OrigWAC: null, ctxs: [],
    sync: function () { if (S.mute && !this.on) this.enable(); else if (!S.mute && this.on) this.disable(); },
    enable: function () {
      this.on = true;
      var self = this;
      this.fix(document.body);
      if (window.HTMLMediaElement && !this.origPlay) {
        this.origPlay = HTMLMediaElement.prototype.play;
        var orig = this.origPlay;
        HTMLMediaElement.prototype.play = function () {
          if (self.on && !this.muted) { self.prev.push([this, false]); this.muted = true; }
          return orig.apply(this, arguments);
        };
      }
      ['AudioContext', 'webkitAudioContext'].forEach(function (name) {
        var Orig = window[name];
        if (typeof Orig !== 'function' || Orig.__acc) return;
        var Wrapped = function () {
          var c = new (Function.prototype.bind.apply(Orig, [null].concat(Array.prototype.slice.call(arguments))))();
          self.ctxs.push(c);
          if (self.on && c.suspend) c.suspend();
          return c;
        };
        Wrapped.prototype = Orig.prototype;
        Wrapped.__acc = Orig;
        try { window[name] = Wrapped; } catch (e) { /* read-only */ }
      });
      this.ctxs.forEach(function (c) { if (c.suspend) c.suspend(); });
    },
    fix: function (root) {
      if (!this.on || !root || root.nodeType !== 1) return;
      var self = this;
      Array.prototype.forEach.call(root.querySelectorAll('audio,video'), function (m) { if (!m.muted) { self.prev.push([m, false]); m.muted = true; } });
      Array.prototype.forEach.call(root.querySelectorAll('iframe'), function (f) { postToPlayer(f, 'mute'); });
    },
    disable: function () {
      this.on = false;
      this.prev.forEach(function (p) { try { p[0].muted = p[1]; } catch (e) { /* ignore */ } });
      this.prev = [];
      if (this.origPlay) { HTMLMediaElement.prototype.play = this.origPlay; this.origPlay = null; }
      ['AudioContext', 'webkitAudioContext'].forEach(function (name) { if (window[name] && window[name].__acc) { try { window[name] = window[name].__acc; } catch (e) { /* ignore */ } } });
      this.ctxs.forEach(function (c) { if (c.resume && c.state === 'suspended') c.resume(); });
      Array.prototype.forEach.call(document.querySelectorAll('iframe'), function (f) { postToPlayer(f, 'unmute'); });
    }
  };

  // Extended timeouts: long timers (session warnings, carousels) run 3× longer,
  // and mouse-leave handlers (hover menus) fire after a grace period.
  var Timing = {
    on: false, pending: [],
    sync: function () { if (S.extendedTime && !this.on) this.enable(); else if (!S.extendedTime && this.on) this.disable(); },
    enable: function () {
      this.on = true;
      var K = 3, T = 4000;
      window.setTimeout = function (fn, d) { var a = Array.prototype.slice.call(arguments); if (typeof d === 'number' && d >= T) a[1] = d * K; return nativeSetTimeout.apply(window, a); };
      window.setInterval = function (fn, d) { var a = Array.prototype.slice.call(arguments); if (typeof d === 'number' && d >= T) a[1] = d * K; return nativeSetInterval.apply(window, a); };
      window.addEventListener('mouseout', this.onLeave, true);
      window.addEventListener('mouseleave', this.onLeave, true);
    },
    disable: function () {
      this.on = false;
      window.setTimeout = nativeSetTimeout; window.setInterval = nativeSetInterval;
      window.removeEventListener('mouseout', this.onLeave, true);
      window.removeEventListener('mouseleave', this.onLeave, true);
      this.pending.forEach(function (p) { p(); });
      this.pending = [];
    },
    onLeave: function (e) {
      if (!e.isTrusted || isOurs(e.target) || !(e.target instanceof Element)) return;
      var el = e.target, type = e.type;
      // Only hold back leave events for things that look like menus or tooltips
      if (!el.closest('nav,[role="menu"],[role="menubar"],[role="navigation"],[aria-haspopup],[aria-expanded],[class*="menu"],[class*="dropdown"],[class*="nav"],[class*="tooltip"],[class*="popover"],[title]')) return;
      e.stopImmediatePropagation();
      var init = { bubbles: e.bubbles, cancelable: e.cancelable, clientX: e.clientX, clientY: e.clientY, relatedTarget: e.relatedTarget, view: window };
      var fire = function () { if (!el.matches(':hover')) el.dispatchEvent(new MouseEvent(type, init)); };
      var id = later(function () { Timing.pending.splice(Timing.pending.indexOf(fire), 1); fire(); }, 1500);
      Timing.pending.push(fire);
      return id;
    }
  };

  /* ------------------------------------------------------------------ *
   * 15. Voice commands and Talk & Type (Web Speech API)
   * ------------------------------------------------------------------ */
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var lastEditable = null;
  document.addEventListener('focusin', function (e) { if (!isOurs(e.target) && isEditable(e.target)) lastEditable = e.target; }, true);

  /* Word matching for spoken input. Cheap on purpose: short strings, simple edit distance, no libraries. */
  function normWords(s) {
    s = String(s || '').toLowerCase();
    try { s = s.normalize('NFD').replace(/[̀-ͯ]/g, ''); } catch (e) { /* old browser */ }
    return s.replace(/[.,!?;:"“”'’«»()\[\]¿¡。、，！？،؟]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function editRatio(a, b) {
    if (a === b) return 1;
    var la = a.length, lb = b.length;
    if (!la || !lb) return 0;
    if (Math.abs(la - lb) > Math.max(la, lb) * 0.6) return 0;
    var prev = [], cur = [], i, j;
    for (j = 0; j <= lb; j++) prev[j] = j;
    for (i = 1; i <= la; i++) {
      cur = [i];
      for (j = 1; j <= lb; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1));
      prev = cur;
    }
    return 1 - prev[lb] / Math.max(la, lb);
  }
  // 1 = same words. Compares the whole phrase and word by word, and takes the better of the two.
  function wordMatch(said, phrase) {
    var a = normWords(said), b = normWords(phrase);
    if (!a || !b) return 0;
    if (a === b) return 1;
    var whole = editRatio(a, b);
    var wa = a.split(' '), wb = b.split(' '), sum = 0;
    wb.forEach(function (w) { var best = 0; wa.forEach(function (x) { var r = editRatio(x, w); if (r > best) best = r; }); sum += best; });
    var words = sum / Math.max(wa.length, wb.length);
    return Math.max(whole, words);
  }

  var Voice = {
    rec: null, mode: '', lang: '', want: false, running: false, fails: 0, numbers: [], pending: null, quietUntil: 0, dog: 0, lastIns: null,
    SURE: 0.86, MAYBE: 0.6,
    YES: ['yes', 'yeah', 'yep', 'yes please', 'correct', 'right', 'okay', 'ok', 'sure', 'do it'],
    NO: ['no', 'nope', 'cancel', 'wrong', 'no thanks', 'not that'],
    sync: function () {
      var want = S.voiceNav ? 'nav' : S.dictation ? 'dict' : '';
      var lang = want ? userLang() : '';
      if (want === this.mode && lang === this.lang) return;
      var first = want && want !== this.mode;
      this.stop();
      if (want) this.start(want, first);
    },
    start: function (mode, first) {
      var key = mode === 'nav' ? 'voiceNav' : 'dictation';
      if (!SR) {
        toast(T('Voice input is not supported in this browser. Try Chrome, Edge or Safari.'));
        setState(key, false, true);
        return;
      }
      this.mode = mode; this.want = true; this.fails = 0; this.pending = null;
      this.lang = userLang();
      this.prepare(this.lang);
      UI.heard = [];
      this.listen();
      UI.pill('');
      // Keep listening until the visitor turns it off: restart after silence, errors or a hidden tab
      var self = this;
      cancel(this.dog);
      this.dog = nativeSetInterval.call(window, function () { if (self.want && !self.running && !document.hidden) self.listen(); }, 4000);
      if (first && mode === 'dict' && !lastEditable) toast(T('Click into a text box, then start speaking'));
    },
    listen: function () {
      if (!this.want || this.running) return;
      var self = this, mode = this.mode, r;
      try { r = new SR(); } catch (e) { return; }
      r.lang = this.lang;
      r.continuous = true;
      r.interimResults = true;
      r.maxAlternatives = 3;
      r.onstart = function () { self.running = true; };
      r.onresult = function (ev) {
        self.fails = 0;
        for (var i = ev.resultIndex; i < ev.results.length; i++) {
          var res = ev.results[i], txt = String(res[0].transcript || '').trim();
          if (!txt) continue;
          if (!res.isFinal) { if (!self.hearingSelf(txt)) UI.pill(txt, true); continue; }
          var alts = [];
          for (var k = 0; k < res.length; k++) alts.push(String(res[k].transcript || '').trim());
          self.heard(txt, alts, mode);
        }
      };
      r.onerror = function (ev) {
        var e = ev.error;
        if (e === 'not-allowed' || e === 'service-not-allowed') {
          self.halt(T('Microphone access was blocked. Allow the microphone for this site to use voice.'));
        } else if (e === 'audio-capture') {
          self.halt(T('No microphone was found. Connect one and turn this on again.'));
        } else if (e === 'language-not-supported' && self.lang !== 'en-US') {
          self.lang = 'en-US';
        } else if (e !== 'no-speech' && e !== 'aborted') self.fails++;
      };
      r.onend = function () {
        self.running = false;
        if (self.rec !== r || !self.want) return;
        // Wait a little longer after each failure (network problems), but never give up while it is on
        later(function () { if (self.want && self.rec === r && !self.running && !document.hidden) self.listen(); }, Math.min(5000, 250 * Math.pow(2, Math.min(self.fails, 5))));
      };
      this.rec = r;
      try { r.start(); } catch (e) { /* already started */ }
    },
    halt: function (msg) {
      var key = this.mode === 'nav' ? 'voiceNav' : 'dictation';
      this.want = false;
      toast(msg);
      setState(key, false, true);
    },
    stop: function () {
      this.want = false; this.mode = ''; this.lang = ''; this.running = false; this.pending = null;
      window.clearInterval(this.dog);
      if (this.rec) { var r = this.rec; this.rec = null; try { r.abort(); } catch (e) { /* ignore */ } }
      this.hideNumbers();
      UI.ask(null);
      UI.pill('');
    },
    // The microphone can hear the page reading out loud. Words that match what was just spoken are ignored.
    hearingSelf: function (txt) {
      if (!((TTS.active && !TTS.paused) || Date.now() < this.quietUntil)) return false;
      var heard = normWords(txt).split(' ').filter(Boolean);
      if (heard.length < 2) return false;
      var spoken = normWords(TTS.said.map(function (x) { return x.t; }).join(' ')).split(' ');
      var hit = 0;
      heard.forEach(function (w) { for (var i = 0; i < spoken.length; i++) { if (editRatio(w, spoken[i]) >= 0.8) { hit++; return; } } });
      return hit / heard.length >= 0.6;
    },
    heardTTS: function () { this.quietUntil = Date.now() + 1500; },

    // Phrases in the visitor's language, so commands work in any language the visitor speaks
    local: {},
    prepare: function (lang) {
      if (!lang || /^en(-|$)/i.test(lang) || this.local[lang]) return;
      var self = this, list = [];
      this.local[lang] = {};
      this.allPhrases().forEach(function (p) { if (list.indexOf(p) < 0) list.push(p); });
      var c = I18N.cache[lang] || (I18N.cache[lang] = {});
      var todo = list.filter(function (p) { return c['v:' + p] == null; });
      var fill = function () { list.forEach(function (p) { if (c['v:' + p]) self.local[lang][p] = normWords(c['v:' + p]); }); };
      if (!todo.length) { fill(); return; }
      googleText(todo, lang).then(function (out) { todo.forEach(function (p, i) { if (out[i]) c['v:' + p] = out[i]; }); I18N.persist(); fill(); }, function () { delete self.local[lang]; });
    },
    allPhrases: function () {
      var out = this.YES.concat(this.NO);
      this.navCmds().concat(this.dictCmds()).forEach(function (c) { out = out.concat(c.say); });
      this.SLOTS.forEach(function (sl) { out = out.concat(sl.say); });
      PUNCT.forEach(function (p) { out.push(p[0]); });
      return out;
    },
    variants: function (p) { var l = this.local[this.lang]; return l && l[p] && l[p] !== p ? [p, l[p]] : [p]; },
    score: function (said, phrases) {
      var best = 0, self = this;
      phrases.forEach(function (p) { self.variants(p).forEach(function (v) { var s = wordMatch(said, v); if (s > best) best = s; }); });
      return best;
    },
    best: function (said, cmds) {
      var top = null, sc = 0, self = this;
      cmds.forEach(function (c) { var s = self.score(said, c.say); if (s > sc) { sc = s; top = c; } });
      return { cmd: top, score: sc };
    },

    // Everything said ends up here
    heard: function (txt, alts, mode) {
      var self = this;
      if (this.hearingSelf(txt)) return;
      if (this.pending && this.answer(txt)) return;
      UI.pill(txt);
      // The visitor is talking: a guide or tip being spoken stops, so it does not talk over them
      if (TTS.active && TTS.items.length && TTS.items[0].raw) TTS.stop();
      if (mode === 'nav') {
        // Try every alternative the browser heard and keep the best guess
        var top = null;
        alts.forEach(function (a) { var g = self.guessNav(a); if (g && (!top || g.score > top.score)) top = g; });
        this.act(top, txt);
      } else this.type(txt, alts);
    },
    act: function (g, txt) {
      if (g && g.score >= this.SURE) { this.pending = null; UI.ask(null); g.run(); return; }
      if (g && g.score >= this.MAYBE) { this.confirm(g.label, g.run, null); return; }
      UI.pill(txt, false, T('Not sure what you meant. Say "What can I say" to hear the commands.'));
    },
    // Ask "Did you mean …?" — answer by voice (yes / no) or with the buttons
    confirm: function (label, yes, no) {
      var self = this;
      this.pending = { label: label, yes: yes, no: no, until: Date.now() + 15000 };
      UI.ask(label);
      if (S.spokenTips && TTS.ok) TTS.guide('Did you mean: ' + label + '?');
      later(function () { if (self.pending && Date.now() > self.pending.until) { self.pending = null; UI.ask(null); } }, 15100);
    },
    answer: function (txt) {
      var p = this.pending;
      if (!p) return false;
      var y = this.score(txt, this.YES), n = this.score(txt, this.NO);
      if (y < 0.8 && n < 0.8) { this.pending = null; UI.ask(null); return false; }
      this.pending = null; UI.ask(null);
      UI.pill(txt);
      if (y >= n) p.yes(); else if (p.no) p.no();
      return true;
    },
    reply: function (yes) {
      var p = this.pending;
      this.pending = null; UI.ask(null);
      if (!p) return;
      if (TTS.active) TTS.stop();
      if (yes) p.yes(); else if (p.no) p.no();
    },

    // Spoken commands for moving around and reading. "reading" ones still work while the page is speaking.
    navCmds: function () {
      if (this._nav) return this._nav;
      var sc = function (d) { return function () { window.scrollBy({ top: d * vh() * 0.8, behavior: S.stopAnimations ? 'auto' : 'smooth' }); }; };
      var list = [
        ['Scroll down', ['scroll down', 'page down', 'go down', 'down'], sc(1)],
        ['Scroll up', ['scroll up', 'page up', 'go up', 'up'], sc(-1)],
        ['Go to top', ['go to top', 'scroll to top', 'top of the page', 'top'], function () { window.scrollTo({ top: 0, behavior: 'smooth' }); }],
        ['Go to bottom', ['go to bottom', 'scroll to bottom', 'end of the page', 'bottom'], function () { window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' }); }],
        ['Go back', ['go back', 'back', 'previous page'], function () { history.back(); }],
        ['Go forward', ['go forward', 'forward'], function () { history.forward(); }],
        ['Reload', ['reload', 'refresh', 'reload page', 'refresh page'], function () { location.reload(); }],
        ['Next heading', ['next heading', 'next title'], function () { moveTo(HEADINGS, 1); }],
        ['Previous heading', ['previous heading', 'heading before'], function () { moveTo(HEADINGS, -1); }],
        ['Next link', ['next link'], function () { moveTo('a[href]', 1); }],
        ['Next field', ['next field', 'next box', 'next input'], function () { moveTo(FIELDS, 1); }],
        ['Previous field', ['previous field', 'previous box'], function () { moveTo(FIELDS, -1); }],
        ['Show numbers', ['show numbers', 'show labels', 'numbers'], function () { Voice.showNumbers(); }],
        ['Hide numbers', ['hide numbers', 'hide labels'], function () { Voice.hideNumbers(); }],
        ['Zoom in', ['zoom in', 'bigger', 'make it bigger'], function () { stepCycle('contentScale', 1); }],
        ['Zoom out', ['zoom out', 'smaller', 'make it smaller'], function () { stepCycle('contentScale', -1); }],
        ['Open menu', ['open menu', 'open accessibility', 'show menu', 'open options'], function () { UI.show(); }],
        ['Close menu', ['close menu', 'close accessibility', 'hide menu', 'close'], function () { UI.close(); }],
        ['What can I say', ['what can i say', 'help', 'show commands', 'list commands', 'commands'], function () { UI.commands('nav'); }],
        ['Stop listening', ['stop listening', 'turn off voice', 'stop voice commands'], function () { setState('voiceNav', false); TTS.guide('Voice commands are off'); }],
        ['Read page', ['read page', 'read the page', 'read all', 'read everything'], function () { if (!S.tts) setState('tts', true); TTS.readPage(); }],
        ['Read this', ['read this', 'read selection', 'read that'], function () { if (!S.tts) setState('tts', true); TTS.readThis(); }],
        ['Read headings', ['read headings', 'read the headings', 'read titles'], function () { if (!S.tts) setState('tts', true); TTS.readHeadings(); }],
        ['Pause', ['pause', 'pause reading', 'wait'], function () { if (TTS.active && !TTS.paused) TTS.pause(); }, 1],
        ['Continue', ['continue', 'resume', 'continue reading', 'go on'], function () { if (TTS.paused) TTS.pause(); }, 1],
        ['Next', ['next', 'skip', 'next paragraph'], function () { if (!TTS.skip(1)) moveTo(HEADINGS, 1); }, 1],
        ['Previous', ['previous', 'previous paragraph', 'go back one'], function () { if (!TTS.skip(-1)) moveTo(HEADINGS, -1); }, 1],
        ['Repeat', ['repeat', 'say again', 'again'], function () { TTS.skip(0); }, 1],
        ['Faster', ['faster', 'read faster', 'speed up'], function () { TTS.speed(0.2); }, 1],
        ['Slower', ['slower', 'read slower', 'slow down'], function () { TTS.speed(-0.2); }, 1],
        ['Stop reading', ['stop reading', 'stop', 'be quiet', 'silence', 'quiet'], function () { TTS.stop(); }, 1]
      ];
})(window, document);
