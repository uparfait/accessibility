/* pointer/pointer.js: Follows the mouse or finger for the reading guide, mask and magnifier */
accessibles_core.define('pointer/pointer.js', [], function (core) {
  'use strict';
  core.pointer = {
    x: -1, y: -1, frame_request: 0, bound: false, last_target: null, last_width: 0, last_height: 0,
    // Follows the pointer only while a loaded drawing (guide, mask, magnifier) is on
    sync: function () {
      var drawers = core.registered('pointer_drawer').filter(function (drawer) { return core.has(drawer.folder); });
      var need = drawers.some(function (drawer) { return drawer.is_on(); });
      if (need && !this.bound) this.listen(true);
      else if (!need && this.bound) this.listen(false);
      drawers.forEach(function (drawer) { drawer.show(); });
      if (this.y < 0 && drawers.some(function (drawer) { return drawer.from_middle && drawer.is_on(); })) { this.y = core.view_height() / 2; this.draw(); }
    },
    // Adds or removes the listeners: moving, tapping, and the screen changing size or turning
    listen: function (on) {
      var change = on ? 'addEventListener' : 'removeEventListener';
      this.bound = on;
      this.last_width = core.view_width(); this.last_height = core.view_height();
      document[change]('pointermove', this.on_move, { passive: true });
      document[change]('pointerdown', this.on_move, { passive: true });
      document[change]('touchmove', this.on_touch, { passive: true });
      window[change]('resize', this.on_resize);
      window[change]('orientationchange', this.on_resize);
      if (window.visualViewport) window.visualViewport[change]('resize', this.on_resize);
    },
    on_move: function (event) { core.pointer.x = event.clientX; core.pointer.y = event.clientY; core.pointer.last_target = core.real_target(event); core.pointer.schedule(); },
    on_touch: function (event) { var target = event.touches && event.touches[0]; if (!target) return; core.pointer.x = target.clientX; core.pointer.y = target.clientY; core.pointer.last_target = document.elementFromPoint(target.clientX, target.clientY); core.pointer.schedule(); },
    // The screen changed size: the drawings keep the same place on it, inside its new edges
    on_resize: function () {
      var pointer = core.pointer, width = core.view_width(), height = core.view_height();
      if (pointer.x >= 0 && pointer.last_width) pointer.x = core.clamp(pointer.x * width / pointer.last_width, 0, width - 1);
      if (pointer.y >= 0 && pointer.last_height) pointer.y = core.clamp(pointer.y * height / pointer.last_height, 0, height - 1);
      pointer.last_width = width; pointer.last_height = height;
      pointer.schedule();
    },
    schedule: function () { if (!this.frame_request) this.frame_request = requestAnimationFrame(function () { core.pointer.frame_request = 0; core.pointer.draw(); }); },
    // Lets every loaded drawing that is on follow the pointer
    draw: function () {
      var self = this;
      core.registered('pointer_drawer').forEach(function (drawer) { if (core.has(drawer.folder) && drawer.is_on()) drawer.draw(self); });
    }
  };
  core.register('module', { folder: 'pointer', order: 90, module: core.pointer });
});
