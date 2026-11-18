/* helpers/helpers.js: Small shared tools: timers, finding elements, text and word helpers */
accessibles_core.define('helpers/helpers.js', ['helpers-2.js', 'helpers-3.js'], function (core) {
  'use strict';
  // Runs a callback after a delay, with the browser's own timer (page scripts cannot slow it down)
  core.run_later = function (callback, delay_ms) { return core.native_set_timeout.call(window, callback, delay_ms || 0); };
  // Cancels a callback set with run_later
  core.cancel_later = function (timer_id) { core.native_clear_timeout.call(window, timer_id); };
  // The first element matching a selector, inside the widget unless another root is given
  core.find_one = function (selector, root) { return (root || core.shadow).querySelector(selector); };
  // Every element matching a selector, as an array, inside the widget unless another root is given
  core.find_all = function (selector, root) { return Array.prototype.slice.call((root || core.shadow).querySelectorAll(selector)); };
  // Makes text safe to put inside HTML
  core.escape_html = function (text) {
    return String(text == null ? '' : text).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  };
  // Keeps a number between a lowest and a highest value
  core.clamp = function (value, min_value, max_value) { return Math.max(min_value, Math.min(max_value, value)); };
  // The width of the visible page area
  core.view_width = function () { return document.documentElement.clientWidth || window.innerWidth; };
  // The height of the visible page area
  core.view_height = function () { return window.innerHeight || document.documentElement.clientHeight; };
  // True when a node belongs to the widget itself
  core.is_ours = function (node) { return !!node && !!core.host && (node === core.host || core.host.contains(node)); };
  // The reader view is the widget's own copy of the page; reading aids treat it like page content
  core.in_reader = function (element) { return !!(element && element.closest && element.closest('.rbody')); };
  // True when a node is page content (the reader view counts as page content)
  core.is_page_like = function (element) { return !!element && (!core.is_ours(element) || core.in_reader(element)); };
  // The element really under the pointer, also inside the widget (events from it reach the page as the widget itself)
  core.real_target = function (event) { var part = event.composedPath && event.composedPath(), target = part && part[0]; if (target && target.nodeType === 3) target = target.parentElement; return target && target.nodeType === 1 ? target : event.target; };
  // The current text selection, inside the reader view when it is open
  core.get_selection = function () {
    var element = core.shadow && core.shadow.querySelector('.reader');
    if (element && !element.hidden && core.shadow.getSelection) { var selection = core.shadow.getSelection(); if (selection && selection.rangeCount && !selection.isCollapsed) return selection; }
    return window.getSelection ? window.getSelection() : null;
  };
  // The visible text of an element, with spaces tidied
  core.text_of = function (element) { return ((element && (element.innerText || element.textContent)) || '').replace(/\s+/g, ' ').trim(); };
  // True when an element takes up space and is not hidden
  core.is_visible = function (element) {
    if (!element || !element.getClientRects || !element.getClientRects().length) return false;
    var style = getComputedStyle(element);
    return style.visibility !== 'hidden' && style.display !== 'none' && parseFloat(style.opacity) > 0.02;
  };
  // True when part of an element is on screen
  core.in_viewport = function (element) {
    var rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0 && rect.top < core.view_height() && rect.left < core.view_width();
  };
  // Waits until calls stop for a moment before running the callback
  core.debounce = function (callback, delay_ms) { var timer; return function () { core.cancel_later(timer); timer = core.run_later(callback, delay_ms); }; };
  // The language of the page
  core.page_lang = function () { return (core.config && core.config.lang) || document.documentElement.getAttribute('lang') || navigator.language || 'en'; };
  // The language the visitor uses: the language they chose to translate into, else the panel language, else the page language
  core.user_lang = function () { return (typeof core.state !== 'undefined' && core.state.translateTo) || (typeof core.panel_translation !== 'undefined' && core.panel_translation.lang) || core.page_lang(); };
});
