/* helpers/helpers-2.js: Small shared tools, continued */
accessibles_core.define('helpers/helpers-2.js', [], function (core) {
  'use strict';
  // True when an element is a field you can type into
  core.is_editable = function (element) {
    if (!element || element.nodeType !== 1) return false;
    if (element.isContentEditable) return true;
    if (element.tagName === 'TEXTAREA') return !element.readOnly && !element.disabled;
    if (element.tagName !== 'INPUT') return false;
    var target = (element.type || 'text').toLowerCase();
    return /^(text|search|email|url|tel|password|number)$/.test(target) && !element.readOnly && !element.disabled;
  };
  // Turns a technical name into words
  core.humanize = function (text) {
    text = String(text || '').replace(/\.[a-z0-9]{2,5}(\?.*)?$/i, '').replace(/[-_.+]+/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\s+/g, ' ').trim();
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };
  // Unicode-aware patterns, built at runtime so older engines fall back instead of failing to parse
  core.make_regex = function (src, flags, fallback) { try { return new RegExp(src, flags); } catch (error) { return fallback; } };
  // The words in a text, in any alphabet
  core.words_of = function (text) { core.words_pattern.lastIndex = 0; return String(text).match(core.words_pattern) || []; };
  // True when a text has at least one letter
  core.has_letters = function (text) { return core.letters_pattern.test(String(text)); };
  // Moves keyboard focus to an element, making it focusable first when needed
  core.focus_element = function (element) {
    if (!element) return;
    var focusable = element.matches && element.matches('a[href],button,input,select,textarea,summary,[tabindex],[contenteditable="true"]');
    if (!focusable) element.setAttribute('tabindex', '-1');
    try { element.scrollIntoView({ block: 'center', behavior: 'auto' }); } catch (error) { element.scrollIntoView(); }
    try { element.focus({ preventScroll: true }); } catch (error) { element.focus(); }
    element.classList.add('acc-target');
    core.run_later(function () { element.classList.remove('acc-target'); }, 1600);
  };
  // Sends play or pause to an embedded YouTube or Vimeo player
  core.post_to_player = function (frame, command) {
    var src = frame.getAttribute('src') || '';
    try {
      if (/youtube(-nocookie)?\.com\/embed/i.test(src)) {
        var callback = { pause: 'pauseVideo', mute: 'mute', unmute: 'unMute' }[command];
        if (callback) frame.contentWindow.postMessage(JSON.stringify({ event: 'command', func: callback, args: [] }), '*');
      } else if (/player\.vimeo\.com/i.test(src)) {
        var message = command === 'pause' ? { method: 'pause' } : { method: 'setVolume', value: command === 'mute' ? 0 : 1 };
        frame.contentWindow.postMessage(JSON.stringify(message), '*');
      }
    } catch (error) { /* cross-origin player not reachable */ }
  };
  // Adds a stylesheet link to the page
  core.add_css_link = function (href, onerror) {
    var link_element = document.createElement('link');
    link_element.rel = 'stylesheet'; link_element.href = href; link_element.setAttribute('data-accessibles', '');
    if (onerror) link_element.onerror = onerror;
    (document.head || document.documentElement).appendChild(link_element);
    return link_element;
  };
  core.version = '1.0.0';
  core.native_set_timeout = window.setTimeout;
  core.native_clear_timeout = window.clearTimeout;
});
