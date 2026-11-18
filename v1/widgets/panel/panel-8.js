/* panel/panel-8.js: The button, the panel, its tabs, tiles, views, help and messages, continued */
accessibles_core.define('panel/panel-8.js', [], function (core) {
  'use strict';
    // Drag the button (mouse, pen and touch); a short press is a click
  core.ui.bind_launcher_drag = function () {
    var self = this;
    var launch = core.find_one('.launch');
    var drag = null, suppress = false;
    launch.addEventListener('pointerdown', function (event) {
      if (event.button !== 0 || !core.config.draggable) return;
      var rect = launch.getBoundingClientRect();
      drag = { id: event.pointerId, start_x: event.clientX, start_y: event.clientY, origin_x: rect.left, origin_y: rect.top, moved: false };
      try { launch.setPointerCapture(event.pointerId); } catch (error) { /* ignore */ }
    });
    launch.addEventListener('pointermove', function (event) {
      if (!drag || event.pointerId !== drag.id) return;
      var delta_x = event.clientX - drag.start_x, delta_y = event.clientY - drag.start_y;
      if (!drag.moved && Math.sqrt(delta_x * delta_x + delta_y * delta_y) < 6) return;
      drag.moved = true;
      launch.classList.add('dragging');
      self.hide_card(true);
      var text = self.launcher_size();
      launch.style.left = core.clamp(drag.origin_x + delta_x, 8, core.view_width() - text - 8) + 'px';
      launch.style.top = core.clamp(drag.origin_y + delta_y, 8, core.view_height() - text - 8) + 'px';
      if (self.open && !self.panel_pos) self.place_panel();
    });
    var end = function (event) {
      if (!drag || event.pointerId !== drag.id) return;
      if (drag.moved) {
        var rect = launch.getBoundingClientRect();
        core.drag_position = { x: (rect.left + rect.width / 2) / core.view_width(), y: (rect.top + rect.height / 2) / core.view_height() };
        suppress = true;
        core.save_settings();
        core.run_later(function () { suppress = false; }, 50);
      }
      launch.classList.remove('dragging');
      drag = null;
    };
    launch.addEventListener('pointerup', end);
    launch.addEventListener('pointercancel', end);
    launch.addEventListener('click', function (event) { if (suppress) { event.preventDefault(); return; } self.toggle(event.detail === 0); });
  };
    // Alt and an arrow key move the button too (keyboard alternative to dragging)
  core.ui.bind_launcher_keys = function () {
    var self = this;
    var launch = core.find_one('.launch');
    launch.addEventListener('keydown', function (event) {
      if (!event.altKey || !/^Arrow/.test(event.key)) return;
      event.preventDefault();
      var rect = launch.getBoundingClientRect(), step = 24;
      var next_x = rect.left + rect.width / 2 + (event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0);
      var next_y = rect.top + rect.height / 2 + (event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0);
      core.drag_position = { x: core.clamp(next_x / core.view_width(), 0, 1), y: core.clamp(next_y / core.view_height(), 0, 1) };
      self.place_launcher(); core.save_settings();
    });
  };
});
