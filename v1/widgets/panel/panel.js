/* panel/panel.js: The button, the panel, its tabs, tiles, views, help and messages */
accessibles_core.define('panel/panel.js', ['panel-2.js', 'panel-3.js', 'panel-4.js', 'panel-5.js', 'panel-6.js', 'panel-7.js', 'panel-8.js', 'panel-9.js', 'panel-10.js', 'panel-11.js', 'panel-12.js', 'panel-13.js', 'panel-14.js', 'panel-15.js', 'panel-16.js', 'panel-17.js', 'panel-18.js', 'panel-19.js', 'panel-20.js', 'panel-21.js', 'panel-22.js', 'panel-23.js', 'panel-24.js', 'panel-25.js', 'panel-26.js', 'panel-27.js', 'panel-28.js', 'panel-29.js', 'panel-30.js', 'panel-31.js', 'panel-32.js', 'panel-33.js'], function (core) {
  'use strict';
  // Shows a short message
  core.toast = function (message) {
    var element = core.find_one('.toast');
    if (!element) return;
    message = core.translate_ui(message);
    element.textContent = message;
    element.hidden = false;
    core.cancel_later(core.toast_timer);
    core.toast_timer = core.run_later(function () { element.hidden = true; }, 2800);
    core.announce(message);
  };
  // Tells screen readers about a change
  core.announce = function (message) {
    var element = core.find_one('.srl');
    if (!element) return;
    element.textContent = '';
    core.run_later(function () { element.textContent = message; }, 40);
  };

  // One tooltip bubble for both the page (Tooltips feature) and this panel's own icon buttons
  core.tooltip_bubble = {
    timer: 0, element: null,
    show: function (anchor, text, delay) {
      core.cancel_later(this.timer);
      var self = this;
      this.timer = core.run_later(function () { self.place(anchor, text); }, delay == null ? 350 : delay);
    },
    place: function (anchor, text) {
      var tip = core.find_one('.tip');
      if (!tip || !anchor || !anchor.isConnected || !text) return;
      this.element = anchor;
      tip.textContent = String(text).slice(0, 240);
      tip.classList.remove('up', 'down');
      tip.hidden = false;
      var rect = anchor.getBoundingClientRect(), width = tip.offsetWidth, height = tip.offsetHeight, gap = 10;
      var center_x = rect.left + rect.width / 2;
      var value = core.clamp(center_x - width / 2, 8, Math.max(8, core.view_width() - width - 8));
      var above = rect.top - height - gap >= 8;
      var value_2 = above ? rect.top - height - gap : Math.min(rect.bottom + gap, core.view_height() - height - 8);
      tip.classList.add(above ? 'up' : 'down');
      tip.style.setProperty('--ax', Math.round(core.clamp(center_x - value, 12, width - 12)) + 'px');
      tip.style.transform = 'translate(' + Math.round(value) + 'px,' + Math.round(value_2) + 'px)';
    },
    hide: function () { core.cancel_later(this.timer); this.element = null; var element = core.find_one('.tip'); if (element) element.hidden = true; }
  };
  core.ui = {
    open: false,
    tab: 'profiles',
    view: null,
    panel_pos: null,
    structure_mode: 'headings',
    structure_items: [],
    last_focus: null
  };
});
