/* more-time/more-time.js: More time: stretches page timers */
accessibles_core.define('more-time/more-time.js', [], function (core) {
  'use strict';
  // Extended timeouts: long timers (session warnings, carousels) run 3× longer,
  // and mouse-leave handlers (hover menus) fire after a grace period.
  core.more_time = {
    on: false, pending: [],
    sync: function () { if (core.state.extendedTime && !this.on) this.enable(); else if (!core.state.extendedTime && this.on) this.disable(); },
    enable: function () {
      this.on = true;
      var near_black = 3, min_delay = 4000;
      window.setTimeout = function (callback, detail) { var first = Array.prototype.slice.call(arguments); if (typeof detail === 'number' && detail >= min_delay) first[1] = detail * near_black; return core.native_set_timeout.apply(window, first); };
      window.setInterval = function (callback, detail) { var first = Array.prototype.slice.call(arguments); if (typeof detail === 'number' && detail >= min_delay) first[1] = detail * near_black; return core.native_set_interval.apply(window, first); };
      window.addEventListener('mouseout', this.on_leave, true);
      window.addEventListener('mouseleave', this.on_leave, true);
    },
    disable: function () {
      this.on = false;
      window.setTimeout = core.native_set_timeout; window.setInterval = core.native_set_interval;
      window.removeEventListener('mouseout', this.on_leave, true);
      window.removeEventListener('mouseleave', this.on_leave, true);
      this.pending.forEach(function (muted_pair) { muted_pair(); });
      this.pending = [];
    },
    on_leave: function (event) {
      if (!event.isTrusted || core.is_ours(event.target) || !(event.target instanceof Element)) return;
      var target = event.target, type = event.type;
      // Only hold back leave events for things that look like menus or tooltips
      if (!target.closest('nav,[role="menu"],[role="menubar"],[role="navigation"],[aria-haspopup],[aria-expanded],[class*="menu"],[class*="dropdown"],[class*="nav"],[class*="tooltip"],[class*="popover"],[title]')) return;
      event.stopImmediatePropagation();
      var init = { bubbles: event.bubbles, cancelable: event.cancelable, clientX: event.clientX, clientY: event.clientY, relatedTarget: event.relatedTarget, view: window };
      var fire = function () { if (!target.matches(':hover')) target.dispatchEvent(new MouseEvent(type, init)); };
      var id = core.run_later(function () { core.more_time.pending.splice(core.more_time.pending.indexOf(fire), 1); fire(); }, 1500);
      core.more_time.pending.push(fire);
      return id;
    }
  };
  core.register('module', { folder: 'more-time', order: 120, module: core.more_time });
});
