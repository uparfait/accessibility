/* magnifier/magnifier.js: Magnifier: a round glass that makes everything under the pointer bigger */
accessibles_core.define('magnifier/magnifier.js', ['magnifier-2.js', 'magnifier-3.js'], function (core) {
  'use strict';
  // Settings saved before the magnifier had levels say true: that is the middle level now
  if (core.state.magnifier === true) core.state.magnifier = 2;
  core.magnifier = {
    host: null, shadow: null, glass: null, view: null, copy_timer: 0,
    // How much bigger things look under the glass (0 when it is off)
    zoom: function () { return +core.state.magnifier || 0; },
    // Builds the glass above the page, with its own copy of the page inside it
    open: function () {
      if (this.host) return;
      var self = this, host = this.host = document.createElement('accessibles-lens');
      host.setAttribute('aria-hidden', 'true');
      host.style.cssText = 'all:initial!important;position:fixed!important;left:0!important;top:0!important;z-index:2147483646!important;pointer-events:none!important;display:none!important';
      this.shadow = host.attachShadow({ mode: 'open' });
      this.shadow.innerHTML = '<style>' + this.css + '</style><lens-glass><lens-view></lens-view></lens-glass>';
      this.glass = this.shadow.querySelector('lens-glass'); this.view = this.shadow.querySelector('lens-view');
      document.documentElement.appendChild(host);
      this.copy_page();
      this.watch = new MutationObserver(function () { self.copy_soon(); });
      this.watch.observe(document.body, { childList: true, subtree: true, characterData: true });
      this.on_change = function () { self.copy_soon(); };
      window.addEventListener('accessibles:change', this.on_change);
      window.addEventListener('resize', this.on_change);
    },
    // Takes the glass away
    close: function () {
      if (!this.host) return;
      this.watch.disconnect();
      window.removeEventListener('accessibles:change', this.on_change);
      window.removeEventListener('resize', this.on_change);
      core.cancel_later(this.copy_timer);
      this.host.remove();
      this.host = this.shadow = this.glass = this.view = null;
    },
    // The page changed: the copy inside the glass is made again a moment later
    copy_soon: function () {
      var self = this;
      core.cancel_later(this.copy_timer);
      this.copy_timer = core.run_later(function () { if (self.host) self.copy_page(); }, 800);
    }
  };
  core.register('pointer_drawer', { folder: 'magnifier', order: 30,
    is_on: function () { return core.magnifier.zoom() > 0; },
    show: function () { if (!core.magnifier.zoom()) core.magnifier.close(); },
    // The glass sits on the pointer (just above a finger on touch screens) and shows that spot bigger
    draw: function (pointer_state) {
      var lens = core.magnifier, zoom = lens.zoom(), target = pointer_state.last_target;
      lens.open();
      if (pointer_state.x < 0 || (target && core.is_ours(target))) { lens.host.style.setProperty('display', 'none', 'important'); return; }
      var size = Math.round(Math.min(220, core.view_width() * 0.46)), inner = size - 6;
      var left = pointer_state.x - size / 2, top = pointer_state.y - size / 2 - (pointer_state.touch ? size * 0.7 : 0);
      lens.host.style.setProperty('display', 'block', 'important');
      lens.host.style.setProperty('transform', 'translate(' + Math.round(left) + 'px,' + Math.round(top) + 'px)', 'important');
      lens.glass.style.width = lens.glass.style.height = size + 'px';
      var page_x = pointer_state.x + window.pageXOffset, page_y = pointer_state.y + window.pageYOffset;
      lens.view.style.transform = 'translate(' + (inner / 2 - page_x * zoom) + 'px,' + (inner / 2 - page_y * zoom) + 'px) scale(' + zoom + ')';
    } });
});
