/* magnifier/magnifier.js: Magnifier: a round glass that makes everything under it bigger */
accessibles_core.define('magnifier/magnifier.js', ['magnifier-2.js', 'magnifier-3.js', 'magnifier-4.js', 'magnifier-5.js'], function (core) {
  'use strict';
  // Settings saved before the magnifier had levels say true: that is the middle level now
  if (core.state.magnifier === true) core.state.magnifier = 2;
  core.magnifier = {
    host: null, shadow: null, glass: null, view: null, copy_timer: 0, copied_at: 0, x: -1, y: -1, shown: false,
    live: [], fixed: [], scrolled: [],
    // How much bigger things look under the glass (0 when it is off)
    zoom: function () { return +core.state.magnifier || 0; },
    // On touch screens the glass is dragged with a finger; with a mouse it follows the pointer
    dragged: function () { return !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || !!core.pointer.touch; },
    // Builds the glass above the page, with its own copy of the page inside it
    open: function () {
      if (this.host) return;
      var self = this, host = this.host = document.createElement('accessibles-lens');
      host.setAttribute('aria-hidden', 'true');
      host.style.cssText = 'all:initial!important;position:fixed!important;left:0!important;top:0!important;z-index:2147483646!important;display:none!important';
      this.shadow = host.attachShadow({ mode: 'open' });
      this.shadow.innerHTML = '<style>' + this.css + '</style><lens-glass><lens-view></lens-view></lens-glass>';
      this.glass = this.shadow.querySelector('lens-glass'); this.view = this.shadow.querySelector('lens-view');
      document.documentElement.appendChild(host);
      this.bind_drag();
      this.copy_page();
      this.watch = new MutationObserver(function () { self.copy_soon(); });
      this.watch.observe(document.body, { childList: true, subtree: true, characterData: true });
      this.on_change = function () { self.copy_soon(); };
      this.on_scroll = function () { self.redraw(); };
      window.addEventListener('accessibles:change', this.on_change);
      window.addEventListener('resize', this.on_change);
      window.addEventListener('scroll', this.on_scroll, { passive: true, capture: true });
    }
  };
  core.register('pointer_drawer', { folder: 'magnifier', order: 30,
    is_on: function () { return core.magnifier.zoom() > 0; },
    show: function () {
      var lens = core.magnifier;
      if (!lens.zoom()) { lens.close(); return; }
      lens.open();
      // On touch screens the glass waits in the middle of the screen until it is dragged
      if (lens.dragged() && lens.x < 0) lens.place(core.view_width() / 2, core.view_height() / 3);
      else lens.redraw();
    },
    // With a mouse, the glass sits on the pointer; it hides over the widget itself
    draw: function (pointer_state) {
      var lens = core.magnifier, target = pointer_state.last_target;
      if (lens.dragged()) return;
      lens.open();
      if (pointer_state.x < 0 || (target && core.is_ours(target))) { lens.hide(); return; }
      lens.place(pointer_state.x, pointer_state.y);
    } });
});
