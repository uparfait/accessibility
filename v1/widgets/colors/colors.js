/* colors/colors.js: Color math and the palette made from your brand color */
accessibles_core.define('colors/colors.js', ['colors-2.js'], function (core) {
  'use strict';
  // Reads any CSS color into red, green and blue numbers
  core.parse_color = function (input) {
    if (!input) return null;
    var text = String(input).trim();
    if (/^[0-9a-f]{3}([0-9a-f]{3})?([0-9a-f]{2})?$/i.test(text)) text = '#' + text;
    var match = /^#([0-9a-f]{3,8})$/i.exec(text);
    if (match) {
      var hex_digits = match[1];
      if (hex_digits.length === 3 || hex_digits.length === 4) hex_digits = hex_digits.split('').map(function (hex_char) { return hex_char + hex_char; }).join('');
      if (hex_digits.length !== 6 && hex_digits.length !== 8) return null;
      return [parseInt(hex_digits.slice(0, 2), 16), parseInt(hex_digits.slice(2, 4), 16), parseInt(hex_digits.slice(4, 6), 16)];
    }
    match = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(text);
    if (match) return [+match[1], +match[2], +match[3]].map(function (channel) { return core.clamp(Math.round(channel), 0, 255); });
    if (!core.color_canvas) return null;
    core.color_canvas.fillStyle = '#010203';
    core.color_canvas.fillStyle = text;
    var out = String(core.color_canvas.fillStyle);
    if (out === '#010203') return null;
    return out.charAt(0) === '#' ? core.parse_color(out) : core.parse_color(out.replace(/\s/g, ''));
  };
  // How bright a color looks, from 0 (black) to 1 (white)
  core.luminance = function (color) {
    var linear = color.map(function (channel) { channel /= 255; return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4); });
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  };
  // The contrast ratio between two colors, from 1 to 21
  core.contrast_ratio = function (color_one, color_two) { var light_one = core.luminance(color_one), light_two = core.luminance(color_two); return (Math.max(light_one, light_two) + 0.05) / (Math.min(light_one, light_two) + 0.05); };
  // A color between two colors
  core.mix_colors = function (color_one, color_two, amount) { return color_one.map(function (channel, index) { return Math.round(channel * (1 - amount) + color_two[index] * amount); }); };
  // A color as #rrggbb
  core.to_hex = function (color) { return '#' + color.map(function (channel) { return ('0' + core.clamp(Math.round(channel), 0, 255).toString(16)).slice(-2); }).join(''); };
  // A color as rgba() with some transparency
  core.to_rgba = function (color, alpha) { return 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + alpha + ')'; };
  // Darkens or lightens a color until it reads well on a background
  core.ensure_contrast = function (color, toward, background, ratio) {
    var amount = 0, result_color = color;
    while (core.contrast_ratio(result_color, background) < ratio && amount < 1) { amount += 0.03; result_color = core.mix_colors(color, toward, amount); }
    return result_color;
  };
});
