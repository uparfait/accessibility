/* panel/panel-4.js: The button, the panel, its tabs, tiles, views, help and messages, continued */
accessibles_core.define('panel/panel-4.js', [], function (core) {
  'use strict';
  // The size of the small button
  core.ui.launcher_size = function () { var element = core.find_one('.launch'); return element ? element.offsetWidth || 52 : 52; };
  // Places the small button in its corner, or where it was dragged
  core.ui.place_launcher = function () {
    var element = core.find_one('.launch');
    if (!element) return;
    var size = this.launcher_size(), white = core.view_width(), view_h = core.view_height(), match = 8, left, top;
    var position = core.state.position ? core.normalize_position(core.state.position) : core.config.position;
    if (core.drag_position) {
      left = core.drag_position.x * white - size / 2; top = core.drag_position.y * view_h - size / 2;
    } else {
      var shrink = Math.min(1, white / 400);
      var origin_x = Math.max(match, core.config.offset_x * shrink), origin_y = Math.max(match, core.config.offset_y * shrink);
      left = position.h === 'left' ? origin_x : position.h === 'right' ? white - size - origin_x : (white - size) / 2;
      top = position.v === 'top' ? origin_y : position.v === 'bottom' ? view_h - size - origin_y : (view_h - size) / 2;
    }
    left = core.clamp(left, match, white - size - match); top = core.clamp(top, match, view_h - size - match);
    // Not dragged by the visitor: keep clear of the page's own fixed buttons and bars
    if (!core.drag_position && this.free_spot) { var spot = this.free_spot(left, top, size, position); left = spot.left; top = spot.top; }
    element.style.transform = '';
    element.style.left = Math.round(left) + 'px';
    element.style.top = Math.round(top) + 'px';
    var active = core.visual_keys.some(function (shrink) { return JSON.stringify(core.state[shrink]) !== JSON.stringify(core.defaults[shrink]); });
    var changed = active || core.state.profiles.length || ['ariaFix', 'altText', 'formFix', 'oversized', 'ttsRate', 'ttsPitch', 'ttsVoice'].some(function (shrink) { return core.state[shrink] !== core.defaults[shrink]; });
    var reset_button = core.find_one('.foot .rst'); if (reset_button) reset_button.hidden = !changed;
    core.find_one('.dot', element).hidden = !active;
    var card = core.find_one('.lcard'); if (card && card.classList.contains('show')) this.show_card();
    if (this.open) this.place_panel();
  };
});
