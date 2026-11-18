/* magnifier/magnifier-4.js: Magnifier, continued: placing the glass, dragging it, and keeping its copy up to date */
accessibles_core.define('magnifier/magnifier-4.js', [], function (core) {
  'use strict';
  // Puts the middle of the glass on a point of the screen and shows that spot of the page bigger inside it
  core.magnifier.place = function (x, y) {
    if (!this.host) return;
    this.x = x; this.y = y; this.shown = true;
    var zoom = this.zoom(), size = Math.round(Math.min(220, core.view_width() * 0.5)), inner = size - 6;
    this.host.style.setProperty('display', 'block', 'important');
    this.host.style.setProperty('pointer-events', this.dragged() ? 'auto' : 'none', 'important');
    this.host.style.setProperty('transform', 'translate(' + Math.round(x - size / 2) + 'px,' + Math.round(y - size / 2) + 'px)', 'important');
    this.glass.style.width = this.glass.style.height = size + 'px';
    this.glass.style.cursor = this.dragged() ? 'grab' : 'none';
    this.update_live();
    var page_x = x + window.pageXOffset, page_y = y + window.pageYOffset;
    this.view.style.transform = 'translate(' + (inner / 2 - page_x * zoom) + 'px,' + (inner / 2 - page_y * zoom) + 'px) scale(' + zoom + ')';
  };
  // Hides the glass until the pointer is back on the page
  core.magnifier.hide = function () { if (this.host) { this.host.style.setProperty('display', 'none', 'important'); this.shown = false; } };
  // After scrolling or a change, the glass shows what is under it now
  core.magnifier.redraw = function () { if (this.host && this.shown) this.place(this.x, this.y); };
  // Videos and drawings get their current picture; fixed boxes and scrolled areas match the page
  core.magnifier.update_live = function () {
    var scroll_x = window.pageXOffset, scroll_y = window.pageYOffset;
    this.live.forEach(function (pair) { try { pair[0].getContext('2d').drawImage(pair[1], 0, 0, pair[0].width, pair[0].height); } catch (error) { /* not ready yet */ } });
    this.fixed.forEach(function (pair) {
      var rect = pair[1].getBoundingClientRect();
      pair[0].style.setProperty('position', 'absolute', 'important');
      pair[0].style.setProperty('left', rect.left + scroll_x + 'px', 'important');
      pair[0].style.setProperty('top', rect.top + scroll_y + 'px', 'important');
      pair[0].style.setProperty('right', 'auto', 'important'); pair[0].style.setProperty('bottom', 'auto', 'important');
      pair[0].style.setProperty('width', rect.width + 'px', 'important');
    });
    this.scrolled.forEach(function (pair) { pair[0].scrollTop = pair[1].scrollTop; pair[0].scrollLeft = pair[1].scrollLeft; });
  };
  // On touch screens a finger drags the glass anywhere; the page keeps scrolling around it
  core.magnifier.bind_drag = function () {
    var self = this, drag = null;
    this.host.addEventListener('pointerdown', function (event) {
      if (!self.dragged()) return;
      drag = { id: event.pointerId, dx: event.clientX - self.x, dy: event.clientY - self.y };
      try { self.host.setPointerCapture(event.pointerId); } catch (error) { /* ignore */ }
      self.glass.style.cursor = 'grabbing';
      event.preventDefault();
    });
    this.host.addEventListener('pointermove', function (event) {
      if (!drag || event.pointerId !== drag.id) return;
      self.place(core.clamp(event.clientX - drag.dx, 0, core.view_width()), core.clamp(event.clientY - drag.dy, 0, core.view_height()));
    });
    var end = function () { drag = null; if (self.glass) self.glass.style.cursor = 'grab'; };
    this.host.addEventListener('pointerup', end);
    this.host.addEventListener('pointercancel', end);
  };
});
