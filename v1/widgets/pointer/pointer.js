/* pointer/pointer.js: Follows the mouse or finger for the reading guide, mask and magnifier */
accessibles_core.define('pointer/pointer.js', [], function (core) {
  'use strict';
  core.pointer = {
    x: -1, y: -1, frame_request: 0, bound: false, last_target: null,
    // Follows the pointer only while a loaded drawing (guide, mask, magnifier) is on
    sync: function () {
      var drawers = core.registered('pointer_drawer').filter(function (drawer) { return core.has(drawer.folder); });
      var need = drawers.some(function (drawer) { return drawer.is_on(); });
      if (need && !this.bound) {
        this.bound = true;
        document.addEventListener('pointermove', this.on_move, { passive: true });
        document.addEventListener('touchmove', this.on_touch, { passive: true });
      } else if (!need && this.bound) {
        this.bound = false;
        document.removeEventListener('pointermove', this.on_move);
        document.removeEventListener('touchmove', this.on_touch);
      }
      drawers.forEach(function (drawer) { drawer.show(); });
      if (this.y < 0 && drawers.some(function (drawer) { return drawer.from_middle && drawer.is_on(); })) { this.y = core.view_height() / 2; this.draw(); }
    },
    on_move: function (event) { core.pointer.x = event.clientX; core.pointer.y = event.clientY; core.pointer.last_target = core.real_target(event); core.pointer.schedule(); },
    on_touch: function (event) { var target = event.touches && event.touches[0]; if (!target) return; core.pointer.x = target.clientX; core.pointer.y = target.clientY; core.pointer.last_target = document.elementFromPoint(target.clientX, target.clientY); core.pointer.schedule(); },
    schedule: function () { if (!this.frame_request) this.frame_request = requestAnimationFrame(function () { core.pointer.frame_request = 0; core.pointer.draw(); }); },
    // Lets every loaded drawing that is on follow the pointer
    draw: function () {
      var self = this;
      core.registered('pointer_drawer').forEach(function (drawer) { if (core.has(drawer.folder) && drawer.is_on()) drawer.draw(self); });
    }
  };
  core.register('module', { folder: 'pointer', order: 90, module: core.pointer });
});
