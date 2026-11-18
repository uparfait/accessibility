/* dark-mode/dark-mode-3.js: Dark mode, continued: reading every color of the page, then writing the new ones */
accessibles_core.define('dark-mode/dark-mode-3.js', [], function (core) {
  'use strict';
  // Reads every color first and only then writes the new ones, a few hundred at a time so the page stays responsive
  core.dark_mode.read_then_write = function (list, turn) {
    var self = this, notes = [], index = 0;
    var read_some = function () {
      if (turn !== self.turn) return;
      for (var end = Math.min(list.length, index + 300); index < end; index++) notes.push(self.read(list[index]));
      if (index < list.length) core.run_later(read_some, 0); else { index = 0; write_some(); }
    };
    var write_some = function () {
      if (turn !== self.turn) return;
      for (var end = Math.min(notes.length, index + 300); index < end; index++) self.write(notes[index]);
      if (index < notes.length) core.run_later(write_some, 0);
    };
    read_some();
  };
  // The colors one element sets itself, turned around (colors it only takes from its parent follow the parent)
  core.dark_mode.read = function (element) {
    var self = this, style = getComputedStyle(element), parent = element.parentElement, colors = {};
    // Content added later inside a part that is already dark takes its color from there, unless it sets its own
    var parent_now = parent && parent.__acc_dark ? getComputedStyle(parent).color : null;
    if (!parent_now || style.color !== parent_now) colors.color = this.flip(style.color);
    // The very back of the page (html) is made black by the page styles, not here
    if (element !== document.documentElement && !/rgba\(0, 0, 0, 0\)|transparent/.test(style.backgroundColor)) colors['background-color'] = this.flip(style.backgroundColor);
    if (/gradient/.test(style.backgroundImage)) colors['background-image'] = this.flip_gradient(style.backgroundImage);
    ['top', 'right', 'bottom', 'left'].forEach(function (side) {
      if (parseFloat(style['border-' + side + '-width']) > 0) colors['border-' + side + '-color'] = self.flip(style['border-' + side + '-color']);
    });
    if (window.SVGElement && element instanceof SVGElement) {
      ['fill', 'stroke'].forEach(function (name) { if (/rgb/.test(style[name]) && self.is_gray(style[name])) colors[name] = self.flip(style[name]); });
    }
    return { element: element, colors: colors };
  };
  // Writes the new colors on the element; everything it changes is undone when dark mode turns off
  core.dark_mode.write = function (note) {
    var element = note.element, extra = '';
    if (element.__acc_dark || !element.isConnected) return;
    for (var name in note.colors) if (note.colors[name]) extra += name + ':' + note.colors[name] + ' !important;';
    element.__acc_dark = true;
    this.done.push(element);
    if (extra) this.recorder.set(element, 'style', (element.getAttribute('style') || '').replace(/;?\s*$/, ';') + extra);
  };
});
