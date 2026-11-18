/* dark-mode/dark-mode-2.js: Dark mode, continued: making one color dark (backgrounds) or light (text), keeping its hue */
accessibles_core.define('dark-mode/dark-mode-2.js', [], function (core) {
  'use strict';
  // Reads any CSS color into red, green, blue (0 to 255) and how solid it is (0 to 1); null for "transparent" or unknown
  core.dark_mode.read_color = function (text) {
    text = String(text || '').trim();
    if (!text || /^(transparent|currentcolor|inherit|initial|unset|none)$/i.test(text)) return null;
    var match = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,\/]+([\d.]+%?))?/i.exec(text);
    if (match) {
      var alpha = match[4] === undefined ? 1 : /%$/.test(match[4]) ? parseFloat(match[4]) / 100 : +match[4];
      return alpha > 0 ? [+match[1], +match[2], +match[3], alpha] : null;
    }
    var rgb = core.parse_color(text);
    return rgb ? rgb.concat(1) : null;
  };
  // Hue (0 to 360), saturation and lightness (0 to 1) of a color
  core.dark_mode.to_hsl = function (color) {
    var red = color[0] / 255, green = color[1] / 255, blue = color[2] / 255;
    var max = Math.max(red, green, blue), min = Math.min(red, green, blue), light = (max + min) / 2, spread = max - min, hue = 0, saturation = 0;
    if (spread) {
      saturation = spread / (1 - Math.abs(2 * light - 1));
      hue = max === red ? ((green - blue) / spread) % 6 : max === green ? (blue - red) / spread + 2 : (red - green) / spread + 4;
      hue = (hue * 60 + 360) % 360;
    }
    return [hue, Math.min(1, saturation), light];
  };
  // A CSS color from hue, saturation, lightness and how solid it is
  core.dark_mode.from_hsl = function (hue, saturation, light, alpha) {
    var chroma = (1 - Math.abs(2 * light - 1)) * saturation, middle = chroma * (1 - Math.abs((hue / 60) % 2 - 1)), base = light - chroma / 2;
    var rgb = hue < 60 ? [chroma, middle, 0] : hue < 120 ? [middle, chroma, 0] : hue < 180 ? [0, chroma, middle] : hue < 240 ? [0, middle, chroma] : hue < 300 ? [middle, 0, chroma] : [chroma, 0, middle];
    return 'rgba(' + rgb.map(function (value) { return Math.round((value + base) * 255); }).join(', ') + ', ' + alpha + ')';
  };
  // The dark-mode version of a color: backgrounds always end dark, text always ends light, lines in between
  core.dark_mode.map_color = function (role, color) {
    var hsl = this.to_hsl(color), hue = hsl[0], saturation = hsl[1], light = hsl[2], far = light > 0.5 ? 1 - light : light;
    if (role === 'back') return this.from_hsl(hue, saturation * 0.8, 0.03 + far * 0.32, color[3]);
    if (role === 'line') return this.from_hsl(hue, saturation * 0.6, 0.2 + far * 0.3, color[3]);
    return this.from_hsl(hue, Math.min(saturation, 0.6), light < 0.5 ? 0.93 - light * 0.3 : 0.78 + (light - 0.5) * 0.3, color[3]);
  };
  // A whole CSS value with every color in it made dark or light (a gradient keeps its shape)
  core.dark_mode.map_value = function (role, value) {
    var self = this;
    value = this.resolve_variables(value);
    if (role === 'back' && /gradient/.test(value)) {
      return value.replace(/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)|\b(white|black)\b/gi, function (part) { var color = self.read_color(part); return color ? self.map_color('back', color) : part; });
    }
    var color = this.read_color(value);
    return color ? this.map_color(role, color) : null;
  };
  // Replaces var(--name) with the value the page gives it, so colors set through variables are changed too
  core.dark_mode.resolve_variables = function (value) {
    var root_style = getComputedStyle(document.documentElement);
    for (var round = 0; round < 5 && /var\(/.test(value); round++) {
      value = value.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*))?\)/g, function (all, name, fallback) { return root_style.getPropertyValue(name).trim() || fallback || ''; });
    }
    return value;
  };
});
