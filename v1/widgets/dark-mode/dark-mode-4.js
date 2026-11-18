/* dark-mode/dark-mode-4.js: Dark mode, continued: a last check of every element, so nothing stays light */
accessibles_core.define('dark-mode/dark-mode-4.js', [], function (core) {
  'use strict';
  // Looks at every element after the dark stylesheet is in place, a few hundred at a time so the page stays responsive
  core.dark_mode.check_elements = function (list, turn) {
    var self = this, index = 0;
    var check_some = function () {
      if (turn !== self.turn) return;
      var notes = [];
      for (var end = Math.min(list.length, index + 300); index < end; index++) notes.push(self.read(list[index]));
      notes.forEach(function (note) { self.write(note); });
      if (index < list.length) core.run_later(check_some, 0);
    };
    check_some();
  };
  // Colors that are still light behind, or still dark in front, get their dark-mode version written on the element
  core.dark_mode.read = function (element) {
    var self = this, style = getComputedStyle(element), colors = {};
    var back = this.read_color(style.backgroundColor);
    if (back && this.to_hsl(back)[2] > 0.3) colors['background-color'] = this.map_color('back', back);
    if (/gradient/.test(style.backgroundImage)) {
      var gradient = this.map_value('back', style.backgroundImage);
      if (gradient !== style.backgroundImage) colors['background-image'] = gradient;
    }
    var text = this.read_color(style.color);
    if (text && this.to_hsl(text)[2] < 0.6) colors.color = this.map_color('text', text);
    ['top', 'right', 'bottom', 'left'].forEach(function (side) {
      var line = parseFloat(style['border-' + side + '-width']) > 0 && self.read_color(style['border-' + side + '-color']);
      if (line && self.to_hsl(line)[2] > 0.55) colors['border-' + side + '-color'] = self.map_color('line', line);
    });
    if (window.SVGElement && element instanceof SVGElement) {
      ['fill', 'stroke'].forEach(function (name) {
        var paint = self.read_color(style[name]);
        if (paint && self.to_hsl(paint)[1] < 0.15 && self.to_hsl(paint)[2] < 0.6) colors[name] = self.map_color('text', paint);
      });
    }
    return { element: element, colors: colors };
  };
  // Writes the colors on the element; everything it changes is undone when dark mode turns off
  core.dark_mode.write = function (note) {
    var element = note.element, extra = '';
    if (element.__acc_dark || !element.isConnected) return;
    for (var name in note.colors) if (note.colors[name]) extra += name + ':' + note.colors[name] + ' !important;';
    element.__acc_dark = true;
    this.done.push(element);
    if (extra) this.recorder.set(element, 'style', (element.getAttribute('style') || '').replace(/;?\s*$/, ';') + extra);
  };
});
