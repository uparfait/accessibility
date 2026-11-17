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
      this._nav = list.map(function (c) { return { label: c[0], say: c[1], run: c[2], reading: !!c[3] }; });
      return this._nav;
    },
    // Commands that take words after them: "click Contact", "search for opening hours"
    SLOTS: [
      { id: 'click', say: ['click', 'press', 'open', 'select', 'tap', 'go to', 'follow', 'choose'] },
      { id: 'search', say: ['search for', 'search', 'find', 'look for'] }
    ],
    guessNav: function (said) {
      var t = normWords(said);
      if (!t) return null;
      var self = this;
      // Numbers shown on screen
      if (this.numbers.length) {
        var W = { one: 1, two: 2, to: 2, too: 2, three: 3, four: 4, for: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20 };
        var m = t.match(/^(?:click |press |number |select |open )?(\d+|[a-z]+)$/);
        var n = m ? (/^\d+$/.test(m[1]) ? parseInt(m[1], 10) : W[m[1]]) : 0;
        if (n && this.numbers[n - 1]) { var el = this.numbers[n - 1]; return { score: 1, label: String(n), run: function () { self.hideNumbers(); try { el.focus(); } catch (e) { /* ignore */ } el.click(); } }; }
      }
      var b = this.best(t, this.navCmds());
      var guess = b.cmd ? { score: b.score, label: b.cmd.label, run: b.cmd.run } : null;
      if (guess && guess.score === 1) return guess;
      // "click …", "search for …"
      var words = t.split(' ');
      this.SLOTS.forEach(function (sl) {
        sl.say.forEach(function (p) {
          self.variants(p).forEach(function (v) {
            var pw = normWords(v).split(' '), n2 = pw.length;
            if (words.length <= n2) return;
            var head = words.slice(0, n2).join(' '), rest = words.slice(n2).join(' ').replace(/^(on|the|on the) /, '');
            var hs = editRatio(head, pw.join(' '));
            if (hs < 0.75) return;
            var g = sl.id === 'click' ? self.guessClick(rest, hs) : { score: hs, label: 'Search for ' + rest, run: function () { searchPage(rest); } };
            if (g && (!guess || g.score > guess.score)) guess = g;
          });
        });
      });
      // A link or button name said on its own
      if (!guess || guess.score < this.SURE) {
        var c = this.guessClick(t, 1);
        if (c && c.score >= 0.9 && (!guess || c.score > guess.score)) guess = c;
      }
      return guess;
    },
    guessClick: function (name, headScore) {
      var best = null, sc = 0;
      Voice.clickables().forEach(function (el) {
        var n = (accName(el) || '').trim();
        if (!n || n.length > 80) return;
        var s = wordMatch(name, n);
        if (s > sc) { sc = s; best = el; }
      });
      if (!best) return null;
      var label = (accName(best) || '').trim().slice(0, 60), el = best;
      return { score: sc * Math.min(1, headScore + 0.1), label: 'Click ' + label, run: function () { if (isOurs(el)) { try { el.focus(); } catch (e) { /* ignore */ } } else focusEl(el); el.click(); } };
    },
    clickables: function () {
      // Includes the accessibility panel itself, so it can be used fully by voice
      var own = $$('.panel:not([hidden]) button, .help:not([hidden]) button, .cs-pop:not([hidden]) .opt, .vkb:not([hidden]) button, .tts-bar:not([hidden]) button, .ask:not([hidden]) button').filter(function (b) { var r = b.getBoundingClientRect(); return r.width && r.height && r.bottom > 0 && r.top < vh(); });
      return own.concat(Array.prototype.filter.call(document.querySelectorAll('a[href],button,[role="button"],[role="link"],[role="tab"],[role="menuitem"],input[type="submit"],input[type="button"],input[type="checkbox"],input[type="radio"],summary,select,[onclick],[data-acc-kb]'), function (el) { return !isOurs(el) && visible(el) && inViewport(el); }));
    },

    /* --- Talk & type --- */
    dictCmds: function () {
      if (this._dict) return this._dict;
      var self = this;
      var list = [
        ['Delete that', ['delete that', 'undo', 'undo that', 'scratch that', 'remove that'], function () { self.undo(); }],
        ['Delete last word', ['delete last word', 'delete word', 'remove last word', 'delete the last word'], function () { deleteWord(lastEditable); }],
        ['Clear all', ['clear all', 'delete all', 'clear everything', 'erase all', 'clear the box'], function () { if (lastEditable) { if (lastEditable.isContentEditable) lastEditable.textContent = ''; else setValue(lastEditable, ''); } }],
        ['Next field', ['next field', 'next box'], function () { self.field(1); }],
        ['Previous field', ['previous field', 'previous box'], function () { self.field(-1); }],
        ['Send', ['send', 'submit', 'send message', 'submit form', 'send form'], function () { self.send(); }],
        ['What can I say', ['what can i say', 'help', 'show commands', 'commands'], function () { UI.commands('dict'); }],
        ['Stop typing', ['stop typing', 'stop listening', 'stop dictation', 'stop talk and type'], function () { setState('dictation', false); TTS.guide('Talk and type is off'); }]
      ];
      this._dict = list.map(function (c) { return { label: c[0], say: c[1], run: c[2] }; });
      return this._dict;
    },
    type: function (raw, alts) {
      var self = this, t = raw.trim(), words = normWords(t).split(' ').length;
      // A short phrase may be a command; long phrases are always text
      if (words <= 5) {
        var b = this.best(t, this.dictCmds());
        if (b.cmd && b.score >= this.SURE) { b.cmd.run(); return; }
        if (b.cmd && b.score >= 0.7 && words <= 3) { var c = b.cmd; this.confirm(c.label, c.run, function () { self.write(t); }); return; }
      }
      this.write(t);
    },
    write: function (t) {
      var el = lastEditable;
      if (!el || !el.isConnected) { UI.pill(t, false, T('Click into a text box first')); return; }
      t = this.punctuate(t);
      var isInput = el.tagName === 'INPUT';
      if (isInput) t = t.replace(/\n+/g, ' ');
      if (isInput && el.type === 'email') t = t.replace(/\s+at\s+/gi, '@').replace(/\s+dot\s+/gi, '.').replace(/\s+/g, '').toLowerCase();
      var before = currentValue(el), caret = before.length;
      try { if (!el.isContentEditable && el.selectionStart != null) caret = el.selectionStart; } catch (e) { /* ignore */ }
      var left = before.slice(0, caret);
      // Capital letter at the start of a sentence
      if (!(isInput && el.type === 'email') && (!left.trim() || /[.!?]\s*$|\n\s*$/.test(left))) t = t.charAt(0).toUpperCase() + t.slice(1);
      var space = left && !/[\s\n(“"]$/.test(left) && !/^[.,?!:;)\n”]/.test(t) ? ' ' : '';
      if (isInput && el.type === 'email') space = '';
      insertText(el, space + t);
      this.lastIns = { el: el, before: before, after: currentValue(el) };
    },
    punctuate: function (t) {
      var self = this;
      PUNCT.forEach(function (p) {
        self.variants(p[0]).forEach(function (v) {
          var esc2 = v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          t = t.replace(new RegExp('(^|\\s)' + esc2 + '(?=\\s|$)', 'gi'), p[2] ? '$1' + p[1] : p[1]);
        });
      });
      // Tidy spaces around punctuation and capitalise new sentences
      t = t.replace(/\s+([.,?!:;)”])/g, '$1').replace(/([(“])\s+/g, '$1').replace(/ *\n */g, '\n');
      return t.replace(/([.!?]\s+|\n)([a-zà-ɏ])/g, function (m, a, b) { return a + b.toUpperCase(); }).replace(/^ +| +$/g, '');
    },
    undo: function () {
      var l = this.lastIns, el = lastEditable;
      if (l && l.el === el && currentValue(el) === l.after) { if (el.isContentEditable) el.textContent = l.before; else setValue(el, l.before); this.lastIns = null; return; }
      deleteWord(el);
    },
    field: function (d) {
      var all = Array.prototype.filter.call(document.querySelectorAll(FIELDS), function (x) { return !isOurs(x) && visible(x) && isEditable(x); });
      if (!all.length) return;
      var i = all.indexOf(lastEditable);
      var next = all[(i + d + all.length) % all.length];
      focusEl(next);
      lastEditable = next;
      UI.pill('');
    },
    send: function () {
      var el = lastEditable, f = el && el.form;
      if (!f) { if (el) pressEnter(el); return; }
      if (f.requestSubmit) f.requestSubmit(); else f.submit();
    },
    showNumbers: function () {
      this.hideNumbers();
      var layer = $('.nums'), list = this.clickables().slice(0, 99), html = '';
      this.numbers = list;
      list.forEach(function (el, i) {
        var r = el.getBoundingClientRect();
        html += '<span class="num" data-x="' + Math.round(clamp(r.left, 2, vw() - 30)) + '" data-y="' + Math.round(clamp(r.top, 2, vh() - 24)) + '">' + (i + 1) + '</span>';
      });
      layer.innerHTML = html;
      $$('.num', layer).forEach(function (n) { n.style.transform = 'translate(' + n.getAttribute('data-x') + 'px,' + n.getAttribute('data-y') + 'px)'; });
      layer.hidden = false;
      var self = this;
      var off = function () { self.hideNumbers(); window.removeEventListener('scroll', off, true); };
      window.addEventListener('scroll', off, true);
    },
    hideNumbers: function () { this.numbers = []; var l = $('.nums'); if (l) { l.innerHTML = ''; l.hidden = true; } }
  };
  var FIELDS = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]),select,textarea,[contenteditable="true"],[contenteditable=""]';
  // Spoken punctuation: [what you say, what is typed, keep the space before]
  var PUNCT = [
    ['new paragraph', '\n\n'], ['new line', '\n'], ['next line', '\n'],
    ['full stop', '.'], ['period', '.'], ['question mark', '?'], ['exclamation mark', '!'], ['exclamation point', '!'],
    ['semicolon', ';'], ['colon', ':'], ['comma', ','], ['dash', ' -', 1], ['hyphen', '-'],
    ['open quote', '“', 1], ['close quote', '”'], ['open bracket', '(', 1], ['close bracket', ')']
  ];
  function searchPage(words) {
    var box = document.querySelector('input[type="search"],input[name="q"],input[name="s"],input[name*="search" i],input[placeholder*="search" i]');
    if (!box) { UI.pill(words, false, T('This page has no search box')); return; }
    focusEl(box); setValue(box, words);
    if (box.form) { if (box.form.requestSubmit) box.form.requestSubmit(); else box.form.submit(); }
  }


  /* ------------------------------------------------------------------ *
   * 16. Text insertion (on-screen keyboard and Talk & Type)
   * ------------------------------------------------------------------ */
  function valueSetter(el) {
    var proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    var d = Object.getOwnPropertyDescriptor(proto, 'value');
    return d && d.set;
  }
  function currentValue(el) { if (!el) return ''; return el.isContentEditable ? (el.textContent || '') : (el.value || ''); }
  function setValue(el, v) {
    var set = valueSetter(el);
    if (set) set.call(el, v); else el.value = v;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function insertText(el, text) {
    if (!el || !el.isConnected) return false;
    if (el.isContentEditable) {
      try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
      if (!document.execCommand('insertText', false, text)) el.textContent += text;
      return true;
    }
    if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') return false;
    try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
    var v = el.value, s = null, e2 = null;
    try { s = el.selectionStart; e2 = el.selectionEnd; } catch (x) { s = null; }
    var set = valueSetter(el);
    if (s === null || s === undefined) { set.call(el, v + text); }
    else { set.call(el, v.slice(0, s) + text + v.slice(e2)); try { el.setSelectionRange(s + text.length, s + text.length); } catch (x) { /* ignore */ } }
    el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
    return true;
  }
  function backspace(el) {
    if (!el || !el.isConnected) return;
    if (el.isContentEditable) { el.focus(); document.execCommand('delete'); return; }
    var v = el.value, s = null, e2 = null;
    try { s = el.selectionStart; e2 = el.selectionEnd; } catch (x) { s = null; }
    var set = valueSetter(el);
    if (s === null || s === undefined) set.call(el, v.slice(0, -1));
    else if (s !== e2) { set.call(el, v.slice(0, s) + v.slice(e2)); el.setSelectionRange(s, s); }
    else if (s > 0) { set.call(el, v.slice(0, s - 1) + v.slice(s)); el.setSelectionRange(s - 1, s - 1); }
    el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'deleteContentBackward' }));
  }
  function deleteWord(el) {
    if (!el) return;
    if (el.isContentEditable) { el.textContent = (el.textContent || '').replace(/\s*\S+\s*$/, ''); return; }
    setValue(el, (el.value || '').replace(/\s*\S+\s*$/, ''));
  }
  function moveCaret(el, d) {
    if (!el || el.isContentEditable) return;
    try { var p = clamp(el.selectionStart + d, 0, el.value.length); el.setSelectionRange(p, p); el.focus(); } catch (e) { /* ignore */ }
  }
  function pressEnter(el) {
    if (!el) return;
    if (el.tagName === 'TEXTAREA' || el.isContentEditable) { insertText(el, '\n'); return; }
    var ev = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true });
    var ok = el.dispatchEvent(ev);
    el.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
    var f = el.form;
    if (ok && f) {
      var single = f.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"])').length === 1;
      if (f.querySelector('[type="submit"],button:not([type]),button[type="submit"]') || single) { if (f.requestSubmit) f.requestSubmit(); else f.submit(); }
    }
  }
  function focusNextField(el) {
    var all = Array.prototype.filter.call(document.querySelectorAll('input:not([type="hidden"]),select,textarea,button,a[href],[tabindex]:not([tabindex="-1"]),[contenteditable="true"]'), function (n) { return !isOurs(n) && visible(n) && !n.disabled; });
    var i = all.indexOf(el);
    var n = all[(i + 1) % all.length];
    if (n) { n.focus(); if (isEditable(n)) lastEditable = n; }
  }

  var VKB = {
    shift: false, caps: false, sym: false,
    rows: function () {
      if (this.sym) return [['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'], ['@', '#', '$', '&', '*', '(', ')', '-', "'", '"'], ['=', '%', '+', '!', '?', ',', '.', '/', ':', 'BKSP'], ['ABC', 'LEFT', 'SPACE', 'RIGHT', 'TAB', 'ENTER']];
      return [['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'], ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '-'], ['SHIFT', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '.', 'BKSP'], ['123', 'LEFT', 'SPACE', 'RIGHT', 'TAB', 'ENTER']];
    },
    render: function () {
      var up = this.shift || this.caps, html = '';
      var LABEL = { BKSP: ic('backspace'), SHIFT: ic('shift'), ENTER: ic('enter'), LEFT: ic('left'), RIGHT: ic('right'), SPACE: 'space', TAB: 'tab', '123': '123', ABC: 'abc' };
      var NAME = { BKSP: 'Backspace', SHIFT: 'Shift', ENTER: 'Enter', LEFT: 'Move left', RIGHT: 'Move right', SPACE: 'Space', TAB: 'Next field', '123': 'Numbers and symbols', ABC: 'Letters' };
      this.rows().forEach(function (row) {
        html += '<div class="krow">';
        row.forEach(function (k) {
          var special = LABEL[k] !== undefined;
          var ch = special ? LABEL[k] : esc(up ? k.toUpperCase() : k);
          var cls = 'key' + (special ? ' k-' + k.toLowerCase() : '') + (k === 'SHIFT' && up ? ' on' : '');
          html += '<button type="button" class="' + cls + '" data-k="' + esc(k) + '" aria-label="' + esc(special ? NAME[k] : (up ? k.toUpperCase() : k)) + '"' + (k === 'SHIFT' ? ' aria-pressed="' + up + '"' : '') + '>' + ch + '</button>';
        });
        html += '</div>';
      });
      $('.vkb-keys').innerHTML = html;
    },
    press: function (k) {
      var el = lastEditable;
      if (k === 'SHIFT') { if (this.shift && !this.caps) { this.caps = true; } else if (this.caps) { this.caps = false; this.shift = false; } else this.shift = true; this.render(); return; }
      if (k === '123') { this.sym = true; this.render(); return; }
      if (k === 'ABC') { this.sym = false; this.render(); return; }
      if (!el || !el.isConnected) { toast('Select a text field on the page first'); return; }
      if (k === 'BKSP') backspace(el);
      else if (k === 'ENTER') pressEnter(el);
      else if (k === 'LEFT') moveCaret(el, -1);
      else if (k === 'RIGHT') moveCaret(el, 1);
      else if (k === 'TAB') focusNextField(el);
      else {
        var ch = k === 'SPACE' ? ' ' : ((this.shift || this.caps) ? k.toUpperCase() : k);
        insertText(el, ch);
        if (this.shift && !this.caps) { this.shift = false; this.render(); }
      }
      UI.vkbTarget();
    },
    sync: function () {
      var box = $('.vkb');
      if (S.vkeyboard && box.hidden) { this.render(); box.hidden = false; UI.vkbTarget(); }
      else if (!S.vkeyboard && !box.hidden) box.hidden = true;
    }
  };

  /* ------------------------------------------------------------------ *
   * 17. Reader view, summary, dictionary
   * ------------------------------------------------------------------ */
  var KEEP = { H1: 1, H2: 1, H3: 1, H4: 1, H5: 1, H6: 1, P: 1, UL: 1, OL: 1, LI: 1, BLOCKQUOTE: 1, PRE: 1, CODE: 1, EM: 1, STRONG: 1, B: 1, I: 1, U: 1, A: 1, IMG: 1, FIGURE: 1, FIGCAPTION: 1, TABLE: 1, THEAD: 1, TBODY: 1, TFOOT: 1, TR: 1, TD: 1, TH: 1, CAPTION: 1, BR: 1, HR: 1, DL: 1, DT: 1, DD: 1, SUP: 1, SUB: 1, MARK: 1, ABBR: 1, Q: 1, CITE: 1, SMALL: 1, TIME: 1 };
  var DROP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, IFRAME: 1, FORM: 1, BUTTON: 1, INPUT: 1, SELECT: 1, TEXTAREA: 1, NAV: 1, ASIDE: 1, FOOTER: 1, SVG: 1, svg: 1, CANVAS: 1, VIDEO: 1, AUDIO: 1, OBJECT: 1, EMBED: 1, TEMPLATE: 1, DIALOG: 1, LINK: 1, META: 1 };
  var CLUTTER = /(^|[\s_-])(share|social|comment|related|advert|ads?|promo|cookie|newsletter|sidebar|breadcrumb|menu|popup|modal|banner|sponsor|subscribe|widget)([\s_-]|$)/i;

  function cleanCopy(src, depth) {
    var frag = document.createDocumentFragment();
    if (depth > 40) return frag;
    for (var n = src.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 3) { frag.appendChild(document.createTextNode(n.nodeValue)); continue; }
      if (n.nodeType !== 1 || isOurs(n) || DROP[n.tagName]) continue;
      if (n.getAttribute('aria-hidden') === 'true' || n.hidden) continue;
      var cls = (typeof n.className === 'string' ? n.className : '') + ' ' + (n.id || '');
      if (CLUTTER.test(cls) && textOf(n).length < 600) continue;
      if (n.tagName === 'HEADER' && depth > 0 && n.querySelector('nav')) continue;
      var cs = null;
      try { cs = getComputedStyle(n); } catch (e) { cs = null; }
      if (cs && (cs.display === 'none' || cs.visibility === 'hidden')) continue;
      if (KEEP[n.tagName]) {
        var el = document.createElement(n.tagName.toLowerCase());
        if (n.tagName === 'A') {
          var href = n.href || '';
          if (/^(https?:|mailto:|tel:)/i.test(href)) { el.setAttribute('href', href); el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener noreferrer'); }
        } else if (n.tagName === 'IMG') {
          var s = n.currentSrc || n.src || '';
          if (!/^(https?:|data:image\/)/i.test(s) || (n.naturalWidth && n.naturalWidth < 48)) continue;
          el.setAttribute('src', s);
          el.setAttribute('alt', n.getAttribute('alt') || '');
          el.setAttribute('loading', 'lazy');
        } else if (/^T[DH]$/.test(n.tagName)) {
          if (n.colSpan > 1) el.setAttribute('colspan', n.colSpan);
          if (n.rowSpan > 1) el.setAttribute('rowspan', n.rowSpan);
        }
        el.appendChild(cleanCopy(n, depth + 1));
        frag.appendChild(el);
      } else {
        // Unwrap containers (div, span, section…) but keep block separation
        var inner = cleanCopy(n, depth + 1);
        if (cs && /^(block|flex|grid|list-item|table)/.test(cs.display) && inner.childNodes.length) {
          var hasBlock = false;
          for (var c = inner.firstChild; c; c = c.nextSibling) if (c.nodeType === 1 && /^(P|H\d|UL|OL|TABLE|BLOCKQUOTE|PRE|FIGURE|DL|HR)$/.test(c.tagName)) { hasBlock = true; break; }
          if (!hasBlock && textOf({ innerText: n.innerText }).length) { var p = document.createElement('p'); p.appendChild(inner); frag.appendChild(p); continue; }
        }
        frag.appendChild(inner);
      }
    }
    return frag;
  }

  function mainText(main, noHeadings) {
    main = main || findMain();
    var parts = [];
    Array.prototype.forEach.call(main.querySelectorAll(noHeadings ? 'p,li,blockquote,dd,td,figcaption' : 'p,li,h1,h2,h3,h4,blockquote,dd,td,figcaption'), function (el) {
      if (isOurs(el) || el.closest('nav,footer,aside,form,[aria-hidden="true"]') || !visible(el)) return;
      if (el.querySelector('p,li')) return;
      var t = textOf(el);
      if (t.length > 1) parts.push(t);
    });
    return parts.length ? parts.join('\n') : textOf(main);
  }

  var STOP = ('a an the and or but if then so of to in on at by for with from as is are was were be been being it its this that these those there here we you he she they them our your their his her not no yes do does did have has had will would can could should may might must also than more most such into over under about after before between while which who whom what when where why how all any each few other some only own same just very i me my mine us').split(' ');
  var STOPSET = {};
  STOP.forEach(function (w) { STOPSET[w] = 1; });

  function extractiveSummary(text) {
    var sentences = (text.replace(/\s+/g, ' ').match(/[^.!?。！？]+[.!?。！？]+["'”’)\]]*|[^.!?。！？]+$/g) || [])
      .map(function (s) { return s.trim(); }).filter(function (s) { return s.length >= 40 && s.length <= 420; });
    if (!sentences.length) return [];
    var freq = {};
    sentences.forEach(function (s) {
      words(s.toLowerCase()).forEach(function (w) { if (w.length > 2 && !STOPSET[w]) freq[w] = (freq[w] || 0) + 1; });
    });
    var max = 1;
    Object.keys(freq).forEach(function (k) { if (freq[k] > max) max = freq[k]; });
    var scored = sentences.map(function (s, i) {
      var ws = words(s.toLowerCase());
      var sc = 0;
      ws.forEach(function (w) { if (freq[w]) sc += freq[w] / max; });
      sc = sc / Math.sqrt(ws.length || 1);
      if (i < 3) sc *= 1.25;
      return { s: s, i: i, sc: sc };
    });
    var n = clamp(Math.round(sentences.length / 6), 3, 7);
    var picked = scored.slice().sort(function (a, b) { return b.sc - a.sc; }).slice(0, n);
    // Drop near-duplicates
    var out = [];
    picked.sort(function (a, b) { return a.i - b.i; }).forEach(function (p) {
      var dup = out.some(function (o) { return o.s.slice(0, 50) === p.s.slice(0, 50); });
      if (!dup) out.push(p);
    });
    return out.map(function (p) { return p.s; });
  }

  function summarize() {
    var main = findMain();
    var text = mainText(main, true);
    var words = (text.match(/\S+/g) || []).length;
    var heads = Array.prototype.filter.call(main.querySelectorAll('h2,h3,h4'), function (h) { return visible(h) && !isOurs(h); }).map(textOf).filter(Boolean).slice(0, 8);
    var base = { words: words, minutes: Math.max(1, Math.round(words / 200)), headings: heads };
    function timeout(p, ms) { return Promise.race([p, new Promise(function (_, rej) { later(function () { rej(new Error('timeout')); }, ms); })]); }
    var attempt = null;
    if (CFG.summarizeProvider) {
      attempt = timeout(Promise.resolve(CFG.summarizeProvider(text.slice(0, 20000))), 20000);
    } else if (typeof window.Summarizer === 'function' || (window.Summarizer && window.Summarizer.availability)) {
      var okL = ['en', 'es', 'ja', 'de', 'fr'], ul = userLang().split('-')[0].toLowerCase(), pl = pageLang().split('-')[0].toLowerCase();
      var sOpts = { type: 'key-points', format: 'plain-text', length: 'medium', outputLanguage: okL.indexOf(ul) > -1 ? ul : 'en', expectedInputLanguages: [okL.indexOf(pl) > -1 ? pl : 'en'] };
      attempt = timeout(window.Summarizer.availability(sOpts).then(function (a) {
        if (a !== 'available') throw new Error('not ready');
        return window.Summarizer.create(sOpts);
      }).then(function (s) { return s.summarize(text.slice(0, 12000)); }), 15000);
    }
    if (!attempt) attempt = Promise.reject(new Error('none'));
    return attempt.then(function (res) {
      var points = Array.isArray(res) ? res : String(res || '').split(/\n+/);
      points = points.map(function (p) { return String(p).replace(/^\s*([-*•]|\d+[.)])\s*/, '').trim(); }).filter(Boolean);
      if (!points.length) throw new Error('empty');
      base.points = points; return base;
    }).catch(function () {
      base.points = extractiveSummary(text);
      return base;
    });
  }

  var Dict = {
    on: false, cache: {},
    sync: function () {
      if (S.dictionary && !this.on) { this.on = true; document.addEventListener('pointerup', this.onUp, true); document.addEventListener('keyup', this.onKeyUp, true); }
      else if (!S.dictionary && this.on) { this.on = false; document.removeEventListener('pointerup', this.onUp, true); document.removeEventListener('keyup', this.onKeyUp, true); UI.dict(null); }
    },
    word: function () {
      var sel = window.getSelection && window.getSelection();
      if (!sel || !sel.rangeCount || sel.isCollapsed) return null;
      // Grow a partial selection ("The Gr") to whole words ("The Green") before looking it up
      try {
        var rg = sel.getRangeAt(0), sc = rg.startContainer, ec = rg.endContainer;
        if (sc.nodeType === 3 && ec.nodeType === 3) {
          var so = rg.startOffset, eo = rg.endOffset;
          while (so > 0 && hasLetters(sc.nodeValue.charAt(so - 1) + 'a')) { if (!/[\s.,;:!?()"“”«»]/.test(sc.nodeValue.charAt(so - 1))) so--; else break; }
          while (eo < ec.nodeValue.length && !/[\s.,;:!?()"“”«»]/.test(ec.nodeValue.charAt(eo))) eo++;
          if (so !== rg.startOffset || eo !== rg.endOffset) { rg.setStart(sc, so); rg.setEnd(ec, eo); sel.removeAllRanges(); sel.addRange(rg); }
        }
      } catch (e) { /* keep the selection as it is */ }
      var w = String(sel).trim();
      if (!w || w.length > 40 || /\s{2,}/.test(w) || w.split(/\s+/).length > 3) return null;
      RE_EDGE_PUNCT.lastIndex = 0; w = w.replace(RE_EDGE_PUNCT, '');
      if (!w) return null;
      var r = sel.rangeCount ? sel.getRangeAt(0).getBoundingClientRect() : null;
      return { word: w, rect: r };
    },
    onDbl: function (e) { if (isOurs(e.target)) return; var w = Dict.word(); if (w) Dict.lookup(w.word, w.rect); },
    last: '', lastAt: 0,
    fromSelection: function () {
      var w = Dict.word();
      if (!w) return;
      if (w.word === Dict.last && Date.now() - Dict.lastAt < 1500) return;
      Dict.last = w.word; Dict.lastAt = Date.now();
      Dict.lookup(w.word, w.rect);
    },
    onUp: function (e) {
      if (isOurs(e.target) || isEditable(e.target)) return;
      later(Dict.fromSelection, e.pointerType === 'touch' ? 400 : 20);
    },
    onKeyUp: function (e) {
      if (isOurs(e.target) || isEditable(e.target) || e.key !== 'Shift') return;
      later(Dict.fromSelection, 20);
    },
    glossary: function (w) {
      var lw = w.toLowerCase();
      var g = CFG.glossary;
      if (g) { for (var k in g) if (k.toLowerCase() === lw) return { word: k, defs: [{ pos: 'Glossary', text: String(g[k]) }] }; }
      var abbr = Array.prototype.filter.call(document.querySelectorAll('abbr[title],dfn[title],acronym[title]'), function (a) { return textOf(a).toLowerCase() === lw; })[0];
      if (abbr) return { word: textOf(abbr), defs: [{ pos: 'On this page', text: abbr.getAttribute('title') }] };
      return null;
    },
    lookup: function (word, rect) {
      UI.dict({ word: word, loading: true }, rect);
      var local = this.glossary(word);
      if (local) { UI.dict(local, rect); return; }
      var key = word.toLowerCase();
      if (this.cache[key]) { UI.dict(this.cache[key], rect); return; }
      var lang = pageLang().split('-')[0].toLowerCase();
      var url = CFG.dictionaryUrl ? CFG.dictionaryUrl.replace('{word}', encodeURIComponent(word)).replace('{lang}', lang)
        : lang === 'en' ? 'https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(key) : '';
      var self = this;
      var wiki = function () {
        return fetch('https://' + lang + '.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(word)).then(function (r) { if (!r.ok) throw 0; return r.json(); })
          .then(function (j) { if (!j.extract || j.type === 'disambiguation') throw 0; return { word: j.title || word, defs: [{ pos: 'Encyclopedia', text: j.extract.slice(0, 420) }] }; });
      };
      var p = url ? fetch(url).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) {
        var e = Array.isArray(j) ? j[0] : j;
        if (!e || !e.meanings) throw 0;
        var defs = [];
        e.meanings.forEach(function (m) { (m.definitions || []).slice(0, 2).forEach(function (d) { if (defs.length < 4) defs.push({ pos: m.partOfSpeech || '', text: d.definition, ex: d.example || '' }); }); });
        if (!defs.length) throw 0;
        return { word: e.word || word, phonetic: e.phonetic || '', defs: defs };
      }).catch(wiki) : wiki();
      p.then(function (res) { self.cache[key] = res; if (self.on) UI.dict(res, rect); })
        .catch(function () { if (self.on) UI.dict({ word: word, defs: [], none: true }, rect); });
    }
  };
  Dict.onDbl = Dict.onDbl.bind(Dict); Dict.onUp = Dict.onUp.bind(Dict); Dict.onKeyUp = Dict.onKeyUp.bind(Dict);

  /* ------------------------------------------------------------------ *
   * 18. Translation
   * ------------------------------------------------------------------ */
  // Languages offered by Google Translate: [code, English name, native name]
  var LANGS = [['af','Afrikaans'],['sq','Albanian','Shqip'],['am','Amharic','አማርኛ'],['ar','Arabic','العربية'],['hy','Armenian','Հայերեն'],['as','Assamese','অসমীয়া'],['ay','Aymara'],['az','Azerbaijani','Azərbaycanca'],
    ['bm','Bambara'],['eu','Basque','Euskara'],['be','Belarusian','Беларуская'],['bn','Bengali','বাংলা'],['bho','Bhojpuri'],['bs','Bosnian','Bosanski'],['bg','Bulgarian','Български'],['ca','Catalan','Català'],['ceb','Cebuano'],
    ['ny','Chichewa'],['zh-CN','Chinese (Simplified)','简体中文'],['zh-TW','Chinese (Traditional)','繁體中文'],['co','Corsican','Corsu'],['hr','Croatian','Hrvatski'],['cs','Czech','Čeština'],['da','Danish','Dansk'],
    ['dv','Dhivehi'],['doi','Dogri'],['nl','Dutch','Nederlands'],['en','English'],['eo','Esperanto'],['et','Estonian','Eesti'],['ee','Ewe'],['tl','Filipino'],['fi','Finnish','Suomi'],['fr','French','Français'],
    ['fy','Frisian','Frysk'],['gl','Galician','Galego'],['ka','Georgian','ქართული'],['de','German','Deutsch'],['el','Greek','Ελληνικά'],['gn','Guarani'],['gu','Gujarati','ગુજરાતી'],['ht','Haitian Creole','Kreyòl ayisyen'],
    ['ha','Hausa'],['haw','Hawaiian'],['iw','Hebrew','עברית'],['hi','Hindi','हिन्दी'],['hmn','Hmong'],['hu','Hungarian','Magyar'],['is','Icelandic','Íslenska'],['ig','Igbo'],['ilo','Ilocano'],['id','Indonesian','Bahasa Indonesia'],
    ['ga','Irish','Gaeilge'],['it','Italian','Italiano'],['ja','Japanese','日本語'],['jw','Javanese','Basa Jawa'],['kn','Kannada','ಕನ್ನಡ'],['kk','Kazakh','Қазақша'],['km','Khmer','ខ្មែរ'],['rw','Kinyarwanda','Ikinyarwanda'],
    ['gom','Konkani'],['ko','Korean','한국어'],['kri','Krio'],['ku','Kurdish (Kurmanji)','Kurdî'],['ckb','Kurdish (Sorani)','کوردی'],['ky','Kyrgyz','Кыргызча'],['lo','Lao','ລາວ'],['la','Latin','Latina'],['lv','Latvian','Latviešu'],
    ['ln','Lingala'],['lt','Lithuanian','Lietuvių'],['lg','Luganda'],['lb','Luxembourgish','Lëtzebuergesch'],['mk','Macedonian','Македонски'],['mai','Maithili'],['mg','Malagasy'],['ms','Malay','Bahasa Melayu'],
    ['ml','Malayalam','മലയാളം'],['mt','Maltese','Malti'],['mi','Maori','Māori'],['mr','Marathi','मराठी'],['mni-Mtei','Meiteilon (Manipuri)'],['lus','Mizo'],['mn','Mongolian','Монгол'],['my','Myanmar (Burmese)','မြန်မာ'],
    ['ne','Nepali','नेपाली'],['no','Norwegian','Norsk'],['or','Odia (Oriya)','ଓଡ଼ିଆ'],['om','Oromo','Afaan Oromoo'],['ps','Pashto','پښتو'],['fa','Persian','فارسی'],['pl','Polish','Polski'],['pt','Portuguese','Português'],
    ['pa','Punjabi','ਪੰਜਾਬੀ'],['qu','Quechua','Runasimi'],['ro','Romanian','Română'],['ru','Russian','Русский'],['sm','Samoan'],['sa','Sanskrit','संस्कृतम्'],['gd','Scots Gaelic','Gàidhlig'],['nso','Sepedi'],['sr','Serbian','Српски'],
    ['st','Sesotho'],['sn','Shona'],['sd','Sindhi','سنڌي'],['si','Sinhala','සිංහල'],['sk','Slovak','Slovenčina'],['sl','Slovenian','Slovenščina'],['so','Somali','Soomaali'],['es','Spanish','Español'],['su','Sundanese'],
    ['sw','Swahili','Kiswahili'],['sv','Swedish','Svenska'],['tg','Tajik','Тоҷикӣ'],['ta','Tamil','தமிழ்'],['tt','Tatar','Татарча'],['te','Telugu','తెలుగు'],['th','Thai','ไทย'],['ti','Tigrinya','ትግርኛ'],['ts','Tsonga'],
    ['tr','Turkish','Türkçe'],['tk','Turkmen','Türkmençe'],['ak','Twi'],['uk','Ukrainian','Українська'],['ur','Urdu','اردو'],['ug','Uyghur','ئۇيغۇرچە'],['uz','Uzbek','Oʻzbekcha'],['vi','Vietnamese','Tiếng Việt'],
    ['cy','Welsh','Cymraeg'],['xh','Xhosa','isiXhosa'],['yi','Yiddish','ייִדיש'],['yo','Yoruba','Yorùbá'],['zu','Zulu','isiZulu']];
  function langOptions(origLabel) {
    return [{ v: '', l: origLabel || 'Original language' }].concat(LANGS.map(function (l) { return { v: l[0], l: l[2] || l[1], s: l[2] ? l[1] : '', k: l[0] }; }));
  }
  var RTL_LANGS = /^(ar|iw|he|fa|ur|ps|sd|ug|yi|ckb|dv)(-|$)/i;
  function langName(code) { for (var i = 0; i < LANGS.length; i++) if (LANGS[i][0] === code) return LANGS[i][2] || LANGS[i][1]; return code; }

  // Google Translate for individual strings (the panel's own text and help descriptions)
  function googleText(list, tl, onProgress, sl) {
    var batches = [], cur = [], len = 0;
    list.forEach(function (t) { if (len + t.length > 1400 && cur.length) { batches.push(cur); cur = []; len = 0; } cur.push(t); len += t.length + 1; });
    if (cur.length) batches.push(cur);
    function one(batch) {
      var url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=' + encodeURIComponent(sl || 'en') + '&tl=' + encodeURIComponent(tl) + '&dt=t&q=' + encodeURIComponent(batch.join('\n'));
      return fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (j) {
        var out = ((j && j[0]) || []).map(function (seg) { return seg[0] || ''; }).join('').split('\n');
        if (out.length !== batch.length) {
          if (batch.length === 1) return [out.join(' ').trim()];
          return Promise.all(batch.map(function (t) { return one([t]).then(function (o) { return o[0]; }); }));
        }
        return out.map(function (t) { return t.trim(); });
      });
    }
    var done = 0;
    return batches.reduce(function (p, b) {
      return p.then(function (acc) { return one(b).then(function (o) { done++; if (onProgress) onProgress(done / batches.length); return acc.concat(o); }); });
    }, Promise.resolve([]));
  }

  // Translates the panel's own interface into the visitor's chosen language
  var I18N = {
    lang: '', cache: {}, pending: {}, busy: false, nodes: new WeakMap(), attrs: new WeakMap(), failed: false, timer: 0,
    load: function () { try { this.cache = JSON.parse(window.sessionStorage.getItem(KEY + '.i18n') || '{}') || {}; } catch (e) { this.cache = {}; } },
    persist: function () { try { window.sessionStorage.setItem(KEY + '.i18n', JSON.stringify(this.cache)); } catch (e) { /* full or blocked */ } },
    set: function (lang) {
      this.lang = lang && !/^en(-|$)/i.test(lang) ? lang : '';
      this.failed = false;
      if (R) R.setAttribute('dir', lang && RTL_LANGS.test(lang) ? 'rtl' : (document.documentElement.getAttribute('dir') === 'rtl' && !Dir.cur ? 'rtl' : 'ltr'));
      if (R) this.apply(R);
    },
    tr: function (s) {
      if (!this.lang || !s || !hasLetters(s)) return s;
      var c = this.cache[this.lang] || (this.cache[this.lang] = {});
      if (c[s] != null) return c[s];
      this.queue(s);
      return s;
    },
    queue: function (s) {
      if (this.failed && Date.now() - this.failed < 20000) return;
      this.pending[s] = 1;
      var self = this;
      cancel(this.timer);
      this.timer = later(function () { self.flush(); }, 60);
    },
    flush: function () {
      if (this.busy) return;
      var lang = this.lang, list = Object.keys(this.pending);
      if (!lang || !list.length) return;
      this.pending = {};
      this.busy = true;
      var self = this;
      // Small batches so one failed request only affects a few strings; failures are retried once
      var groups = [];
      for (var g = 0; g < list.length; g += 25) groups.push(list.slice(g, g + 25));
      var done = 0;
      var c = self.cache[lang] || (self.cache[lang] = {});
      var runGroup = function (grp, retry) {
        return googleText(grp, lang).then(function (out) { grp.forEach(function (s, i) { if (out[i]) c[s] = out[i]; }); })
          .catch(function () { if (!retry) return runGroup(grp, true); self.failed = Date.now(); });
      };
      groups.reduce(function (p, grp) {
        return p.then(function () { return runGroup(grp).then(function () { done++; Translate.uiProgress = done / groups.length; UI.translateWait(); if (self.lang === lang && R) self.apply(R); }); });
      }, Promise.resolve()).then(function () { self.persist(); }).then(function () {
        self.busy = false;
        Translate.uiProgress = 1;
        if (self.lang === lang && R) self.apply(R);
        UI.translateWait();
        if (Object.keys(self.pending).length) self.flush();
      });
    },
    skip: function (el) { return !el || (el.closest && el.closest('[translate="no"],.vkb-keys,.rbody,.lens,.tip,.num,.help-text')); },
    apply: function (root) {
      if (!root) return;
      var self = this, on = !!this.lang;
      var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n;
      while ((n = w.nextNode())) {
        if (self.skip(n.parentElement)) continue;
        var rec = self.nodes.get(n);
        if (!rec || n.nodeValue !== rec.t) { if (!on) { if (rec) self.nodes.delete(n); continue; } rec = { o: n.nodeValue }; }
        var raw = rec.o, core = raw.trim();
        if (!core || !hasLetters(core)) continue;
        var val = on ? raw.replace(core, self.tr(core)) : raw;
        if (n.nodeValue !== val) n.nodeValue = val;
        rec.t = val;
        self.nodes.set(n, rec);
      }
      Array.prototype.forEach.call(root.querySelectorAll('[aria-label],[placeholder],[title]'), function (el) {
        if (self.skip(el)) return;
        var map = self.attrs.get(el) || {};
        ['aria-label', 'placeholder', 'title'].forEach(function (a) {
          var v = el.getAttribute(a);
          if (v == null) return;
          var rec = map[a];
          if (!rec || v !== rec.t) rec = map[a] = { o: v };
          var val = on ? self.tr(rec.o) : rec.o;
          if (v !== val) el.setAttribute(a, val);
          rec.t = val;
        });
        self.attrs.set(el, map);
      });
    }
  };
  function T(s) { return I18N.tr(s); }

  // Page translation: always Google's website translator, with no Google interface shown
  var Translate = {
    engine: '', busy: false, target: '', progress: 0, uiProgress: 1, scriptAdded: false, seq: 0, error: '', ready: null,
    pageLang: function () { var l = (document.documentElement.getAttribute('lang') || '').split('-')[0].toLowerCase(); return l || 'auto'; },
    isTranslated: function () { var h = document.documentElement; return h.classList.contains('translated-ltr') || h.classList.contains('translated-rtl'); },
    // One call does the whole job: the panel and the page are translated together, or neither is
    run: function (target, quiet) {
      var self = this, seq = ++this.seq, prev = S.translateTo || '';
      var src = this.pageLang();
      if (target && src !== 'auto' && target.split('-')[0].toLowerCase() === src) target = '';
      this.target = target; this.error = '';
      setState('translateTo', target, true);
      I18N.set(target);
      if (!target) return this.restore();
      this.busy = true; this.progress = 0;
      UI.translateWait();
      var attempt = 0;
      var go = function () {
        attempt++;
        return self.google(target).then(function () { return self.waitDone(target, seq); }).then(function (ok) {
          if (seq !== self.seq) return;
          // Google sometimes ignores the first request: ask again, up to three times
          if (!ok && attempt < 3) return go();
          if (!ok) throw new Error('timeout');
          self.busy = false; self.progress = 1; UI.translateWait(true);
        });
      };
      return go().catch(function (err) {
        if (seq !== self.seq) return;
        var why = String(err && err.message || err);
        self.busy = false;
        self.error = why === 'language not offered' ? 'This language is not available for this page.' :
          why === 'blocked' ? 'The translation service could not be reached. It may be blocked on this website, or you may be offline.' :
          'The translation service did not answer. Please try again.';
        // Keep the panel and the page in the same language
        self.target = prev; setState('translateTo', prev, true); I18N.set(prev);
        UI.translateWait(false);
        if (!quiet) toast(T(self.error));
      });
    },
    // Progress is estimated from how many text blocks Google has already rewritten
    measure: function () {
      var total = 0, done = 0;
      var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null), n, seen = 0;
      while ((n = w.nextNode()) && seen < 4000) {
        var p = n.parentElement;
        if (!p || isOurs(p) || SKIP_TAGS[p.tagName] || !hasLetters(n.nodeValue)) continue;
        seen++; total++;
        if (p.closest('font')) done++;
      }
      return total ? done / total : 1;
    },
    waitDone: function (target, seq) {
      var self = this;
      return new Promise(function (resolve) {
        var tries = 0, last = -1, still = 0;
        var t = nativeSetInterval.call(window, function () {
          if (seq !== self.seq) { clearInterval(t); resolve(true); return; }
          var flagged = self.isTranslated();
          var p = self.measure();
          self.progress = Math.max(self.progress, Math.min(0.99, flagged ? p : p * 0.5));
          UI.translateWait();
          if (Math.abs(p - last) < 0.005) still++; else still = 0;
          last = p;
          tries++;
          if (flagged && (p > 0.9 || still > 6)) { clearInterval(t); resolve(true); }
          else if (!flagged && tries > 20) { clearInterval(t); resolve(false); }      // nothing happened in 4 s
          else if (tries > 120) { clearInterval(t); resolve(flagged); }
        }, 200);
      });
    },
    // Loads Google's page translator once; every later call reuses it
    load: function () {
      var self = this;
      if (this.ready) return this.ready;
      this.ensureBox();
      this.ready = new Promise(function (resolve, reject) {
        var make = function () {
          try { new window.google.translate.TranslateElement({ pageLanguage: self.pageLang(), autoDisplay: false }, 'acc-gt-box'); } catch (e) { reject(e); return; }
          var tries = 0;
          var poll = nativeSetInterval.call(window, function () {
            var combo = document.querySelector('select.goog-te-combo');
            if (combo && combo.options.length > 1) { clearInterval(poll); self.engine = 'google'; resolve(combo); }
            else if (++tries > 120) { clearInterval(poll); reject(new Error('timeout')); }
          }, 125);
        };
        var G = window.google && window.google.translate;
        if (G && G.TranslateElement) {
          var have = document.querySelector('select.goog-te-combo');
          if (have && have.options.length > 1) { self.engine = 'google'; resolve(have); } else make();
          return;
        }
        window.__accessiblesGT = make;
        var sc = document.createElement('script');
        sc.src = 'https://translate.google.com/translate_a/element.js?cb=__accessiblesGT';
        sc.async = true;
        sc.onerror = function () { sc.remove(); reject(new Error('blocked')); };
        (document.head || document.documentElement).appendChild(sc);
        later(function () { reject(new Error('timeout')); }, 20000);
      });
      // A failed load can be tried again on the next request
      this.ready.catch(function () { self.ready = null; });
      return this.ready;
    },
    google: function (target) {
      var self = this;
      return this.load().then(function () {
        var combo = document.querySelector('select.goog-te-combo');
        if (!combo) { self.ready = null; throw new Error('timeout'); }
        var has = Array.prototype.some.call(combo.options, function (o) { return o.value === target; });
        if (!has) throw new Error('language not offered');
        // The cookie makes Google keep the language on the next pages too
        var cv = '/' + (self.pageLang() === 'auto' ? 'auto' : self.pageLang()) + '/' + target;
        try { document.cookie = 'googtrans=' + cv + ';path=/'; } catch (e) { /* ignore */ }
        if (combo.value === target && self.isTranslated()) combo.value = '';
        combo.value = target;
        var ev;
        try { ev = new Event('change', { bubbles: true }); } catch (e) { ev = document.createEvent('HTMLEvents'); ev.initEvent('change', true, true); }
        combo.dispatchEvent(ev);
        lastCSS = ''; scheduleApply();
      });
    },
    ensureBox: function () {
      if (document.getElementById('acc-gt-box')) return;
      var d = document.createElement('div');
      d.id = 'acc-gt-box';
      d.setAttribute('aria-hidden', 'true');
      d.style.cssText = 'position:absolute!important;left:-9999px!important;top:0!important;width:1px!important;height:1px!important;overflow:hidden!important';
      document.body.appendChild(d);
    },
    restore: function () {
      this.busy = false;
      UI.translateWait();
      if (!this.engine) return Promise.resolve();
      var restored = false;
      Array.prototype.forEach.call(document.querySelectorAll('iframe.skiptranslate,iframe.goog-te-banner-frame,iframe[id^=":"]'), function (f) {
        if (restored) return;
        try { var b = f.contentDocument && f.contentDocument.querySelector('[id$=".restore"],button[id*="restore"]'); if (b) { b.click(); restored = true; } } catch (e) { /* cross-origin */ }
      });
      if (!restored) {
        var combo = document.querySelector('select.goog-te-combo'), src = this.pageLang();
        if (combo) {
          var ok = Array.prototype.some.call(combo.options, function (o) { return o.value === src; });
          combo.value = ok ? src : '';
          combo.dispatchEvent(new Event('change'));
        }
      }
      ['', ';domain=' + location.hostname, ';domain=.' + location.hostname.replace(/^www\./, '')].forEach(function (d) { document.cookie = 'googtrans=;path=/;max-age=0' + d; });
      later(function () {
        var html = document.documentElement;
        if (html.classList.contains('translated-ltr') || html.classList.contains('translated-rtl')) location.reload();
      }, 900);
      return Promise.resolve();
    }
  };

  /* ------------------------------------------------------------------ *
   * 19. Sign language
   * ------------------------------------------------------------------ */
  var Sign = {
    mode: '', rec: new Recorder(), wrap: null, scriptState: '', waitT: 0,
    // What each service is doing right now, shown under its switch: off, loading, on, warn or error
    st: {
      asl: { s: 'off', msg: 'Off. Turn on to watch sign language videos for parts of this page.' },
      libras: { s: 'off', msg: 'Off. Turn on to add a Libras interpreter to this page.' }
    },
    report: function (kind, state, msg, tell) {
      this.st[kind] = { s: state, msg: msg };
      UI.signStatus(kind);
      if (tell) toast(T(msg));
    },
    sync: function () {
      if (S.sign === this.mode) return;
      var was = this.mode;
      this.mode = S.sign;
      if (was === 'asl') {
        this.rec.revert(); document.removeEventListener('click', this.onClick, true); UI.signPlayer(null);
        this.report('asl', 'off', 'Off. Sign language videos are no longer offered on this page.', !S.sign);
      }
      if (was === 'libras') this.removeLibras();
      if (S.sign === 'asl') return this.asl();
      if (S.sign === 'libras') return this.loadLibras();
    },
    asl: function () {
      var rec = this.rec;
      if (CFG.signVideos) Object.keys(CFG.signVideos).forEach(function (sel) {
        try { Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) { if (!el.hasAttribute('data-acc-sign')) rec.set(el, 'data-acc-sign', CFG.signVideos[sel]); }); } catch (e) { /* bad selector */ }
      });
      Array.prototype.forEach.call(document.querySelectorAll('[data-acc-sign],[data-sign-video]'), function (el) { rec.set(el, 'data-acc-signable', ''); if (!el.hasAttribute('tabindex') && !el.matches('a,button')) rec.set(el, 'tabindex', '0'); });
      document.addEventListener('click', this.onClick, true);
      var n = this.count();
      if (n) this.report('asl', 'on', 'On. ' + n + (n === 1 ? ' part' : ' parts') + ' of this page have a sign language video. Click a marked part to watch it.', true);
      else if (CFG.signProvider) this.report('asl', 'on', 'On. Select some text, then press the button below to see it signed.', true);
      else this.report('asl', 'warn', 'On, but this page has no sign language videos yet.', true);
    },
    count: function () { return document.querySelectorAll('[data-acc-sign],[data-sign-video]').length; },
    onClick: function (e) {
      if (isOurs(e.target)) return;
      var el = e.target.closest && e.target.closest('[data-acc-sign],[data-sign-video]');
      if (!el) return;
      var src = el.getAttribute('data-acc-sign') || el.getAttribute('data-sign-video');
      if (src) { e.preventDefault(); UI.signPlayer(src, textOf(el).slice(0, 80)); }
    },
    provide: function () {
      var sel = String(window.getSelection ? window.getSelection() : '').trim() || mainText().slice(0, 600);
      if (!CFG.signProvider) return;
      UI.signPlayer('loading');
      Promise.resolve(CFG.signProvider(sel, S.sign || 'asl')).then(function (url) { if (url) UI.signPlayer(url, sel.slice(0, 80)); else throw 0; })
        .catch(function () { UI.signPlayer(null); toast(T('No sign language video is available for this text')); });
    },
    // The website may already include the Libras plugin itself
    nativeLibras: function () { return document.querySelector('[vw]:not([data-acc-libras])'); },
    loadLibras: function () {
      var self = this;
      if (this.nativeLibras()) { this.report('libras', 'on', 'On. This website already has Libras. Use its blue hand button at the side of the page.', true); return; }
      this.report('libras', 'loading', 'Loading the Libras service…');
      var wrap = this.wrap = document.createElement('div');
      wrap.setAttribute('vw', ''); wrap.setAttribute('data-acc-libras', ''); wrap.className = 'enabled';
      wrap.innerHTML = '<div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
      document.body.appendChild(wrap);
      return new Promise(function (resolve) {
        var fail = function (msg) {
          if (self.wrap !== wrap) { resolve(); return; }
          self.removeLibras(true);
          self.report('libras', 'error', msg, true);
          if (S.sign === 'libras') { self.mode = ''; setState('sign', '', true); }
          resolve();
        };
        var init = function () {
          if (self.wrap !== wrap) { resolve(); return; }
          try {
            var prev = window.onload;
            new window.VLibras.Widget('https://vlibras.gov.br/app');
            if (document.readyState === 'complete' && window.onload && window.onload !== prev) { var fn = window.onload; window.onload = prev; fn(); }
          } catch (e) { fail('The Libras service could not start on this page. Please try again later.'); return; }
          // Ready when the plugin has drawn its button
          var t0 = Date.now();
          var check = function () {
            if (self.wrap !== wrap) { resolve(); return; }
            if (wrap.querySelector('[vw-access-button] *, img')) {
              self.report('libras', 'on', 'On. Libras is ready. Press the blue hand button at the side of the page, then select any text.', true);
              resolve(); return;
            }
            UI.progress(Math.min(0.95, 0.5 + (Date.now() - t0) / 24000));
            if (Date.now() - t0 > 12000) { fail('The Libras service did not answer. Check your internet connection and try again.'); return; }
            self.waitT = later(check, 300);
          };
          check();
        };
        if (window.VLibras && window.VLibras.Widget) { init(); return; }
        if (self.scriptState === 'error') { fail('The Libras service could not be reached. It may be blocked on this website, or you may be offline.'); return; }
        UI.progress(0.2);
        var sc = document.createElement('script');
        sc.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
        sc.async = true; sc.setAttribute('data-accessibles', '');
        sc.onload = function () { self.scriptState = 'ok'; UI.progress(0.5); init(); };
        sc.onerror = function () { self.scriptState = 'error'; sc.remove(); fail('The Libras service could not be reached. It may be blocked on this website, or you may be offline.'); };
        document.head.appendChild(sc);
      });
    },
    // Turning Libras off removes its button and window from the page
    removeLibras: function (quiet) {
      cancel(this.waitT);
      var w = this.wrap;
      this.wrap = null;
      if (w) w.remove();
      Array.prototype.forEach.call(document.querySelectorAll('[data-acc-libras],[vw-plugin-wrapper]:not([vw]:not([data-acc-libras]) *)'), function (el) { if (!isOurs(el)) el.remove(); });
      if (!quiet) this.report('libras', 'off', 'Off. The Libras button was removed from the page.', !S.sign);
    }
  };
  Sign.onClick = Sign.onClick.bind(Sign);

  /* ------------------------------------------------------------------ *
   * 20. Page check (compliance monitoring) and usage analytics
   * ------------------------------------------------------------------ */
  function effectiveBg(el) {
    var n = el;
    while (n && n.nodeType === 1) {
      var cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return null;
      var m = /rgba?\(([^)]+)\)/.exec(cs.backgroundColor);
      if (m) {
        var p = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat);
        if (p.length < 4 || p[3] > 0.9) return [p[0], p[1], p[2]];
      }
      n = n.parentElement;
    }
    return [255, 255, 255];
  }

  function auditSteps() {
    var out = [];
    var all = function (sel) { return Array.prototype.filter.call(document.querySelectorAll(sel), function (el) { return !isOurs(el); }); };
    var fixed = function (el, k) { return (' ' + (el.getAttribute('data-acc-fixed') || '') + ' ').indexOf(' ' + k + ' ') > -1; };
    function check(id, label, weight, offenders, fixedCount, help) { out.push({ id: id, label: label, weight: weight, open: offenders, fixed: fixedCount || 0, help: help }); }
    var hs = [];
    var steps = [
      function () { var imgs = all('img'); check('alt', 'Images have text alternatives', 3, imgs.filter(function (i) { return !i.hasAttribute('alt'); }), imgs.filter(function (i) { return fixed(i, 'alt'); }).length, 'Add alt text to every meaningful image, alt="" for decorative ones.'); },
      function () { var fields = all('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="image"]):not([type="reset"]),select,textarea'); check('labels', 'Form fields have labels', 3, fields.filter(function (f) { return !accName(f) && !(f.getAttribute('placeholder') || '').trim(); }), fields.filter(function (f) { return fixed(f, 'form'); }).length, 'Connect a label to every input.'); },
      function () { var ctrls = all('a[href],button,[role="button"]'); check('names', 'Links and buttons have names', 3, ctrls.filter(function (c) { return visible(c) && !accName(c); }), ctrls.filter(function (c) { return fixed(c, 'aria'); }).length, 'Give icon-only links and buttons a text label.'); },
      function () {
        hs = all('h1,h2,h3,h4,h5,h6').filter(visible);
        var skips = [], last = 0;
        hs.forEach(function (h) { var l = +h.tagName.charAt(1); if (last && l > last + 1) skips.push(h); last = l; });
        check('headings', 'Heading levels are in order', 1, skips, 0, 'Do not skip heading levels, for example from H2 to H4.');
        check('emptyHeadings', 'Headings are not empty', 1, hs.filter(function (h) { return !textOf(h); }), 0, 'Remove empty headings or give them text.');
        var h1 = hs.filter(function (h) { return h.tagName === 'H1'; });
        check('h1', 'Page has one main heading', 1, h1.length === 1 ? [] : h1.length ? h1.slice(1) : [document.body], 0, 'Use exactly one H1 that describes the page.');
      },
      function () {
        check('lang', 'Page language is set', 2, document.documentElement.getAttribute('lang') ? [] : [document.documentElement], 0, 'Add a lang attribute to the html element.');
        check('title', 'Page has a title', 1, (document.title || '').trim() ? [] : [document.documentElement], 0, 'Add a descriptive page title.');
        var frames = all('iframe');
        check('frames', 'Frames have titles', 1, frames.filter(function (f) { return !f.getAttribute('title') && !f.getAttribute('aria-label'); }), frames.filter(function (f) { return fixed(f, 'aria'); }).length, 'Add a title attribute to every iframe.');
        check('landmark', 'Page has a main landmark', 1, document.querySelector('main,[role="main"]') ? [] : [document.body], document.querySelector('[role="main"][data-acc-fixed]') ? 1 : 0, 'Wrap the main content in a main element.');
      },
      function () {
        var ids = {}, dups = [];
        all('[id]').forEach(function (el) { if (ids[el.id]) dups.push(el); else ids[el.id] = 1; });
        check('ids', 'IDs are unique', 1, dups, 0, 'Each id value should appear only once.');
        check('tabindex', 'No positive tabindex', 1, all('[tabindex]').filter(function (el) { return parseInt(el.getAttribute('tabindex'), 10) > 0; }), 0, 'Use tabindex 0 or -1 only.');
        var vp = document.querySelector('meta[name="viewport"]'), vpc = vp ? (vp.getAttribute('content') || '') : '';
        var noZoom = /user-scalable\s*=\s*(no|0)/i.test(vpc) || (/maximum-scale\s*=\s*([\d.]+)/i.test(vpc) && parseFloat(/maximum-scale\s*=\s*([\d.]+)/i.exec(vpc)[1]) < 2);
        check('zoom', 'Pinch zoom is allowed', 2, noZoom ? [vp] : [], 0, 'Remove user-scalable=no and maximum-scale from the viewport meta tag.');
      },
      function () {
        var low = [], seen = 0, tn, checked = new Set();
        var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
        while ((tn = walker.nextNode()) && seen < 500) {
          var p = tn.parentElement;
          if (!p || checked.has(p) || isOurs(p) || !/\S/.test(tn.nodeValue) || SKIP_TAGS[p.tagName]) continue;
          checked.add(p);
          if (!visible(p)) continue;
          seen++;
          var cs = getComputedStyle(p), fg = parseColor(cs.color), bg = effectiveBg(p);
          if (!fg || !bg) continue;
          var size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight, 10) >= 700;
          if (contrast(fg, bg) < ((size >= 24 || (bold && size >= 18.66)) ? 3 : 4.5)) low.push(p);
        }
        check('contrast', 'Text has enough contrast', 3, low, 0, 'Text needs 4.5:1 contrast, or 3:1 for large text.');
      }
    ];
    var finish = function () {
      var total = 0, got = 0;
      out.forEach(function (c) { total += c.weight; if (!c.open.length) got += c.weight; });
      return { checks: out, score: Math.round(got / total * 100), adjusted: !!(filterValue() || S.contrast || S.textColor || S.bgColor) };
    };
    return { steps: steps, finish: finish };
  }
  function runAudit() { var a = auditSteps(); a.steps.forEach(function (f) { f(); }); return a.finish(); }
  function runAuditAsync(onProgress) {
    var a = auditSteps(), i = 0;
    return new Promise(function (resolve) {
      (function next() {
        if (i >= a.steps.length) { resolve(a.finish()); return; }
        try { a.steps[i](); } catch (e) { /* skip a failing check */ }
        i++;
        if (onProgress) onProgress(i / a.steps.length);
        later(next, 16);
      })();
    });
  }

  function track(feature, value) {
    if (value === false || value === '' || value === 0 || value === 1 && /scale|size/i.test(feature)) return;
    usage[feature] = (usage[feature] || 0) + 1;
    var payload = { event: 'accessibles_feature', feature: feature, value: value, page: location.pathname, ts: Date.now(), v: VERSION };
    if (CFG.analytics && /^https?:/i.test(CFG.analytics)) {
      try {
        var body = JSON.stringify(payload);
        if (navigator.sendBeacon) navigator.sendBeacon(CFG.analytics, new Blob([body], { type: 'application/json' }));
        else fetch(CFG.analytics, { method: 'POST', body: body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(function () { });
      } catch (e) { /* ignore */ }
    }
  }

  // Hide images: each meaningful picture or video is replaced by a small label with its description
  var HideImg = {
    on: false, rec: new Recorder(),
    sync: function () { if (S.hideImages && !this.on) { this.on = true; this.fix(document.body); } else if (!S.hideImages && this.on) { this.on = false; this.rec.revert(); this.clear(document.body); } },
    clear: function (root) { Array.prototype.forEach.call(root.querySelectorAll('img,video,[role="img"],input[type="image"]'), function (el) { el.__accAlt = false; }); },
    fix: function (root) {
      if (!this.on || !root || root.nodeType !== 1) return;
      var rec = this.rec;
      var list = Array.prototype.slice.call(root.querySelectorAll('img,video,[role="img"]:not(svg),input[type="image"]'));
      if (root.matches && root.matches('img,video')) list.unshift(root);
      list.forEach(function (el) {
        if (el.__accAlt || isOurs(el)) return;
        el.__accAlt = true;
        var isVideo = el.tagName === 'VIDEO';
        var text = (isVideo ? (el.getAttribute('aria-label') || el.getAttribute('title') || '') : (el.getAttribute('alt') || el.getAttribute('aria-label') || el.getAttribute('title') || '')).trim();
        if (!text && !isVideo) return;   // decorative: simply hidden
        var tag = document.createElement('span');
        tag.className = 'acc-imgalt';
        tag.setAttribute('role', 'img');
        tag.setAttribute('aria-label', (isVideo ? 'Video' : 'Picture') + (text ? ': ' + text : ''));
        tag.textContent = (isVideo ? 'Video' : 'Picture') + (text ? ': ' + text : '');
        var host2 = el.parentElement && el.parentElement.tagName === 'PICTURE' ? el.parentElement : el;
        host2.parentNode.insertBefore(rec.add(tag), host2.nextSibling);
      });
    }
  };

  // Text direction: sets dir on <html> and <body>, restoring the originals exactly
  // Page direction. Right to left mirrors the whole layout the way Arabic, Hebrew or Persian sites are built:
  // dir attributes flip flex, grid and text flow; floats and explicit left/right alignment are swapped too.
  // Translating into a right-to-left language turns it on automatically.
  function pageDir() { return S.textDir || (S.translateTo && RTL_LANGS.test(S.translateTo) ? 'rtl' : ''); }
  var Dir = {
    cur: '', saved: null, list: [],
    sync: function () {
      var d = pageDir();
      if (d === this.cur) return;
      var h = document.documentElement, b = document.body;
      this.restore();
      if (d) {
        if (!this.saved) this.saved = { h: h.getAttribute('dir'), b: b.getAttribute('dir') };
        h.setAttribute('dir', d); b.setAttribute('dir', d);
        this.cur = d;
        this.fix(b);
      } else {
        if (this.saved) {
          if (this.saved.h === null) h.removeAttribute('dir'); else h.setAttribute('dir', this.saved.h);
          if (this.saved.b === null) b.removeAttribute('dir'); else b.setAttribute('dir', this.saved.b);
        }
        this.saved = null; this.cur = '';
      }
    },
    fix: function (root) {
      if (!this.cur || !root || root.nodeType !== 1) return;
      var self = this, from = this.cur === 'rtl' ? 'left' : 'right', to = this.cur === 'rtl' ? 'right' : 'left';
      var all = [root].concat(Array.prototype.slice.call(root.querySelectorAll('*')));
      var todo = [];
      all.forEach(function (el) {
        if (el.__accDir || isOurs(el) || SKIP_TAGS[el.tagName] || el.namespaceURI === 'http://www.w3.org/2000/svg') return;
        var cs = getComputedStyle(el), sets = [];
        if (cs.float === from) sets.push(['float', to]); else if (cs.float === to) sets.push(['float', from]);
        if (cs.textAlign === from) sets.push(['text-align', to]); else if (cs.textAlign === to) sets.push(['text-align', from]);
        if (sets.length) todo.push([el, sets]);
      });
      todo.forEach(function (t) {
        var el = t[0];
        el.__accDir = true;
        t[1].forEach(function (pv) {
          self.list.push([el, pv[0], el.style.getPropertyValue(pv[0]), el.style.getPropertyPriority(pv[0]), el.hasAttribute('style')]);
          el.style.setProperty(pv[0], pv[1], 'important');
        });
      });
    },
    restore: function () {
      for (var i = this.list.length - 1; i >= 0; i--) {
        var r = this.list[i], el = r[0];
        el.__accDir = false;
        if (r[2]) el.style.setProperty(r[1], r[2], r[3]); else el.style.removeProperty(r[1]);
        if (!r[4] && !el.getAttribute('style')) el.removeAttribute('style');
      }
      this.list = [];
    }
  };

  /* ------------------------------------------------------------------ *
   * 20b. Smart contrast, tooltips and hover highlight
   * ------------------------------------------------------------------ */
  // Fixes only the text that fails WCAG contrast, leaving the rest of the design alone
  var Smart = {
    on: false, list: [], sig: '',
    sync: function () {
      var sig = [S.contrast, S.textColor, S.bgColor, S.fontSize, S.invert].join('|');
      if (S.smartContrast && this.on && sig !== this.sig) { this.restore(); this.sig = sig; this.fix(document.body); return; }
      this.sig = sig;
      if (S.smartContrast && !this.on) { this.on = true; this.fix(document.body); } else if (!S.smartContrast && this.on) { this.on = false; this.restore(); }
    },
    fix: function (root) {
      if (!this.on || !root || root.nodeType !== 1 || S.contrast === 'dark' || S.contrast === 'light' || S.textColor || S.bgColor) return;
      var self = this, todo = [];
      FontScale.collect(root).forEach(function (el) {
        if (el.__accSmart || !visible(el)) return;
        var cs = getComputedStyle(el), fg = parseColor(cs.color), bg = effectiveBg(el);
        if (!fg || !bg) return;
        var size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight, 10) >= 700;
        var need = (size >= 24 || (bold && size >= 18.66)) ? 3 : 4.5;
        if (contrast(fg, bg) >= need) return;
        var dark = contrast([0, 0, 0], bg) >= contrast([255, 255, 255], bg);
        todo.push([el, hex(ensureContrast(fg, dark ? [0, 0, 0] : [255, 255, 255], bg, need + 0.3))]);
      });
      todo.forEach(function (t) {
        var el = t[0];
        self.list.push([el, el.style.getPropertyValue('color'), el.style.getPropertyPriority('color'), el.hasAttribute('style')]);
        el.__accSmart = true;
        el.style.setProperty('color', t[1], 'important');
      });
    },
    restore: function () {
      this.list.forEach(function (r) {
        var el = r[0]; el.__accSmart = false;
        if (r[1]) el.style.setProperty('color', r[1], r[2]); else el.style.removeProperty('color');
        if (!r[3] && !el.getAttribute('style')) el.removeAttribute('style');
      });
      this.list = [];
    }
  };

  // One tooltip bubble for both the page (Tooltips feature) and this panel's own icon buttons
  var Tip = {
    timer: 0, el: null,
    show: function (anchor, text, delay) {
      cancel(this.timer);
      var self = this;
      this.timer = later(function () { self.place(anchor, text); }, delay == null ? 350 : delay);
    },
    place: function (anchor, text) {
      var tip = $('.tip');
      if (!tip || !anchor || !anchor.isConnected || !text) return;
      this.el = anchor;
      tip.textContent = String(text).slice(0, 240);
      tip.classList.remove('up', 'down');
      tip.hidden = false;
      var r = anchor.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight, gap = 10;
      var cx = r.left + r.width / 2;
      var x = clamp(cx - w / 2, 8, Math.max(8, vw() - w - 8));
      var above = r.top - h - gap >= 8;
      var y = above ? r.top - h - gap : Math.min(r.bottom + gap, vh() - h - 8);
      tip.classList.add(above ? 'up' : 'down');
      tip.style.setProperty('--ax', Math.round(clamp(cx - x, 12, w - 12)) + 'px');
      tip.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
    },
    hide: function () { cancel(this.timer); this.el = null; var t = $('.tip'); if (t) t.hidden = true; }
  };

  var Tips = {
    on: false, cur: null,
    sync: function () {
      var evs = [['pointerover', this.onOver], ['focusin', this.onOver], ['pointerout', this.onOut], ['focusout', this.onOut]];
      if (S.tooltips && !this.on) { this.on = true; evs.forEach(function (e) { document.addEventListener(e[0], e[1], true); }); window.addEventListener('scroll', this.onOut, true); }
      else if (!S.tooltips && this.on) { this.on = false; evs.forEach(function (e) { document.removeEventListener(e[0], e[1], true); }); window.removeEventListener('scroll', this.onOut, true); this.hide(); }
    },
    text: function (el) {
      var t = el.getAttribute('data-tooltip') || el.getAttribute('title') || el.getAttribute('aria-label') || (el.tagName === 'IMG' ? el.getAttribute('alt') : '') || '';
      if (!t && el.matches('a[href],button,[role="button"]') && !textOf(el)) t = accName(el);
      return String(t).trim();
    },
    onOver: function (e) {
      var t = e.target;
      if (!t || t.nodeType !== 1 || isOurs(t)) return;
      var el = t.closest('[data-tooltip],[title],[aria-label],img[alt],a[href],button,[role="button"]');
      if (!el || isOurs(el)) return;
      var r = el.getBoundingClientRect();
      if (r.width > vw() * 0.9 && r.height > vh() * 0.6) return;   // whole sections are not "things" to describe
      var txt = Tips.text(el);
      if (!txt || txt === textOf(el)) { Tips.hide(); return; }
      if (Tips.cur === el) return;
      Tips.cur = el;
      Tip.show(el, txt, e.type === 'focusin' ? 0 : 350);
    },
    onOut: function (e) { if (!Tips.cur || !e || e.type === 'scroll' || !Tips.cur.contains(e.relatedTarget)) Tips.hide(); },
    hide: function () { this.cur = null; Tip.hide(); }
  };

  var Hover = {
    on: false, raf: 0, target: null,
    sync: function () {
      if (S.hoverHighlight && !this.on) { this.on = true; document.addEventListener('pointermove', this.onMove, { passive: true }); window.addEventListener('scroll', this.onScroll, true); }
      else if (!S.hoverHighlight && this.on) { this.on = false; document.removeEventListener('pointermove', this.onMove); window.removeEventListener('scroll', this.onScroll, true); $('.hl').hidden = true; }
    },
    onMove: function (e) {
      Hover.target = e.target;
      if (!Hover.raf) Hover.raf = requestAnimationFrame(function () { Hover.raf = 0; Hover.draw(); });
    },
    onScroll: function () { if (Hover.target) Hover.draw(); },
    draw: function () {
      var box = $('.hl'), t = this.target;
      if (!t || t.nodeType !== 1 || isOurs(t)) { box.hidden = true; return; }
      var el = t.closest('a[href],button,input,select,textarea,label,summary,[role="button"],[role="link"],img,video,h1,h2,h3,h4,h5,h6,p,li,td,th,blockquote,figure') || t;
      if (el === document.body || el === document.documentElement) { box.hidden = true; return; }
      var r = el.getBoundingClientRect();
      if (r.width > vw() * 0.95 && r.height > vh() * 0.8) { box.hidden = true; return; }
      box.hidden = false;
      box.style.width = Math.round(r.width + 8) + 'px';
      box.style.height = Math.round(r.height + 8) + 'px';
      box.style.transform = 'translate(' + Math.round(r.left - 4) + 'px,' + Math.round(r.top - 4) + 'px)';
    }
  };

  /* ------------------------------------------------------------------ *
   * 21. State changes
   * ------------------------------------------------------------------ */
  var applyQueued = false;
  function setState(key, value, silent) {
    if (S[key] === value) return;
    S[key] = value;
    if (key === 'voiceNav' && value) S.dictation = false;
    if (key === 'dictation' && value) S.voiceNav = false;
    if (key === 'oversized') UI.scale();
    if (!silent) { track(key, value); emit(key, value); }
    scheduleApply();
  }
  function emit(key, value) {
    try { window.dispatchEvent(new CustomEvent('accessibles:change', { detail: { key: key, value: value, state: JSON.parse(JSON.stringify(S)) } })); } catch (e) { /* old browser */ }
  }
  function scheduleApply() {
    if (applyQueued) return;
    applyQueued = true;
    // Wait one frame so a loading state can paint before heavier work runs
    (window.requestAnimationFrame || later)(function () { later(function () { applyQueued = false; applyAll(); }, 0); });
  }
  function stepCycle(key, dir) {
    var f = F.filter(function (x) { return x.key === key && x.t === 'cycle'; })[0];
    if (!f) return;
    var i = f.opts.indexOf(S[key]);
    setState(key, f.opts[clamp(i + dir, 0, f.opts.length - 1)]);
    UI.refresh();
  }

  function toggleProfile(id) {
    var p = PROFILES.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    var active = S.profiles.slice();
    var i = active.indexOf(id);
    if (i > -1) {
      active.splice(i, 1);
      Object.keys(p.set).forEach(function (k) { S[k] = DEFAULTS[k]; });
      // Re-apply what other active profiles still want
      PROFILES.forEach(function (o) { if (active.indexOf(o.id) > -1) Object.keys(o.set).forEach(function (k) { S[k] = o.set[k]; }); });
      announce(p.label + ' profile off');
    } else {
      active.push(id);
      Object.keys(p.set).forEach(function (k) { S[k] = p.set[k]; });
      announce(p.label + ' profile on');
      track('profile:' + id, true);
    }
    S.profiles = active;
    emit('profiles', active);
    scheduleApply();
  }

  function resetAll() {
    TTS.stop();
    Voice.stop();
    if (S.translateTo || Translate.engine) { Translate.target = ''; Translate.restore(); I18N.set(''); }
    S = JSON.parse(JSON.stringify(DEFAULTS));
    dragPos = null;
    UI.panelPos = null; UI.vkbPos = null; UI.helpLang = undefined; UI.repType = undefined; UI.rfs = undefined; UI.rtheme = undefined; UI.structMode = 'headings';
    var vk = $('.vkb'); if (vk) { vk.classList.remove('moved'); vk.style.left = vk.style.top = vk.style.bottom = ''; }
    UI.scale();
    UI.placeLauncher();
    applyAll();
    if (UI.open) { var q = $('.search input'); if (q) q.value = ''; UI.view = null; UI.renderTab(UI.tab); UI.placePanel(); }
    announce('All settings reset');
    emit('reset', true);
  }

  var lastCSS = '';
  function applyAll() {
    var css = buildPageCSS();
    if (css !== lastCSS) { setPageCSS(css); lastCSS = css; }
    var waits = [];
    if (S.font) waits.push(loadFont(S.font));
    var mods = [FontScale, Smart, Aria, Alt, Forms, Keyboard, TTS, Pointer, Motion, Mute, Timing, Voice, VKB, Dict, Sign, Tips, Hover, Dir, HideImg];
    mods.forEach(function (m) { try { var r = m.sync(); if (r && typeof r.then === 'function') waits.push(r); } catch (e) { if (window.console) console.warn('[Accessibles]', e); } });
    UI.refresh();
    UI.placeLauncher();
    save();
    Promise.all(waits).then(function () { UI.doneBusy(); }, function () { UI.doneBusy(); });
  }

  var fontsLoaded = {};
  function addCSSLink(href, onerror) {
    var l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = href; l.setAttribute('data-accessibles', '');
    if (onerror) l.onerror = onerror;
    (document.head || document.documentElement).appendChild(l);
    return l;
  }
  function gfURL(fam, extra) { return 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(fam).replace(/%20/g, '+') + (extra || '') + '&display=swap'; }
  var fontReady = {};
  function loadFont(id) {
    if (!id) return Promise.resolve();
    if (fontReady[id]) return fontReady[id];
    var f = fontInfo(id);
    if (id === 'readable' && CFG.readableFontUrl) addCSSLink(CFG.readableFontUrl);
    else if (id === 'dyslexic' && CFG.dyslexicFontUrl) addCSSLink(CFG.dyslexicFontUrl);
    // Not every family ships a bold cut; fall back to the regular weight if the request is refused
    else if (f.g) addCSSLink(gfURL(f.g, ':wght@400;700'), function () { addCSSLink(gfURL(f.g)); });
    fontReady[id] = new Promise(function (resolve) {
      if (!f.fam || !document.fonts || !document.fonts.load) { resolve(); return; }
      var t = later(resolve, 4000);
      later(function () { document.fonts.load('16px "' + f.fam + '"').then(function () { cancel(t); resolve(); }, function () { cancel(t); resolve(); }); }, 60);
    });
    return fontReady[id];
  }
  var previewLoaded = false;
  function loadFontPreviews() {
    if (previewLoaded) return;
    previewLoaded = true;
    var fams = FONT_LIST.filter(function (f) { return f.g; });
    var chars = {};
    FONT_LIST.forEach(function (f) { (f.name + (f.g || '')).split('').forEach(function (c) { chars[c] = 1; }); });
    var text = encodeURIComponent(Object.keys(chars).join(''));
    for (var i = 0; i < fams.length; i += 10) {
      var q = fams.slice(i, i + 10).map(function (f) { return 'family=' + encodeURIComponent(f.g).replace(/%20/g, '+'); }).join('&');
      addCSSLink('https://fonts.googleapis.com/css2?' + q + '&text=' + text + '&display=swap');
    }
  }

  /* ------------------------------------------------------------------ *
   * 22. Widget interface
   * ------------------------------------------------------------------ */
  function widgetCSS(pal) {
    function vars(o) { return Object.keys(o).map(function (k) { return k + ':' + o[k]; }).join(';'); }
    return [
      '.r{' + vars(pal.vars) + ';--font:"Figtree",ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif;--r:.85em;position:absolute;inset:0;pointer-events:none;font-family:var(--font);font-size:15px;line-height:1.45;font-weight:400;color:var(--text);text-align:left;letter-spacing:normal;word-spacing:normal;-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;text-size-adjust:100%;cursor:auto}',
      '.r *,.r *::before,.r *::after{box-sizing:border-box;margin:0;padding:0;border:0;font:inherit;color:inherit;letter-spacing:inherit;text-transform:none;text-decoration:none;text-shadow:none;max-width:none;float:none;animation:none!important;transition:none!important;scroll-behavior:auto!important}',
      '[hidden]{display:none!important}',
      '.ib,.hb,.clr,.pick,.swb,.grip,.brandmark,.pi,.help-ico,.st,.ck,.prev{flex:none!important;aspect-ratio:1/1;border-radius:50%!important}',
      '.cp-grid button{aspect-ratio:1/1;border-radius:50%!important}',
      '.r ::selection{background:var(--accent);color:var(--accent-ink)}',
      '.r .rbody ::selection{background:var(--p);color:var(--p-ink)}',
      '.sl,.vkb,.cp-row .inp{direction:ltr}',
      '[dir="rtl"] .hb{right:auto;left:.35em}',
      '[dir="rtl"] .tile .ck,[dir="rtl"] .tile .go,[dir="rtl"] .bz{right:auto;left:.6em}',
      '[dir="rtl"] .prow{padding-right:.75em;padding-left:5.4em}',
      '[dir="rtl"] .prow-w .hb{right:auto;left:3.45em}',
      '[dir="rtl"] .prow-w .sw{right:auto;left:.75em}',
      '[dir="rtl"] .prow-w .bz{right:auto;left:.95em}',
      '[dir="rtl"] .sw::after{left:auto;right:.18em}',
      '[dir="rtl"] .prow-w.on .sw::after{transform:translateX(-.95em)}',
      '[dir="rtl"] .search .i,[dir="rtl"] .qbox .i{left:auto;right:.8em}',
      '[dir="rtl"] .cs-pop .q .i{left:auto;right:1.25em}',
      '[dir="rtl"] .search input,[dir="rtl"] .qbox .inp,[dir="rtl"] .cs-pop .q input{padding-left:.75em;padding-right:2.3em}',
      '[dir="rtl"] .go .i,[dir="rtl"] .vh .ib .i,[dir="rtl"] .linkrow .i:last-child{transform:scaleX(-1)}',
      '[dir="rtl"] .tb,[dir="rtl"] .shb,[dir="rtl"] .opt,[dir="rtl"] .cs-btn{text-align:right}',
      'button{appearance:none;-webkit-appearance:none;background:none;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;text-align:inherit}',
      '.r button,.r a,.r label,.r [role="option"],.r [role="slider"],.r [role="switch"],.r .swb,.r .pick,.r .key,.r .cs-btn{cursor:pointer}',
      '.r input[type="text"],.r input[type="search"],.r input[type="email"],.r textarea{cursor:text}',
      '.r.cur-black,.r.cur-black *{cursor:' + svgCursor('#000', '#fff', 'arrow') + ',auto!important}',
      '.r.cur-black :is(button,a,label,[role="option"],[role="slider"],.swb,.pick,.key,.cs-btn,.launch){cursor:' + svgCursor('#000', '#fff', 'hand') + ',pointer!important}',
      '.r.cur-white,.r.cur-white *{cursor:' + svgCursor('#fff', '#000', 'arrow') + ',auto!important}',
      '.r.cur-white :is(button,a,label,[role="option"],[role="slider"],.swb,.pick,.key,.cs-btn,.launch){cursor:' + svgCursor('#fff', '#000', 'hand') + ',pointer!important}',
      '.r.focus-strong :focus-visible:not([tabindex="-1"]):not(.panel){outline:3px solid var(--accent)!important;outline-offset:2px!important}',
      '.r.focus-strong :is(.tab,.opt,.tm,.prow,.seg button):focus-visible{outline-offset:-3px!important}',
      '.panel:focus,.vh h2:focus,.body:focus,.help:focus,.help h2:focus{outline:none}',
      'button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,a:focus-visible,[tabindex]:focus-visible{outline:2px solid var(--accent);outline-offset:2px}',
      '.i{display:block;width:1.3em;height:1.3em;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;flex:none}',
      // launcher
      '.launch{position:absolute;left:0;top:0;width:2.9em;height:2.9em;border-radius:.8em;background:var(--p);color:var(--p-ink);display:grid;place-items:center;pointer-events:auto;box-shadow:0 .35em 1.1em var(--p-shadow),0 0 0 1px var(--p-edge);touch-action:none;user-select:none;-webkit-user-select:none}',
      '.launch .i{width:1.75em;height:1.75em;stroke-width:1.6}',
      // Hover card: opens beside the small button and names the site
      // It grows out from under the button: it starts clipped to the button's square and opens to full width
      '.lcard{position:absolute;left:0;top:0;display:flex;align-items:center;gap:.6em;height:2.9em;max-width:min(20em,calc(100vw - 16px));border-radius:.8em;background:var(--p);color:var(--p-ink);box-shadow:0 .35em 1.1em var(--p-shadow),0 0 0 1px var(--p-edge);text-align:start;visibility:hidden;opacity:0;pointer-events:none;transition:clip-path .32s cubic-bezier(.2,.8,.2,1),opacity .2s ease,visibility 0s linear .32s}',
      '.lcard.tl{padding:0 3.6em 0 .4em;clip-path:inset(0 0 0 calc(100% - 2.9em) round .8em)}',
      '.lcard.tr{padding:0 1em 0 3.35em;clip-path:inset(0 calc(100% - 2.9em) 0 0 round .8em)}',
      '.lcard.show{visibility:visible;opacity:1;pointer-events:auto;clip-path:inset(0 0 0 0 round .8em);transition:clip-path .32s cubic-bezier(.2,.8,.2,1),opacity .14s ease,visibility 0s}',
      '.launch.carded,.launch.carded:hover{filter:none;box-shadow:none}',
      '@media (prefers-reduced-motion:reduce){.lcard,.lcard.show{transition:none}}',
      '.r.still .lcard,.r.still .lcard.show{transition:none}',
      '.lc-ico{width:2.15em;height:2.15em;border-radius:50%;flex:none;display:grid;place-items:center;overflow:hidden;background:none;color:var(--p-ink)}',
      '.lc-ico .i{width:1.75em;height:1.75em}',
      '.lc-ico.sk{background:var(--p-ink);opacity:.35;animation:accPulse 1.1s ease-in-out infinite alternate}',
      '@keyframes accPulse{from{opacity:.3}to{opacity:.6}}',
      '@media (prefers-reduced-motion:reduce){.lc-ico.sk{animation:none}}',
      '.lc-t{display:flex;flex-direction:column;min-width:0;line-height:1.2}',
      '.lc-n{font-size:.86em;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.lc-s{font-size:.72em;font-weight:500;opacity:.88;white-space:nowrap}',
      '.launch:hover{filter:brightness(1.08)}',
      '.launch.under{visibility:hidden}',
      '.launch:focus-visible{outline:3px solid var(--accent);outline-offset:3px}',
      '.launch.dragging{cursor:grabbing!important;box-shadow:0 .6em 1.6em var(--p-shadow)}',
      '.launch .dot{position:absolute;top:.22em;right:.22em;width:.72em;height:.72em;border-radius:50%;background:var(--p-ink);box-shadow:0 0 0 .18em var(--p)}',
      // panel
      '.panel{position:absolute;left:0;top:0;width:min(27em,calc(100vw - 16px));display:flex;flex-direction:column;background:var(--bg);color:var(--text);border:1px solid var(--line);border-radius:1.1em;box-shadow:var(--shadow);pointer-events:auto;overflow:hidden}',
      '.head,.search,.tabs,.foot{flex:0 0 auto}',
      '.head{display:flex;align-items:center;gap:.4em;padding:.8em .8em .55em 1.1em;user-select:none;-webkit-user-select:none}',
      '.head.grab{cursor:grab}',
      '.brandmark{width:2.2em;height:2.2em;border-radius:50%;background:var(--soft);color:var(--accent);display:grid;place-items:center;flex:none;overflow:hidden}',
      '.brandmark .i{width:1.4em;height:1.4em}',
      // A site icon is shown as it is: no background behind it, scaled to fit its round space so no part is cut off
      '.brandmark img,.lc-ico img{width:100%;height:100%;object-fit:contain;display:block;background:none!important;border-radius:0}',
      '.brandmark.img,.lc-ico.img{background:none!important;box-shadow:none!important;overflow:visible}',
      '.htxt{flex:1;min-width:0;padding-left:.4em}',
      '.title{display:block;font-weight:650;font-size:1.06em;letter-spacing:-.005em;line-height:1.25;min-width:0}',
      '.tb,.shb{display:inline-flex;align-items:center;gap:.35em;max-width:100%;padding:.15em .5em;margin:-.15em -.5em;border-radius:999px;color:inherit;font:inherit;text-align:left}',
      '.tb:hover,.shb:hover{background:var(--hover)}',
      '.tb .i,.shb .i{width:.95em;height:.95em;color:var(--muted);flex:none}',
      '.title .tb{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:inline-flex}',
      '.subtitle{display:block;font-size:.76em;color:var(--muted);line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.ib{width:2.3em;height:2.3em;border-radius:50%;display:grid;place-items:center;color:var(--muted);flex:none}',
      '.ib:hover{background:var(--hover);color:var(--text)}',
      '.ib .i{width:1.2em;height:1.2em}',
      '.search{position:relative;margin:.15em 1.1em .7em}',
      '.search .i{position:absolute;left:.75em;top:50%;transform:translateY(-50%);width:1.05em;height:1.05em;color:var(--muted);pointer-events:none}',
      '.search input{width:100%;height:2.5em;border:1px solid var(--line-2);border-radius:.7em;background:var(--field);padding:0 .8em 0 2.3em;font-size:.93em;color:var(--text);outline:none;-webkit-appearance:none;appearance:none}',
      '.search input::placeholder{color:var(--muted);opacity:1}',
      '.search input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--soft-2)}',
      '.tabs{display:flex;gap:.1em;padding:0 .8em;box-shadow:inset 0 -1px 0 var(--line);overflow-x:auto;overflow-y:hidden;scrollbar-width:none;-ms-overflow-style:none}',
      '.tabs::-webkit-scrollbar{display:none}',
      '.tab{position:relative;flex:none;padding:.55em .8em;margin:.25em 0 .35em;font-size:.86em;font-weight:560;color:var(--muted);white-space:nowrap;border-radius:999px}',
      '.tab:not([aria-selected="true"]):hover{color:var(--text);background:var(--hover)}',
      '.tab[aria-selected="true"]{color:var(--accent);font-weight:620}',
      '.tab[aria-selected="true"]::after{content:"";position:absolute;left:.8em;right:.8em;bottom:-.35em;height:2px;background:var(--accent)}',
      '.tab:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}',
      '.body{flex:1 1 auto;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:.95em 1.1em 1.1em;scrollbar-width:thin;scrollbar-color:var(--line-2) transparent}',
      '.body::-webkit-scrollbar{width:8px}.body::-webkit-scrollbar-thumb{background:var(--line-2);border-radius:8px;border:2px solid var(--bg)}',
      '.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.5em}',
      '.tile{position:relative;border:1px solid var(--line);border-radius:var(--r);background:var(--surface);color:var(--text)}',
      '.tile:hover{border-color:var(--line-2);background:var(--hover)}',
      '.tm{display:flex;flex-direction:column;align-items:flex-start;gap:.5em;width:100%;height:100%;min-height:6.3em;padding:.75em .7em .65em;border-radius:var(--r);color:inherit}',
      '.tm:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}',
      '.hb{position:absolute;top:.35em;right:.35em;width:1.85em;height:1.85em;border-radius:50%;display:grid;place-items:center;color:var(--muted)}',
      '.hb:hover{background:var(--line);color:var(--text)}',
      '.hb .i{width:1.05em;height:1.05em}',
      '.tile .ti{color:var(--muted);transition:color .12s}',
      '.tile .ti .i{width:1.45em;height:1.45em}',
      '.tile .tl{font-size:.82em;font-weight:560;line-height:1.25}',
      '.tile .tv{font-size:.72em;color:var(--muted);margin-top:-.35em;line-height:1.2}',
      '.tile .ck{position:absolute;bottom:.6em;right:.6em;width:1.15em;height:1.15em;border-radius:50%;background:var(--accent);color:var(--accent-ink);display:none;place-items:center}',
      '.tile .ck .i{width:.8em;height:.8em;stroke-width:2.6}',
      '.tile.on{background:var(--soft);border-color:var(--accent)}',
      '.tile.on .hb:hover{background:var(--soft-2)}',
      '.tile.on .ti{color:var(--accent)}',
      '.tile.on .ck{display:grid}',
      '.tile.cycle.on .ck{display:none}',
      '.pips{display:flex;gap:.22em;margin-top:auto;width:100%}',
      '.pip{flex:1;max-width:1.3em;height:.22em;border-radius:1em;background:var(--line-2)}',
      '.pip.f{background:var(--accent)}',
      '.tile .go{position:absolute;bottom:.6em;right:.55em;color:var(--muted)}.tile .go .i{width:.95em;height:.95em}',
      '.tile .tl{padding-right:.2em}',
      // profiles
      '.plist{display:flex;flex-direction:column;gap:.45em}',
      '.prow-w{position:relative;border:1px solid var(--line);border-radius:var(--r);background:var(--surface)}',
      '.prow-w:hover{border-color:var(--line-2);background:var(--hover)}',
      '.prow{display:flex;align-items:center;gap:.75em;width:100%;padding:.65em .75em;padding-right:5.4em;border-radius:var(--r);color:inherit}',
      '.prow:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}',
      '.prow-w .hb{top:50%;right:3.45em;transform:translateY(-50%)}',
      '.prow-w .sw{position:absolute;right:.75em;top:50%;margin-top:-.675em;pointer-events:none}',
      '.prow .pi{width:2.35em;height:2.35em;border-radius:50%;background:var(--soft);color:var(--accent);display:grid;place-items:center;flex:none}',
      '.prow .pi .i{width:1.3em;height:1.3em}',
      '.prow .pt{flex:1;min-width:0}',
      '.prow .pn{display:block;font-weight:600;font-size:.9em}',
      '.prow .pd{display:block;font-size:.76em;color:var(--muted);line-height:1.3;margin-top:.1em}',
      '.sw{position:relative;width:2.3em;height:1.35em;border-radius:1em;background:var(--line-2);flex:none;transition:background-color .15s}',
      '.sw::after{content:"";position:absolute;left:.18em;top:.18em;width:.99em;height:.99em;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.2);transition:transform .15s}',
      '.prow-w.on .sw{background:var(--accent)}',
      '.prow-w.on .sw::after{transform:translateX(.95em)}',
      '.prow-w.on{border-color:var(--accent);background:var(--soft)}',
      '.prow-w.sg .prow{padding-right:3.8em;align-items:flex-start}.prow-w.sg .pi{margin-top:.05em}.prow-w.sg .sw{top:1.55em}',
      '[dir="rtl"] .prow-w.sg .prow{padding-right:.75em;padding-left:3.8em}',
      '.sgs{display:flex!important;align-items:flex-start;gap:.35em;margin-top:.25em!important;white-space:normal}',
      '.sgs .i{width:1.2em;height:1.2em;flex:none;margin-top:.02em}',
      '.sgs.on{color:var(--accent)}.sgs.error{color:var(--bad)}.sgs.warn{color:var(--text)}',
      '.prow-w.sg.busy .sw{visibility:visible}.prow-w.sg .bz{display:none}',
      // sections, sliders, color rows
      '.sec{margin-top:1.1em}',
      '.sh{font-size:.74em;font-weight:650;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin:0 0 .55em .1em}',
      '.sh .shb .i{width:1.25em;height:1.25em}',
      '.card{border:1px solid var(--line);border-radius:var(--r);background:var(--surface);padding:.2em .85em}',
      '.row{display:flex;align-items:center;gap:.6em;padding:.65em 0;min-height:2.9em}',
      '.row+.row{border-top:1px solid var(--line)}',
      '.row{flex-wrap:wrap}.row .swatches{margin-left:auto}',
      '.row .rl{flex:1 0 6.5em;font-size:.86em;font-weight:520;display:flex;align-items:center;gap:.55em;min-width:0}',
      '.row .rl .i{color:var(--muted);width:1.15em;height:1.15em}',
      '.row .rv{font-size:.78em;color:var(--muted);font-variant-numeric:tabular-nums;min-width:3em;text-align:right}',
      '.slide{display:block;width:100%;padding:.6em 0}',
      '.slide .top{display:flex;justify-content:space-between;align-items:center;font-size:.86em;font-weight:520;margin-bottom:.45em}',
      '.slide .top .val{font-size:.9em;color:var(--muted);font-variant-numeric:tabular-nums}',
      '.sl{position:relative;height:1.6em;touch-action:none;outline:none;border-radius:.5em}',
      '.sl .tr{position:absolute;left:.6em;right:.6em;top:50%;height:.32em;margin-top:-.16em;border-radius:1em;background:var(--line-2)}',
      '.sl .fi{position:absolute;left:0;top:0;bottom:0;border-radius:1em;background:var(--accent)}',
      '.sl .th{position:absolute;top:50%;width:1.2em;height:1.2em;margin:-.6em 0 0 -.6em;border-radius:50%;background:var(--bg);border:2px solid var(--accent);box-shadow:0 1px 3px rgba(0,0,0,.3)}',
      '.sl:focus-visible .th{box-shadow:0 0 0 4px var(--soft-2)}',
      '.swatches{display:flex;align-items:center;gap:.35em;flex-wrap:wrap;justify-content:flex-end}',
      '.swb{width:1.55em;height:1.55em;border-radius:50%;border:1px solid var(--line-2);position:relative}',
      '.swb.on{box-shadow:0 0 0 2px var(--bg),0 0 0 4px var(--accent)}',
      '.pick{position:relative;width:1.55em;height:1.55em;border-radius:50%;border:1px dashed var(--line-2);display:grid;place-items:center;color:var(--muted);overflow:hidden}',
      '.pick:hover{background:var(--hover);color:var(--text)}',
      '.pick .i{width:.9em;height:.9em}',
      '.swb{box-shadow:inset 0 0 0 1px rgba(127,127,127,.35)}',
      '.swb:hover{box-shadow:inset 0 0 0 1px rgba(127,127,127,.35),0 0 0 3px var(--hover)}',
      '.pick.on{border-style:solid;box-shadow:0 0 0 2px var(--bg),0 0 0 4px var(--accent)}',
      '.clr{width:1.55em;height:1.55em;border-radius:50%;display:grid;place-items:center;color:var(--muted)}',
      '.clr:hover{background:var(--hover);color:var(--text)}.clr .i{width:.9em;height:.9em}',
      '.cs-btn{display:flex;align-items:center;gap:.5em;width:100%;height:2.6em;padding:0 .75em;border:1px solid var(--line-2);border-radius:.65em;background:var(--field);color:var(--text);font-size:.88em;text-align:left}',
      '.cs-btn:hover{border-color:var(--muted)}',
      '.cs-btn[aria-expanded="true"]{border-color:var(--accent)}',
      '.cs-btn .cv{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.cs-btn .i{width:1em;height:1em;color:var(--muted);transform:rotate(90deg)}',
      '.cs-pop{position:absolute;left:0;top:0;display:flex;flex-direction:column;background:var(--bg);color:var(--text);border:1px solid var(--line-2);border-radius:.8em;box-shadow:var(--shadow);pointer-events:auto;overflow:hidden}',
      '.cs-pop .q{position:relative;padding:.5em;border-bottom:1px solid var(--line)}',
      '.cs-pop .q .i{position:absolute;left:1.25em;top:50%;transform:translateY(-50%);width:1em;height:1em;color:var(--muted);pointer-events:none}',
      '.inp,.cs-pop .q input{width:100%;height:2.5em;border:1px solid var(--line-2);border-radius:.6em;background:var(--field);color:var(--text);padding:0 .75em;font-size:.88em;outline:none}',
      '.cs-pop .q input,.qbox .inp{padding-left:2.25em}',
      'textarea.inp{height:auto;min-height:6.5em;padding:.6em .75em;resize:vertical;line-height:1.45}',
      '.inp:focus,.cs-pop .q input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--soft-2)}',
      '.r input:hover,.r textarea:hover{border-color:var(--muted)}',
      '.r input:focus,.r textarea:focus{border-color:var(--accent)}',
      // Browser autofill must never repaint fields: an inset shadow covers its background, text keeps our color
      '.r input:-webkit-autofill,.r input:-webkit-autofill:hover,.r input:-webkit-autofill:focus,.r input:-webkit-autofill:active,.r textarea:-webkit-autofill{-webkit-box-shadow:0 0 0 1000px var(--field) inset!important;box-shadow:0 0 0 1000px var(--field) inset!important;-webkit-text-fill-color:var(--text)!important;caret-color:var(--text);background-color:var(--field)!important;background-image:none!important;border-color:var(--line-2)}',
      '.r input:-webkit-autofill:focus{-webkit-box-shadow:0 0 0 1000px var(--field) inset,0 0 0 3px var(--soft-2)!important;border-color:var(--accent)}',
      '.r input:autofill,.r textarea:autofill{box-shadow:0 0 0 1000px var(--field) inset!important;-webkit-text-fill-color:var(--text)!important;background:var(--field)!important}',
      '.r input,.r textarea{color-scheme:' + (pal.dark ? 'dark' : 'light') + ';caret-color:var(--accent)}',
      '.inp::placeholder,.cs-pop .q input::placeholder{color:var(--muted);opacity:1}',
      '.opts{overflow-y:auto;padding:.3em;scrollbar-width:thin;scrollbar-color:var(--line-2) transparent;overscroll-behavior:contain}',
      '.opt{display:flex;align-items:center;gap:.6em;width:100%;padding:.55em .6em;border-radius:.5em;font-size:.88em;text-align:left;line-height:1.3;color:inherit}',
      '.opt .ol{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.opt .os{font-size:.82em;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:45%}',
      '.opt .oc{width:1em;height:1em;color:var(--accent);visibility:hidden;stroke-width:2.4}',
      '.opt[aria-selected="true"] .oc{visibility:visible}',
      '.opt[aria-selected="true"]{color:var(--accent);font-weight:620}',
      '.opt:hover,.opt.act{background:var(--hover)}',
      '.opt:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}',
      '.biglist{border:1px solid var(--line);border-radius:var(--r);background:var(--surface);overflow:visible;overscroll-behavior:auto}',
      '.biglist .opt{padding:.65em .7em}',
      '.fontlist .opt .ol{font-size:1.15em}',
      '.qbox{position:relative;margin-bottom:.6em}.qbox .i{position:absolute;left:.8em;top:50%;transform:translateY(-50%);width:1em;height:1em;color:var(--muted);pointer-events:none}',
      '.wait{display:flex;align-items:center;gap:.6em;padding:.7em .8em;margin-bottom:.6em;border-radius:.65em;background:var(--soft);color:var(--accent);font-size:.86em;font-weight:600}',
      '.wait .i{width:1.15em;height:1.15em}',
      '.cp-pop{position:absolute;left:0;top:0;width:16em;padding:.7em;background:var(--bg);border:1px solid var(--line-2);border-radius:.8em;box-shadow:var(--shadow);pointer-events:auto}',
      '.cp-grid{display:grid;grid-template-columns:repeat(8,1fr);gap:.3em;margin-bottom:.6em}',
      '.cp-grid button{aspect-ratio:1;border-radius:50%;border:1px solid var(--line-2)}',
      '.cp-grid button:hover{box-shadow:0 0 0 2px var(--line-2)}',
      '.cp-grid button.on{box-shadow:0 0 0 2px var(--bg),0 0 0 4px var(--accent)}',
      '.cp-row{display:flex;gap:.4em;align-items:center}',
      '.cp-row .prev{width:2.5em;height:2.5em;border-radius:50%;border:1px solid var(--line-2);flex:none}',
      '.cp-row .inp{flex:1;min-width:0;font-family:ui-monospace,Menlo,Consolas,monospace;text-transform:uppercase}',
      '.cp-row .btn{height:2.5em;flex:none}',
      '.hint{font-size:.78em;color:var(--muted);line-height:1.45;margin-top:.7em}',
      '.hint b{color:var(--text);font-weight:600}',
      '.hint.tight{margin:0 0 .6em}.hint.m0{margin:0}.hint.kbn{margin:.4em 0 .5em}',
      '.mt{margin-top:.6em}.grow{flex:1;min-width:0}.st-t{font-size:.86em;font-weight:600}.vwrap{padding-bottom:.75em}.btns.center{justify-content:center}',
      '.vkb:not([hidden])~.tts-bar{bottom:calc(max(8px,env(safe-area-inset-bottom)) + 16.5em)}.vkb:not([hidden])~.toast{bottom:calc(max(8px,env(safe-area-inset-bottom)) + 21em)}',
      '.linkrow{display:flex;align-items:center;gap:.5em;width:100%;padding:.7em .85em;border:1px solid var(--line);border-radius:var(--r);background:var(--surface);font-size:.86em;font-weight:540;margin-top:.5em}',
      '.linkrow:hover{background:var(--hover);border-color:var(--line-2)}',
      '.linkrow .i{color:var(--muted)}.linkrow span{flex:1}',
      // views
      '.vh{display:flex;align-items:center;gap:.4em;margin:-.2em 0 .8em -.45em}',
      '.vh h2{flex:1;min-width:0;font-size:1em;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.tb,.shb{white-space:nowrap;min-width:0;overflow:hidden}',
      '.tbl{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.help h2,.help-kind,.subtitle,.prow .pn,.title{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.htxt,.help-ht,.pt{min-width:0}',
      '.seg{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;padding:.25em;border:1px solid var(--line);border-radius:999px;background:var(--surface);gap:.25em;margin-bottom:.8em}',
      '.seg button{display:flex;align-items:center;justify-content:center;gap:.45em;height:2.35em;border-radius:999px;font-size:.82em;font-weight:560;color:var(--muted);border:1px solid transparent;min-width:0}',
      '.seg button span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.seg button:hover{color:var(--text);background:var(--hover)}',
      '.seg button[aria-pressed="true"]{background:var(--soft);border-color:var(--accent);color:var(--accent);font-weight:620}',
      '.seg button .n{font-size:.85em;font-weight:620;min-width:1.7em;padding:0 .4em;border-radius:1em;background:var(--line);color:var(--muted);line-height:1.55;text-align:center}',
      '.seg button[aria-pressed="true"] .n{background:var(--accent);color:var(--accent-ink)}',
      '.seg button:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}',
      '.list{display:flex;flex-direction:column;gap:.1em}',
      '.li{display:flex;align-items:baseline;gap:.6em;width:100%;padding:.5em .6em;border-radius:.55em;font-size:.86em;line-height:1.35}',
      '.li:hover{background:var(--hover)}',
      '.li .lv{font-size:.72em;font-weight:650;color:var(--accent);background:var(--soft);border-radius:.35em;padding:.1em .4em;flex:none;min-width:2.2em;text-align:center;border-radius:999px!important}',
      '.li .lt{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.empty{font-size:.85em;color:var(--muted);padding:1.2em .2em;text-align:center}',
      '.btn{display:inline-flex;align-items:center;justify-content:center;gap:.45em;height:2.5em;padding:0 1.15em;border-radius:999px;background:var(--accent);color:var(--accent-ink);font-size:.86em;font-weight:600}',
      '.btn:hover{filter:brightness(1.06)}',
      '.btn.ghost{background:transparent;color:var(--text);border:1px solid var(--line-2)}',
      '.btn.ghost:hover{background:var(--hover)}',
      '.btn .i{width:1.05em;height:1.05em;flex:none}',
      '.btn.done{color:var(--accent);border-color:var(--accent)}',
      '.btns{display:flex;gap:.5em;flex-wrap:nowrap;margin-top:.8em;min-width:0}',
      '.btns .btn{flex:0 1 auto;min-width:0}',
      '.btn{white-space:nowrap}',
      '.btn .bl{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.sum li{font-size:.88em;line-height:1.55;margin:0 0 .6em 1.1em;list-style:disc}',
      '.sum li::marker{color:var(--accent)}',
      '.meta{display:flex;gap:.5em;flex-wrap:wrap;margin-bottom:.8em}',
      '.chip{font-size:.74em;font-weight:560;padding:.25em .6em;border-radius:1em;background:var(--hover);color:var(--muted)}',
      '.field{display:block;margin-bottom:.75em}',
      '.field>span{display:block;font-size:.8em;font-weight:560;margin-bottom:.3em}',
      '.field input,.field textarea{width:100%;border:1px solid var(--line-2);border-radius:.65em;background:var(--field);color:var(--text);padding:.6em .7em;font-size:.88em;outline:none}',
      '.field textarea{min-height:6.5em;resize:vertical;line-height:1.45}',
      '.field input:focus,.field textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--soft-2)}',
      '.status{font-size:.82em;color:var(--muted);margin-top:.7em;min-height:1.2em}',
      '.score{display:flex;align-items:center;gap:.9em;padding:.9em;border:1px solid var(--line);border-radius:var(--r);background:var(--surface);margin-bottom:.8em}',
      '.score .n{font-size:2em;font-weight:700;color:var(--accent);line-height:1;font-variant-numeric:tabular-nums}',
      '.score .bar{height:.4em;border-radius:1em;background:var(--line-2);overflow:hidden;margin-top:.4em}',
      '.score .bar i{display:block;height:100%;background:var(--accent);border-radius:1em}',
      '.chk{display:flex;align-items:flex-start;gap:.6em;width:100%;padding:.55em .5em;border-radius:.55em;font-size:.84em;text-align:left}',
      '.chk:hover{background:var(--hover)}',
      '.chk .st{width:1.25em;height:1.25em;border-radius:50%;display:grid;place-items:center;flex:none;margin-top:.05em}',
      '.chk .st .i{width:.8em;height:.8em;stroke-width:2.6}',
      '.chk .st.ok{background:var(--soft);color:var(--accent)}',
      '.chk .st.bad{background:var(--bad-bg);color:var(--bad)}',
      '.chk-w{position:relative}.chk-w .chk{padding-right:2.6em}.chk-w .hb{top:50%;right:.3em;transform:translateY(-50%)}',
      '[dir="rtl"] .chk-w .chk{padding-right:.5em;padding-left:2.6em}[dir="rtl"] .chk-w .hb{right:auto;left:.3em}',
      '.chk .cb{flex:1}.chk .cs{display:block;font-size:.86em;color:var(--muted);margin-top:.1em}',
      '.posgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:.45em;padding:.6em;border:1px solid var(--line);border-radius:var(--r);background:var(--surface)}',
      '.posgrid button{height:3em;border-radius:999px;border:1px dashed var(--line-2);display:grid;place-items:center;color:var(--muted)}',
      '.posgrid button:hover{background:var(--hover)}',
      '.posgrid button.on{border:1px solid var(--accent);background:var(--soft);color:var(--accent)}',
      '.posgrid .pd{display:block;width:.6em;height:.6em;border-radius:50%;background:currentColor;opacity:.6}.posgrid button.on .pd{opacity:1;width:.75em;height:.75em}',
      '.posgrid .mid{border:0;visibility:hidden}',
      '.prose{font-size:.86em;line-height:1.6}.prose p{margin-bottom:.7em}.prose a{color:var(--accent);text-decoration:underline}',
      '.r kbd{display:inline-block;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.82em;padding:.05em .4em;border:1px solid var(--line-2);border-bottom-width:2px;border-radius:999px;background:var(--bg)}',
      '.kl{display:flex;justify-content:space-between;align-items:center;gap:.8em;padding:.45em 0;font-size:.84em;border-bottom:1px solid var(--line)}',
      '.kl:last-child{border-bottom:0}',
      '.foot{display:flex;align-items:center;justify-content:space-between;gap:.6em;padding:.6em 1.1em;border-top:1px solid var(--line);font-size:.76em;color:var(--muted)}',
      '.foot a,.foot button{color:var(--muted);font-weight:540;padding:.3em .6em;margin:-.3em -.6em;border-radius:999px}',
      '.foot a:hover,.foot button:hover{color:var(--text);background:var(--hover)}',
      '.foot .links{display:flex;gap:.3em 1em;flex-wrap:wrap}',
      '.foot .rst{color:var(--accent);font-weight:620;display:inline-flex;align-items:center;gap:.3em;white-space:nowrap}',
      '.foot .rst:hover{color:var(--accent)}',
      '.foot .rst .i{width:1em;height:1em}',
      // page aids
      '.guide{position:absolute;left:0;top:0;width:min(34em,calc(100vw - 24px));height:.5em;border-radius:999px;background:var(--p);box-shadow:0 0 0 2px var(--p-ink),0 4px 14px rgba(0,0,0,.25);pointer-events:none}',
      '.guide::before{content:"";position:absolute;left:var(--gx,50%);top:-.55em;margin-left:-.5em;border:.5em solid transparent;border-top:0;border-bottom:.55em solid var(--p)}',
      '.mask-t,.mask-b{position:absolute;left:0;right:0;background:rgba(10,12,14,.62);pointer-events:none}',
      '.mask-t{top:0;height:40vh}.mask-b{top:60vh;bottom:0}',
      '.lens{position:absolute;left:0;top:0;max-width:min(30em,calc(100vw - 16px));padding:.6em .85em;background:var(--bg);color:var(--text);border:2px solid var(--accent);border-radius:.8em;box-shadow:var(--shadow);font-size:1.6em;line-height:1.35;font-weight:500;pointer-events:none;word-wrap:break-word}',
      '.nums{position:absolute;inset:0;pointer-events:none}',
      '.num{position:absolute;left:0;top:0;min-width:1.6em;height:1.6em;padding:0 .45em;border-radius:999px;background:var(--p);color:var(--p-ink);font-size:.85em;font-weight:700;display:grid;place-items:center;box-shadow:0 2px 6px rgba(0,0,0,.3)}',
      '.bar-bottom{position:absolute;left:50%;bottom:max(12px,env(safe-area-inset-bottom));transform:translateX(-50%);display:flex;align-items:center;gap:.3em;padding:.35em .4em .35em .9em;background:var(--bg);border:1px solid var(--line);border-radius:2em;box-shadow:var(--shadow);pointer-events:auto;max-width:calc(100vw - 16px)}',
      '.bar-bottom .bl{font-size:.82em;color:var(--muted);margin-right:.3em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.bar-bottom .ib{width:2.2em;height:2.2em}',
      '.bar-bottom .ib.pri{background:var(--accent);color:var(--accent-ink)}',
      '.pill{position:absolute;left:50%;top:max(12px,env(safe-area-inset-top));transform:translateX(-50%);display:flex;align-items:center;gap:.55em;padding:.5em .95em;background:var(--bg);border:1px solid var(--line);border-radius:2em;box-shadow:var(--shadow);font-size:.86em;max-width:calc(100vw - 24px);pointer-events:auto}',
      '.pill .live{width:.6em;height:.6em;border-radius:50%;background:#d93025;flex:none}',
      '.pill span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.toast{position:absolute;left:50%;bottom:calc(max(12px,env(safe-area-inset-bottom)) + 4.2em);transform:translateX(-50%);max-width:min(26em,calc(100vw - 24px));padding:.65em 1em;border-radius:1.4em;background:var(--text);color:var(--bg);font-size:.85em;box-shadow:var(--shadow);pointer-events:none;text-align:center}',
      '.vkb{position:absolute;left:50%;bottom:max(8px,env(safe-area-inset-bottom));transform:translateX(-50%);width:min(46em,calc(100vw - 16px));padding:.5em;background:var(--bg);border:1px solid var(--line);border-radius:1em;box-shadow:var(--shadow);pointer-events:auto;user-select:none;-webkit-user-select:none}',
      '.vkb.moved{transform:none}',
      '.vkb-head{display:flex;align-items:center;gap:.5em;padding:.1em .3em .45em .3em;font-size:.8em;color:var(--muted);cursor:grab!important;touch-action:none}',
      '.vkb-head .grip{display:grid;place-items:center;width:2em;height:2em;border-radius:50%;color:var(--muted)}',
      '.vkb-head .grip .i{width:1.1em;height:1.1em}',
      '.vkb-head:hover .grip{background:var(--hover);color:var(--text)}',
      '.vkb-head.dragging{cursor:grabbing!important}',
      '.vkb-head .vkb-target{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.vkb-head .ib{width:2em;height:2em}',
      '.krow{display:flex;gap:.3em;margin-top:.3em;height:2.75em}',
      '.key{flex:1;height:100%;min-width:0;border-radius:999px;background:var(--surface);border:1px solid var(--line);font-size:1em;display:grid;place-items:center;color:var(--text)}',
      '.key:hover{border-color:var(--line-2);background:var(--hover)}.key:active{background:var(--soft-2)}',
      '.key .i{width:1.15em;height:1.15em}',
      '.key.k-space{flex:4;font-size:.8em;color:var(--muted)}',
      '.key.k-shift,.key.k-bksp,.key.k-enter,.key.k-123,.key.k-abc,.key.k-tab{flex:1.4;font-size:.78em;color:var(--muted)}',
      '.key.k-enter{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}',
      '.key.on{background:var(--soft);border-color:var(--accent);color:var(--accent)}',
      '.dict{position:absolute;left:0;top:0;width:min(21em,calc(100vw - 16px));max-height:min(24em,60vh);overflow:auto;padding:.9em 1em;background:var(--bg);color:var(--text);border:1px solid var(--line);border-radius:1em;box-shadow:var(--shadow);pointer-events:auto}',
      '.dict .dw{display:flex;align-items:center;gap:.5em;margin-bottom:.4em}',
      '.dict .dw strong{font-size:1.1em;font-weight:650;flex:1}',
      '.dict .ph{font-size:.8em;color:var(--muted);margin-top:-.3em;margin-bottom:.4em}',
      '.dict .dp{font-size:.72em;font-weight:650;color:var(--accent);text-transform:uppercase;letter-spacing:.05em;margin-top:.55em}',
      '.dict .dd{font-size:.86em;line-height:1.5}',
      '.dict .dx{font-size:.8em;color:var(--muted);font-style:italic;margin-top:.15em}',
      '.signp{position:absolute;left:max(12px,env(safe-area-inset-left));bottom:max(12px,env(safe-area-inset-bottom));width:min(19em,calc(100vw - 24px));background:var(--bg);border:1px solid var(--line);border-radius:1em;box-shadow:var(--shadow);pointer-events:auto;overflow:hidden}',
      '.signp .sh2{display:flex;align-items:center;gap:.4em;padding:.4em .4em .4em .8em;font-size:.8em;color:var(--muted)}',
      '.signp .sh2 span{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.signp video{display:block;width:100%;background:#000;aspect-ratio:4/3}',
      '.reader{position:absolute;inset:0;pointer-events:auto;overflow:auto;background:var(--rbg,#fbfaf7);color:var(--rfg,#1d1d1b);-webkit-overflow-scrolling:touch}',
      '.reader.sepia{--rbg:#f4ecd8;--rfg:#3b2f20}.reader.dark{--rbg:#16181b;--rfg:#e9e9e6}',
      '.rbar{position:sticky;top:0;display:flex;align-items:center;gap:.4em;padding:.6em max(1em,calc((100% - 46em)/2));background:var(--rbg,#fbfaf7);border-bottom:1px solid rgba(127,127,127,.2);z-index:1;font-size:15px}',
      '.rbar .sp{flex:1}',
      '.rbar .ib{color:inherit;opacity:.8}.rbar .ib:hover{opacity:1;background:rgba(127,127,127,.15)}',
      '.rbar .tt{font-weight:650;font-size:.9em;padding:.3em .75em;border-radius:999px;opacity:.8}.rbar .tt:hover{background:rgba(127,127,127,.15);opacity:1}',
      '.rbar .tt[aria-pressed="true"]{opacity:1;box-shadow:inset 0 0 0 1px currentColor}',
      '.rbody{max-width:40em;margin:0 auto;padding:2em 1.25em 5em;font-family:Georgia,"Iowan Old Style","Palatino Linotype",Palatino,serif;font-size:var(--rfs,20px);line-height:1.7}',
      '.rbody.sans{font-family:var(--font)}',
      '.rbody h1{font-size:1.9em;line-height:1.2;margin:.2em 0 .8em;font-weight:700}',
      '.rbody h2{font-size:1.4em;line-height:1.3;margin:1.6em 0 .5em;font-weight:700}',
      '.rbody h3,.rbody h4,.rbody h5,.rbody h6{font-size:1.15em;margin:1.4em 0 .4em;font-weight:700}',
      '.rbody p{margin:0 0 1em}',
      '.rbody ul,.rbody ol{margin:0 0 1em 1.4em}.rbody ul li{list-style:disc}.rbody ol li{list-style:decimal}.rbody li{margin:.3em 0}',
      '.rbody a{color:inherit;text-decoration:underline;text-underline-offset:3px}',
      '.rbody img{display:block;max-width:100%;height:auto;margin:1.2em auto;border-radius:.4em}',
      '.rbody figcaption{font-size:.8em;opacity:.75;text-align:center;margin-top:-.6em;margin-bottom:1.2em}',
      '.rbody blockquote{border-left:3px solid currentColor;padding-left:1em;opacity:.85;margin:1.2em 0;font-style:italic}',
      '.rbody pre,.rbody code{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.85em}.rbody pre{white-space:pre-wrap;padding:1em;background:rgba(127,127,127,.12);border-radius:.5em;margin:0 0 1em}',
      '.rbody table{border-collapse:collapse;width:100%;font-size:.85em;margin:0 0 1em;display:block;overflow-x:auto}.rbody td,.rbody th{border:1px solid rgba(127,127,127,.35);padding:.4em .6em;text-align:left;vertical-align:top}',
      '.rbody b,.rbody strong{font-weight:700}.rbody em,.rbody i{font-style:italic}.rbody hr{border-top:1px solid rgba(127,127,127,.3);margin:2em 0}',
      '.srl{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;white-space:nowrap!important}',
      '.tip{position:absolute;left:0;top:0;max-width:min(18em,calc(100vw - 24px));padding:.55em .85em;background:var(--text);color:var(--bg);text-align:center;font-weight:520;border-radius:.55em;font-size:.9em;line-height:1.4;box-shadow:var(--shadow);pointer-events:none;word-wrap:break-word}',
      '.tip::after{content:"";position:absolute;left:var(--ax,50%);width:.7em;height:.7em;background:inherit;border-radius:2px;transform:translateX(-50%) rotate(45deg)}',
      '.tip.up::after{bottom:-.3em}.tip.down::after{top:-.3em}',
      '.hl{position:absolute;left:0;top:0;border:3px solid var(--p);border-radius:6px;box-shadow:0 0 0 2px rgba(255,255,255,.85);pointer-events:none}',
      // help explainer
      '.help{position:fixed;inset:0;overscroll-behavior:contain;touch-action:none;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55);pointer-events:auto}',
      '.help-win{display:flex;flex-direction:column;min-height:0;width:80vw;height:80vh;background:var(--bg);color:var(--text);border:1px solid var(--line);border-radius:1.2em;box-shadow:var(--shadow);overflow:hidden}',
      '@media (max-width:1023px){.help-win{width:90vw;height:85vh}}',
      '@media (max-width:640px){.help-win{width:calc(100vw - 16px);height:calc(100vh - 16px);border-radius:1em}}',
      '.help-head{display:flex;align-items:center;gap:.75em;padding:.9em 1em .9em 1.1em;border-bottom:1px solid var(--line);flex-wrap:wrap}',
      '.help-ico{width:2.8em;height:2.8em;border-radius:50%;background:var(--soft);color:var(--accent);display:grid;place-items:center;flex:none}',
      '.help-ico .i{width:1.5em;height:1.5em}',
      '.help-ht{flex:1;min-width:8em}',
      '.help-kind{font-size:.72em;font-weight:650;color:var(--muted);text-transform:uppercase;letter-spacing:.07em}',
      '.help h2{font-size:1.25em;font-weight:700;line-height:1.25;letter-spacing:-.01em}',
      '.help-lang{width:auto!important;flex:0 1 15em;min-width:9em}',
      '.help-lang .i:first-child{transform:none!important;color:var(--accent)}',
      '@media (max-width:640px){.help-lang{order:3;flex:1 1 100%}}',
      '.help-win{touch-action:auto}',
      '.help-main{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:1.4em 1.4em 2em;scrollbar-width:thin;scrollbar-color:var(--line-2) transparent}',
      '.help-main>*{max-width:44em}',
      '.help-text{font-size:1.08em;line-height:1.7;color:var(--text)}',
      '.help-text p+p{margin-top:.8em}',
      '.gd .gh{font-size:.72em;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);margin:1.3em 0 .5em}',
      '.gd .gl,.gd .gs{margin:0;padding:0;list-style:none}',
      '.gd .gl li{position:relative;padding-left:1.15em;margin:.4em 0}',
      '.gd .gl li::before{content:"";position:absolute;left:.15em;top:.68em;width:.42em;height:.42em;border-radius:50%;background:var(--accent)}',
      '.gd .gs{counter-reset:st}',
      '.gd .gs li{counter-increment:st;position:relative;padding-left:2.1em;margin:.5em 0;min-height:1.6em}',
      '.gd .gs li::before{content:counter(st);position:absolute;left:0;top:.08em;width:1.5em;height:1.5em;border-radius:50%;background:var(--soft);color:var(--accent);font-size:.82em;font-weight:700;display:grid;place-items:center}',
      '[dir="rtl"] .gd .gl li{padding-left:0;padding-right:1.15em}[dir="rtl"] .gd .gl li::before{left:auto;right:.15em}',
      '[dir="rtl"] .gd .gs li{padding-left:0;padding-right:2.1em}[dir="rtl"] .gd .gs li::before{left:auto;right:0}',
      '.ill{margin:1em 0 .3em;padding:.7em;border:1px solid var(--line);border-radius:var(--r);background:var(--surface);max-width:24em}',
      '.ill svg{display:block;width:100%;height:auto;overflow:visible}',
      '.ill .pg{fill:var(--bg);stroke:var(--line-2)}.ill .pgd{fill:#15171a;stroke:var(--line-2)}.ill .pgf{fill:var(--bg)}.ill .pgl{fill:var(--bg);opacity:.85}',
      '.ill .tx,.ill .txf rect{fill:var(--muted);opacity:.6}.ill .faint{fill:var(--muted);opacity:.25}.ill .dkf{fill:var(--text)}.ill .lt{fill:#e8eaed}.ill .blk{fill:#111}',
      '.ill .acf{fill:var(--accent)}.ill .acs{fill:none;stroke:var(--accent);stroke-width:2}.ill .acl{fill:none;stroke:var(--accent);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}.ill .acsel{fill:var(--accent);opacity:.35}',
      '.ill .ar{fill:none;stroke:var(--muted);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.ill .soft{fill:var(--soft)}.ill .lz{fill:var(--bg);stroke:var(--accent);stroke-width:2}',
      '.ill .kc,.ill .kc rect{fill:var(--surface);stroke:var(--line-2)}.ill .kt{fill:var(--text);font:600 15px var(--font)}.ill .ln{fill:none;stroke:var(--line-2);stroke-width:1.6}',
      '.ill .dash{fill:none;stroke:var(--muted);stroke-dasharray:4 3;stroke-width:1.4}.ill .bub,.ill .bubf{fill:var(--text)}',
      '.help-text.doc h1{font-size:1.4em;margin:0 0 .6em}.help-text.doc h2,.help-text.doc h3{font-size:1.15em;margin:1.2em 0 .4em}.help-text.doc ul,.help-text.doc ol{margin:0 0 .8em 1.3em}.help-text.doc li{list-style:disc;margin:.2em 0}.help-text.doc p{margin:0 0 .8em}.help-text.doc img{max-width:100%;height:auto}',
      '.help-state{display:inline-flex;align-items:center;gap:.5em;font-size:.88em;font-weight:620;padding:.4em .9em;border-radius:999px;background:var(--hover);color:var(--muted);margin-top:1.2em}',
      '.help-state.on{background:var(--soft);color:var(--accent)}',
      '.help-state .d{width:.55em;height:.55em;border-radius:50%;background:currentColor}',
      '.help .btns{margin-top:1.2em}',
      '.help .btn{height:2.8em;padding:0 1.4em;font-size:.95em}',
      '.help-frame{display:block;width:100%;max-width:none;height:calc(100% - 4em);min-height:20em;border:1px solid var(--line);border-radius:.8em;background:#fff}',
      '.help-main:has(.help-frame){max-width:none}',
      // loading states (static: no motion inside the panel)
      '.busy{cursor:progress}',
      '.busy .ck,.busy .go,.prow-w.busy .sw{visibility:hidden}',
      '.bz{position:absolute;right:.55em;bottom:.5em;display:flex;align-items:center;gap:.25em;color:var(--accent);font-size:.74em;font-weight:650;font-variant-numeric:tabular-nums;pointer-events:none}',
      '.bz .i{width:1.6em;height:1.6em}',
      '.prow-w .bz{font-size:.9em}',
      // The one moving element in the panel: a loading spinner (still for reduced motion and when animations are stopped)
      // While reading: sound waves pulse out of the speaker, one after another
      '.i .w3{opacity:0}',
      '.r.speaking .talk{color:var(--accent)}',
      '.r.speaking .talk .w1,.r.speaking .talk .w2,.r.speaking .talk .w3{animation:accWave 1.2s ease-out infinite!important;opacity:.15}',
      '.r.speaking .talk .w2{animation-delay:.2s!important}.r.speaking .talk .w3{animation-delay:.4s!important}',
      '@keyframes accWave{0%{opacity:.15}25%{opacity:1}60%,100%{opacity:.15}}',
      '@media (prefers-reduced-motion:reduce){.r.speaking .talk .w1,.r.speaking .talk .w2,.r.speaking .talk .w3{animation:none!important;opacity:1}}',
      '.r.still.speaking .talk .w1,.r.still.speaking .talk .w2,.r.still.speaking .talk .w3{animation:none!important;opacity:1}',
      '.tts-bar>.talk{width:1.2em;height:1.2em;color:var(--muted)}',
      '.r .spin{stroke-width:2.8;color:var(--accent);transform-origin:50% 50%;animation:accSpin .8s linear infinite!important}',
      '@keyframes accSpin{to{transform:rotate(360deg)}}',
      '@media (prefers-reduced-motion:reduce){.r .spin{animation:none!important}}',
      '.r.still .spin{animation:none!important}',
      '.prow-w .bz{bottom:auto;top:50%;transform:translateY(-50%);right:.95em}',
      '.opt .bz{position:static;margin-left:auto}',
      '.opt.busy{background:var(--hover)}',
      '.cs-btn{position:relative}.cs-btn .bz{top:50%;bottom:auto;transform:translateY(-50%);background:var(--field);padding-left:.3em}.cs-btn.busy>.i:last-of-type{visibility:hidden}',
      '.help-wait{display:none!important}',
      '.tr-note{display:flex;align-items:flex-start;gap:.5em;padding:.6em .8em;margin-bottom:.7em;border-radius:var(--r);background:var(--bad-bg);color:var(--bad);font-size:.85em}.tr-note .i{width:1.2em;height:1.2em;flex:none}',
      '.pill .vr{color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:45vw;font-size:.92em}',
      '.pill .vr:empty{display:none}',
      '.pill .vn{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.pill .vn.dim{color:var(--muted);font-weight:500}',
      '.pill .ib{width:2em;height:2em}',
      '.pill .vt{flex:none;max-width:12em;padding:.2em .6em;border-radius:1em;background:var(--soft);color:var(--accent);font-size:.86em;font-weight:600}.pill .vt:empty{display:none}',
      '.ask{position:absolute;left:50%;top:calc(max(12px,env(safe-area-inset-top)) + 3.6em);transform:translateX(-50%);display:flex;align-items:center;gap:.8em;padding:.55em .6em .55em 1em;background:var(--bg);color:var(--text);border:1px solid var(--accent);border-radius:1.6em;box-shadow:var(--shadow);font-size:.9em;max-width:calc(100vw - 24px);pointer-events:auto}',
      '.ask .aq{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ask .aq b{font-weight:700}',
      '.ask .ab{display:flex;gap:.4em;flex:none}',
      '.btn.sm{height:2.2em;padding:0 1em;font-size:.9em}',
      '.cmd-h{display:flex;align-items:center;justify-content:space-between;gap:.5em}.cmd-h .sh{margin:0}',
      '.cmd-need{font-size:.8em;color:var(--muted);margin:.15em 0 .5em}',
      '.kl.cmd{flex-direction:column;align-items:flex-start;gap:.15em}.kl.cmd span:first-child{white-space:nowrap}.kl.cmd span:last-child{color:var(--muted);text-align:start;font-size:.9em}',
      '@media (forced-colors:active){.tile.on,.prow.on{outline:2px solid Highlight}.launch{border:2px solid ButtonText}}'
    ].join('\n');
  }

  var UI = {
    open: false, tab: 'profiles', view: null, panelPos: null, structMode: 'headings', structItems: [], lastFocus: null,
    build: function () {
      var r = document.createElement('div');
      r.className = 'r';
      r.setAttribute('dir', S.translateTo && RTL_LANGS.test(S.translateTo) ? 'rtl' : document.documentElement.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr');
      var tabs = TABS.map(function (t, i) {
        return '<button type="button" class="tab" role="tab" id="acc-tab-' + t.id + '" data-tab="' + t.id + '" aria-controls="acc-body" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '">' + t.label + '</button>';
      }).join('');
      var statementHref = CFG.statement ? esc(CFG.statement) : '';
      r.innerHTML =
        '<div class="mask-t" hidden></div><div class="mask-b" hidden></div>' +
        '<div class="reader" hidden role="dialog" aria-modal="true" aria-label="Reader view"></div>' +
        '<section class="panel" id="acc-panel" hidden role="dialog" aria-modal="false" aria-label="' + esc(CFG.siteName ? CFG.siteName + ' ' + CFG.title : CFG.title) + '">' +
        '<div class="head"><span class="brandmark">' + ic('logo') + '</span><div class="htxt"><h2 class="title" id="acc-title"><button type="button" class="tb" data-help="i:panel" aria-label="' + esc(CFG.siteName || CFG.title) + ', more information"><span class="tbl">' + esc(CFG.siteName || CFG.title) + '</span>' + ic('help') + '</button></h2>' +
        (CFG.siteName ? '<span class="subtitle">' + esc(CFG.title) + '</span>' : '') + '</div>' +
        '<button type="button" class="ib" data-act="close" aria-label="Close" data-tt="Close">' + ic('close') + '</button></div>' +
        '<div class="search">' + ic('search') + '<input type="search" placeholder="Search features" aria-label="Search accessibility features" autocomplete="off" spellcheck="false"></div>' +
        '<div class="tabs" role="tablist" aria-label="Categories">' + tabs + '</div>' +
        '<div class="body" id="acc-body" role="tabpanel" tabindex="-1" aria-labelledby="acc-tab-profiles"></div>' +
        '<div class="foot"><div class="links">' +
        '<button type="button" data-act="statement">Statement</button>' +
        '<button type="button" data-view="report">Report an issue</button><button type="button" data-view="shortcuts">Shortcuts</button></div>' +
        '<button type="button" class="rst" data-act="reset" hidden>' + ic('reset') + 'Reset all settings</button></div>' +
        '</section>' +
        '<div class="help" hidden role="dialog" aria-modal="true" aria-labelledby="acc-help-title" tabindex="-1"></div>' +
        '<div class="vkb" hidden role="group" aria-label="On-screen keyboard"><div class="vkb-head" data-tt="Drag to move"><span class="grip" aria-hidden="true">' + ic('move') + '</span><span class="vkb-target">No field selected</span><button type="button" class="ib" data-act="vkb-close" aria-label="Close keyboard">' + ic('close') + '</button></div><div class="vkb-keys"></div></div>' +
        '<div class="bar-bottom tts-bar" hidden role="toolbar" aria-label="Read aloud controls">' + ic('speak', 'talk') + '<span class="bl">Select or click any text to hear it</span>' +
        '<button type="button" class="ib" data-act="tts-prev" aria-label="Previous paragraph" data-tt="Previous paragraph">' + ic('back') + '</button>' +
        '<button type="button" class="ib pri" data-act="tts-page" aria-label="Read the page">' + ic('play') + '</button>' +
        '<button type="button" class="ib" data-act="tts-next" aria-label="Next paragraph" data-tt="Next paragraph">' + ic('next') + '</button>' +
        '<button type="button" class="ib" data-act="tts-pause" aria-label="Pause" hidden>' + ic('pauseSm') + '</button>' +
        '<button type="button" class="ib" data-act="tts-stop" aria-label="Stop reading">' + ic('stop') + '</button>' +
        '<button type="button" class="ib" data-act="tts-off" aria-label="Turn off read aloud">' + ic('close') + '</button></div>' +
        '<div class="pill" hidden translate="no"><i class="live"></i><span class="vt"></span><span class="vr"></span><span class="vn"></span>' +
        '<button type="button" class="ib" data-act="voice-help" aria-label="What can I say" data-tt="What can I say">' + ic('help') + '</button><button type="button" class="ib" data-act="voice-off" aria-label="Stop listening" data-tt="Stop listening">' + ic('close') + '</button></div>' +
        '<div class="ask" hidden role="alertdialog" aria-live="assertive" aria-label="Did you mean"><span class="aq"><span>Did you mean</span> <b translate="no"></b></span><span class="ab"><button type="button" class="btn sm" data-act="ask-yes">Yes</button><button type="button" class="btn sm ghost" data-act="ask-no">No</button></span></div>' +
        '<div class="toast" hidden></div>' +
        '<div class="guide" hidden></div><div class="hl" hidden aria-hidden="true"></div><div class="lens" hidden aria-hidden="true"></div><div class="tip" hidden aria-hidden="true"></div><div class="nums" hidden aria-hidden="true"></div>' +
        '<div class="signp" hidden role="dialog" aria-label="Sign language video"></div>' +
        '<div class="dict" hidden role="dialog" aria-label="Definition"></div>' +
        '<div class="cs-pop" hidden role="dialog" aria-label="Choose an option"></div><div class="cp-pop" hidden role="dialog" aria-label="Choose a color"></div>' +
        '<button type="button" class="lcard tl" tabindex="-1" aria-hidden="true"><span class="lc-ico">' + ic('web') + '</span><span class="lc-t"><span class="lc-n" translate="no"></span><span class="lc-s">Accessibility</span></span></button>' +
        '<button type="button" class="launch" aria-label="' + esc(CFG.siteName ? 'Accessibility options for ' + CFG.siteName : 'Accessibility options') + '" aria-expanded="false" aria-controls="acc-panel">' + ic('logo') + '<span class="dot" hidden></span></button>' +
        '<div class="srl" role="status" aria-live="polite"></div>';
      shadow.appendChild(r);
      R = r;
      if (CFG.siteIcon && !/^(javascript|vbscript):/i.test(CFG.siteIcon)) {
        var bm = $('.brandmark'), img = document.createElement('img');
        img.alt = ''; img.decoding = 'async';
        img.onload = function () { if (!img.naturalWidth) return; bm.classList.add('img'); bm.innerHTML = ''; bm.appendChild(img); };
        img.onerror = function () { bm.classList.remove('img'); };
        img.src = CFG.siteIcon;
      }
      this.bind();
      this.scale();
      this.placeLauncher();
      this.renderTab('profiles');
    },

    /* --- sizing: identical look at every width, clamped between 360px and 1200px layouts --- */
    scale: function () {
      if (!R) return;
      var w = vw();
      var f = w < 360 ? 13 * w / 360 : 13 + 2 * Math.min(1, (w - 360) / 840);
      if (S.oversized) f *= w >= 600 ? 1.2 : 1.08;
      R.style.fontSize = f.toFixed(3) + 'px';
      R.classList.toggle('still', !!S.stopAnimations);
    },
    launcherSize: function () { var l = $('.launch'); return l ? l.offsetWidth || 52 : 52; },
    placeLauncher: function () {
      var l = $('.launch');
      if (!l) return;
      var size = this.launcherSize(), W = vw(), H = vh(), m = 8, x, y;
      var pos = S.position ? normPosition(S.position) : CFG.position;
      if (dragPos) {
        x = dragPos.x * W - size / 2; y = dragPos.y * H - size / 2;
      } else {
        var k = Math.min(1, W / 400);
        var ox = Math.max(m, CFG.offsetX * k), oy = Math.max(m, CFG.offsetY * k);
        x = pos.h === 'left' ? ox : pos.h === 'right' ? W - size - ox : (W - size) / 2;
        y = pos.v === 'top' ? oy : pos.v === 'bottom' ? H - size - oy : (H - size) / 2;
      }
      x = clamp(x, m, W - size - m); y = clamp(y, m, H - size - m);
      l.style.transform = '';
      l.style.left = Math.round(x) + 'px';
      l.style.top = Math.round(y) + 'px';
      var active = VISUAL_KEYS.some(function (k) { return JSON.stringify(S[k]) !== JSON.stringify(DEFAULTS[k]); });
      var changed = active || S.profiles.length || ['ariaFix', 'altText', 'formFix', 'oversized', 'ttsRate', 'ttsPitch', 'ttsVoice'].some(function (k) { return S[k] !== DEFAULTS[k]; });
      var rst = $('.foot .rst'); if (rst) rst.hidden = !changed;
      $('.dot', l).hidden = !active;
      var card = $('.lcard'); if (card && card.classList.contains('show')) this.showCard();
      if (this.open) this.placePanel();
    },
    placePanel: function () {
      var p = $('.panel');
      if (!p || p.hidden) return;
      var W = vw(), H = vh(), m = 8, gap = 10;
      var fs = parseFloat(R.style.fontSize) || 15;
      var h = Math.min(Math.round(44 * fs), H - 2 * m);   // fixed height: switching tabs never makes it jump
      var w = p.offsetWidth;
      var x, y, hh = h;
      if (this.panelPos) {
        x = this.panelPos.x; y = this.panelPos.y;
      } else {
        var l = $('.launch').getBoundingClientRect();
        var above = l.top - gap - m, below = H - l.bottom - gap - m, left = l.left - gap - m, right = W - l.right - gap - m;
        var cx = l.left + l.width / 2, cy = l.top + l.height / 2;
        var third = cx < W / 3 ? 'left' : cx > W * 2 / 3 ? 'right' : 'center';
        var alignX = third === 'right' ? l.right - w : third === 'left' ? l.left : cx - w / 2;
        if (Math.max(above, below) >= Math.min(h, 30 * fs)) {
          var useBelow = below > above;
          hh = Math.min(h, useBelow ? below : above);
          x = alignX; y = useBelow ? l.bottom + gap : l.top - gap - hh;
          p.style.setProperty('--oy', useBelow ? '0%' : '100%');
        } else if (Math.max(left, right) >= w) {
          x = right >= left ? l.right + gap : l.left - gap - w;
          y = cy - h / 2;
          p.style.setProperty('--oy', '50%');
        } else {
          x = (W - w) / 2; y = H - m - h;   // small screens: sheet over the page
          p.style.setProperty('--oy', '100%');
        }
        p.style.setProperty('--ox', third === 'right' ? '100%' : third === 'left' ? '0%' : '50%');
      }
      p.style.height = Math.round(hh) + 'px';
      p.style.maxHeight = (H - 2 * m) + 'px';
      p.style.left = Math.round(clamp(x, m, Math.max(m, W - w - m))) + 'px';
      p.style.top = Math.round(clamp(y, m, Math.max(m, H - hh - m))) + 'px';
      // The button stays hidden while the panel is open; the panel has its own close
      $('.launch').classList.toggle('under', !!this.open);
    },

    // The site's own picture for the hover card: site-icon-url, else the site's favicon, else a plain website icon.
    // Loaded only the first time the card is shown, with a placeholder until it arrives.
    cardIcon: function () {
      if (this.cardIconDone) return;
      this.cardIconDone = true;
      var box = $('.lc-ico'), list = [];
      var safe = function (u) { try { var x = new URL(u, location.href); return /^(https?:|data:image\/)/.test(x.protocol + (x.protocol === 'data:' ? x.pathname.slice(0, 6) : '')) ? x.href : ''; } catch (e) { return ''; } };
      if (CFG.siteIcon) list.push(safe(CFG.siteIcon));
      var link = document.querySelector('link[rel~="icon"][href],link[rel="shortcut icon"][href],link[rel="apple-touch-icon"][href]');
      if (link) list.push(safe(link.getAttribute('href')));
      if (/^https?:$/.test(location.protocol)) list.push(location.origin + '/favicon.ico');
      list = list.filter(function (u, i) { return u && list.indexOf(u) === i; });
      if (!list.length) return;
      box.classList.add('sk'); box.innerHTML = '';
      var next = function () {
        var u = list.shift();
        if (!u) { box.classList.remove('sk', 'img'); box.innerHTML = ic('web'); return; }
        var img = document.createElement('img');
        img.alt = ''; img.decoding = 'async'; img.referrerPolicy = 'no-referrer';
        var t = later(function () { img.onload = img.onerror = null; next(); }, 6000);
        img.onload = function () { cancel(t); if (!img.naturalWidth) { next(); return; } box.classList.remove('sk'); box.classList.add('img'); box.innerHTML = ''; box.appendChild(img); };
        img.onerror = function () { cancel(t); next(); };   // 404 or any other error: try the next one
        img.src = u;
      };
      next();
    },
    showCard: function () {
      var c = $('.lcard'), l = $('.launch');
      if (!c || this.open || l.classList.contains('dragging') || l.classList.contains('under')) return;
      cancel(this.cardT);
      $('.lc-n', c).textContent = CFG.siteName || location.hostname.replace(/^www\./, '') || T('This website');
      I18N.apply(c);
      this.cardIcon();
      // Opens towards the middle of the screen, sharing the button's edge
      var r = l.getBoundingClientRect(), W = vw();
      var toLeft = r.left + r.width / 2 > W / 2;
      if (!c.classList.contains('show')) { c.classList.toggle('tl', toLeft); c.classList.toggle('tr', !toLeft); }
      toLeft = c.classList.contains('tl');
      var w = c.offsetWidth;
      c.style.left = Math.round(toLeft ? r.right - w : r.left) + 'px';
      c.style.top = Math.round(r.top) + 'px';
      l.classList.add('carded');
      c.classList.add('show');
    },
    hideCard: function (now) {
      var self = this;
      cancel(this.cardT);
      var go = function () { var c = $('.lcard'); if (c) c.classList.remove('show'); $('.launch').classList.remove('carded'); };
      if (now) go(); else this.cardT = later(function () { if (!self.cardHover) go(); }, 160);
    },

    bind: function () {
      var self = this;
      var launch = $('.launch'), card = $('.lcard');
      launch.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') self.showCard(); });
      launch.addEventListener('pointerleave', function () { self.hideCard(); });
      launch.addEventListener('focus', function () { if (self.kbd) self.showCard(); });
      launch.addEventListener('blur', function () { self.hideCard(true); });
      card.addEventListener('pointerenter', function () { self.cardHover = true; cancel(self.cardT); });
      card.addEventListener('pointerleave', function () { self.cardHover = false; self.hideCard(); });
      card.addEventListener('click', function () { self.hideCard(true); self.cardHover = false; self.toggle(); });
      // Drag the launcher (mouse, pen and touch); a short press is a click
      var drag = null, suppress = false;
      launch.addEventListener('pointerdown', function (e) {
        if (e.button !== 0 || !CFG.draggable) return;
        var r = launch.getBoundingClientRect();
        drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: r.left, oy: r.top, moved: false };
        try { launch.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ }
      });
})(window, document);
