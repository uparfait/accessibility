/* panel/panel-9.js: The button, the panel, its tabs, tiles, views, help and messages, continued */
accessibles_core.define('panel/panel-9.js', [], function (core) {
  'use strict';
    // Drag the panel by its header on larger screens
  core.ui.bind_panel_drag = function () {
    var self = this;
    var head = core.find_one('.head'), panel_drag = null;
    head.addEventListener('pointerdown', function (event) {
      if (event.button !== 0 || event.target.closest('button') || core.view_width() < 640) return;
      var rect = core.find_one('.panel').getBoundingClientRect();
      panel_drag = { id: event.pointerId, start_x: event.clientX, start_y: event.clientY, origin_x: rect.left, origin_y: rect.top };
      try { head.setPointerCapture(event.pointerId); } catch (error) { /* ignore */ }
    });
    head.addEventListener('pointermove', function (event) {
      if (!panel_drag || event.pointerId !== panel_drag.id) return;
      self.panel_pos = { x: panel_drag.origin_x + event.clientX - panel_drag.start_x, y: panel_drag.origin_y + event.clientY - panel_drag.start_y };
      self.place_panel();
    });
    var end_panel_drag = function () { panel_drag = null; };
    head.addEventListener('pointerup', end_panel_drag); head.addEventListener('pointercancel', end_panel_drag);
  };
    // Clicks, typing, keys and scrolling inside the panel
  core.ui.bind_panel_events = function () {
    var self = this;
    core.root.addEventListener('click', function (event) { self.on_click(event); });
    core.find_one('.body').addEventListener('scroll', function () { self.sync_head(); }, { passive: true });
    core.root.addEventListener('input', function (event) { self.on_input(event); });
    // Text boxes are handled as you type. Their "change" fires again on blur, and re-drawing the list then
    // would swallow the click that caused the blur, so it is ignored.
    core.root.addEventListener('change', function (event) { if (event.target.matches('input[type="text"],input:not([type]),input[type="search"],.inp')) return; self.on_input(event, true); });
    core.root.addEventListener('keydown', function (event) { self.on_key(event); });
  };
    // The panel's icon buttons show the same tooltip bubble (no plain browser tooltips)
  core.ui.bind_tooltips = function () {
    var self = this;
    core.root.addEventListener('pointerover', function (event) {
      if (event.pointerType === 'touch') return;
      var target = event.target.closest && event.target.closest('[data-tt]');
      if (target && target !== core.tooltip_bubble.element && self.tooltip_wanted(target)) core.tooltip_bubble.show(target, core.translate_ui(target.getAttribute('data-tt')), 450);
    });
    core.root.addEventListener('pointerout', function (event) {
      var target = event.target.closest && event.target.closest('[data-tt]');
      if (target && !target.contains(event.relatedTarget)) core.tooltip_bubble.hide();
    });
    core.root.addEventListener('focusin', function (event) { var target = event.target.closest && event.target.closest('[data-tt]'); if (target && self.by_keyboard && self.tooltip_wanted(target)) core.tooltip_bubble.show(target, core.translate_ui(target.getAttribute('data-tt')), 200); });
    core.root.addEventListener('focusout', function () { if (!core.state.tooltips) core.tooltip_bubble.hide(); });
  };
});
