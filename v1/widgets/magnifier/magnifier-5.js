/* magnifier/magnifier-5.js: Magnifier, continued: taking the glass away, refreshing its copy, and the page color */
accessibles_core.define('magnifier/magnifier-5.js', [], function (core) {
  'use strict';
  // Takes the glass away
  core.magnifier.close = function () {
    if (!this.host) return;
    this.watch.disconnect();
    window.removeEventListener('accessibles:change', this.on_change);
    window.removeEventListener('resize', this.on_change);
    window.removeEventListener('scroll', this.on_scroll, { capture: true });
    core.cancel_later(this.copy_timer);
    this.host.remove();
    this.host = this.shadow = this.glass = this.view = null;
    this.live = []; this.fixed = []; this.scrolled = []; this.frame_sources = []; this.frames = []; this.x = this.y = -1; this.shown = false;
  };
  // The page changed: the copy inside the glass is made again, at most every three seconds
  core.magnifier.copy_soon = function () {
    var self = this, wait = Math.max(600, 3000 - (Date.now() - this.copied_at));
    core.cancel_later(this.copy_timer);
    this.copy_timer = core.run_later(function () { if (self.host) { self.copy_page(); self.redraw(); } }, wait);
  };
  // The color behind the page, so the glass is never see-through
  core.magnifier.page_background = function () {
    var colors = [getComputedStyle(document.body).backgroundColor, getComputedStyle(document.documentElement).backgroundColor];
    for (var index = 0; index < colors.length; index++) {
      if (colors[index] && !/rgba\(0, 0, 0, 0\)|transparent/.test(colors[index])) return colors[index];
    }
    return '#ffffff';
  };
});
