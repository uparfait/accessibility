/* panel/panel-5.js: The button, the panel, its tabs, tiles, views, help and messages, continued */
accessibles_core.define('panel/panel-5.js', [], function (core) {
  'use strict';
  // Places the panel next to the button, inside the screen
  core.ui.place_panel = function () {
    var element = core.find_one('.panel');
    if (!element || element.hidden) return;
    var white = core.view_width(), view_h = core.view_height(), match = 8, gap = 10;
    var font_size_px = parseFloat(core.root.style.fontSize) || 15;
    var value = Math.min(Math.round(44 * font_size_px), view_h - 2 * match);   // fixed height: switching tabs never makes it jump
    var width = element.offsetWidth;
    var left, top, panel_height = value;
    if (this.panel_pos) {
      left = this.panel_pos.x; top = this.panel_pos.y;
    } else {
      var rect = core.find_one('.launch').getBoundingClientRect();
      var above = rect.top - gap - match, below = view_h - rect.bottom - gap - match, left_2 = rect.left - gap - match, right = white - rect.right - gap - match;
      var center_x = rect.left + rect.width / 2, center_y = rect.top + rect.height / 2;
      var third = center_x < white / 3 ? 'left' : center_x > white * 2 / 3 ? 'right' : 'center';
      var align_x = third === 'right' ? rect.right - width : third === 'left' ? rect.left : center_x - width / 2;
      if (Math.max(above, below) >= Math.min(value, 30 * font_size_px)) {
        var use_below = below > above;
        panel_height = Math.min(value, use_below ? below : above);
        left = align_x; top = use_below ? rect.bottom + gap : rect.top - gap - panel_height;
        element.style.setProperty('--oy', use_below ? '0%' : '100%');
      } else if (Math.max(left_2, right) >= width) {
        left = right >= left_2 ? rect.right + gap : rect.left - gap - width;
        top = center_y - value / 2;
        element.style.setProperty('--oy', '50%');
      } else {
        left = (white - width) / 2; top = view_h - match - value;   // small screens: sheet over the page
        element.style.setProperty('--oy', '100%');
      }
      element.style.setProperty('--ox', third === 'right' ? '100%' : third === 'left' ? '0%' : '50%');
    }
    element.style.height = Math.round(panel_height) + 'px';
    element.style.maxHeight = (view_h - 2 * match) + 'px';
    element.style.left = Math.round(core.clamp(left, match, Math.max(match, white - width - match))) + 'px';
    element.style.top = Math.round(core.clamp(top, match, Math.max(match, view_h - panel_height - match))) + 'px';
    // The button stays hidden while the panel is open; the panel has its own close
    core.find_one('.launch').classList.toggle('under', !!this.open);
  };
});
