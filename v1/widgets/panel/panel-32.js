/* panel/panel-32.js: The button, the panel, its tabs, tiles, views, help and messages, continued: back button and a free spot for the button */
accessibles_core.define('panel/panel-32.js', [], function (core) {
  'use strict';
  // Opening the panel adds a step to the browser history (same address, with a time stamp), so Back closes the panel
  core.ui.remember_open = function () {
    if (this.history_stamp || !window.history || !history.pushState) return;
    this.history_stamp = 'accessibles-' + Date.now();
    var state = {};
    for (var key in history.state || {}) state[key] = history.state[key];   // the site's own history data stays as it was
    state.accessibles_panel = this.history_stamp;
    try { history.pushState(state, '', location.href); } catch (error) { this.history_stamp = null; }
  };
  // Closing the panel takes that step away again
  core.ui.forget_open = function () {
    var stamp = this.history_stamp;
    this.history_stamp = null;
    if (stamp && history.state && history.state.accessibles_panel === stamp) history.back();
  };
  window.addEventListener('popstate', function () {
    var ui = core.ui;
    if (ui.open && ui.history_stamp && !(history.state && history.state.accessibles_panel === ui.history_stamp)) { ui.history_stamp = null; ui.close(); }
  });

  // True for a button, link, field or picture of the page that stays on the screen (fixed or sticky), such as a chat button or a cookie banner
  core.ui.is_useful_fixed = function (element) {
    if (!element || core.is_ours(element) || element === document.body || element === document.documentElement) return false;
    var useful = element.closest && element.closest('a[href],button,input,select,textarea,summary,iframe,img,video,label,[role="button"],[role="link"],[onclick],[tabindex]:not([tabindex="-1"])');
    for (var node = useful; node && node !== document.body; node = node.parentElement) {
      var position = getComputedStyle(node).position;
      if (position === 'fixed' || position === 'sticky') return true;
    }
    return false;
  };
  // True when the button would cover such a part of the page at this place, or sit right against it
  core.ui.blocked = function (left, top, size) {
    // The middle, and points just outside the corners and sides, so a small gap is kept too
    var gap = 6, xs = [left - gap, left + size / 2, left + size + gap], ys = [top - gap, top + size / 2, top + size + gap], points = [];
    xs.forEach(function (x) { ys.forEach(function (y) { points.push([x, y]); }); });
    return points.some(function (point) {
      return (document.elementsFromPoint ? document.elementsFromPoint(point[0], point[1]) : []).some(core.ui.is_useful_fixed);
    });
  };
  // Looks for a free place near the chosen corner: further up (or down), then further in from the side
  core.ui.free_spot = function (left, top, size, position) {
    var step = size + 12, vertical = position.v === 'top' ? 1 : -1, sideways = position.h === 'right' ? -1 : 1, tries = [[0, 0]];
    for (var count = 1; count <= 5; count++) tries.push([0, vertical * count * step]);
    for (var count_2 = 1; count_2 <= 4; count_2++) tries.push([sideways * count_2 * step, 0]);
    for (var index = 0; index < tries.length; index++) {
      var spot_left = left + tries[index][0], spot_top = top + tries[index][1];
      var inside = spot_left >= 8 && spot_top >= 8 && spot_left + size <= core.view_width() - 8 && spot_top + size <= core.view_height() - 8;
      if (inside && !this.blocked(spot_left, spot_top, size)) return { left: spot_left, top: spot_top };
    }
    return { left: left, top: top };
  };
  // Every two seconds the button checks its place again: banners and chat buttons often appear late
  core.native_set_interval.call(window, function () { if (core.root && !core.ui.open && !core.drag_position) core.ui.place_launcher(); }, 2000);
});
