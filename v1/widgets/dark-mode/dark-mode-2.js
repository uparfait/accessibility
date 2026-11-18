/* dark-mode/dark-mode-2.js: Dark mode, continued: turning one color around */
accessibles_core.define('dark-mode/dark-mode-2.js', [], function (core) {
  'use strict';
  // Reads a computed color such as "rgb(250, 250, 250)" into hue (0 to 360), saturation and lightness (0 to 1)
  core.dark_mode.to_hsl = function (text) {
    var match = /rgba?\(([^)]+)\)/.exec(text || '');
    if (!match) return null;
    var parts = match[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);
    var red = parts[0] / 255, green = parts[1] / 255, blue = parts[2] / 255, alpha = parts.length > 3 ? parts[3] : 1;
    var max = Math.max(red, green, blue), min = Math.min(red, green, blue), light = (max + min) / 2, spread = max - min, hue = 0, saturation = 0;
    if (spread) {
      saturation = spread / (1 - Math.abs(2 * light - 1));
      hue = max === red ? ((green - blue) / spread) % 6 : max === green ? (blue - red) / spread + 2 : (red - green) / spread + 4;
      hue = (hue * 60 + 360) % 360;
    }
    return { hue: hue, saturation: Math.min(1, saturation), light: light, alpha: alpha };
  };
  // Turns a color around: light becomes dark and dark becomes light; its hue and its strength stay
  core.dark_mode.flip = function (text) {
    var color = this.to_hsl(text);
    if (!color) return null;
    var light = 1 - color.light, chroma = (1 - Math.abs(2 * light - 1)) * color.saturation;
    var middle = chroma * (1 - Math.abs((color.hue / 60) % 2 - 1)), base = light - chroma / 2, hue = color.hue;
    var rgb = hue < 60 ? [chroma, middle, 0] : hue < 120 ? [middle, chroma, 0] : hue < 180 ? [0, chroma, middle] : hue < 240 ? [0, middle, chroma] : hue < 300 ? [middle, 0, chroma] : [chroma, 0, middle];
    return 'rgba(' + rgb.map(function (value) { return Math.round((value + base) * 255); }).join(', ') + ', ' + color.alpha + ')';
  };
  // Every color inside a gradient turned around, so the gradient keeps its shape
  core.dark_mode.flip_gradient = function (text) {
    return text.replace(/rgba?\([^)]+\)/g, function (color) { return core.dark_mode.flip(color) || color; });
  };
  // True for black, white and grays: icons in those colors are turned around, colored logos are not
  core.dark_mode.is_gray = function (text) { var color = this.to_hsl(text); return !!color && color.saturation < 0.15; };
});
