/* colors/colors-2.js: Color math and the palette made from your brand color, continued */
accessibles_core.define('colors/colors-2.js', [], function (core) {
  'use strict';
  // Two inputs drive every color: the primary (accents, button) and the panel background.
  core.build_palette = function (input, bg_input, ink_input) {
    var primary = core.parse_color(input) || [47, 107, 90];
    var background = core.parse_color(bg_input) || [0, 0, 0];
    var white = [255, 255, 255], near_black = [14, 16, 19];
    var dark = core.luminance(background) < 0.3;
    function ink_on(color) { return core.contrast_ratio(color, white) >= core.contrast_ratio(color, near_black) ? white : near_black; }
    // The button icon: the site's own choice, else white or near-black for the best contrast
    var ink = core.parse_color(ink_input) || ink_on(primary);
    var text_color = core.ensure_contrast(dark ? [242, 244, 245] : [21, 24, 28], dark ? white : near_black, background, 12);
    var accent = core.ensure_contrast(primary, dark ? white : near_black, background, 4.6);
    var muted = core.ensure_contrast(core.mix_colors(text_color, background, 0.38), text_color, background, 4.6);
    var shadow_c = dark ? 'rgba(0,0,0,.55)' : core.to_rgba(core.mix_colors(primary, near_black, 0.7), 0.18);
    return {
      primary: primary, ink: ink, accent_on_light: core.ensure_contrast(primary, near_black, white, 4.6), dark: dark,
      vars: {
        '--p': core.to_hex(primary), '--p-ink': core.to_hex(ink),
        // The site icon in the panel header: the icon color when it shows on the panel, else the panel text color
        '--mark': core.to_hex(core.contrast_ratio(ink, background) >= 3 ? ink : text_color),
        '--p-edge': core.contrast_ratio(primary, white) < 1.5 || core.contrast_ratio(primary, near_black) < 1.5 ? core.to_hex(core.mix_colors(primary, core.contrast_ratio(primary, white) < 1.5 ? near_black : white, 0.4)) : 'transparent',
        '--p-shadow': core.to_rgba(core.mix_colors(primary, near_black, 0.5), 0.3),
        '--bg': core.to_hex(background), '--text': core.to_hex(text_color), '--muted': core.to_hex(muted),
        '--surface': core.to_hex(core.mix_colors(background, text_color, dark ? 0.06 : 0.025)), '--hover': core.to_hex(core.mix_colors(background, text_color, dark ? 0.11 : 0.06)),
        '--field': core.to_hex(core.mix_colors(background, text_color, dark ? 0.13 : 0.06)),
        '--line': core.to_hex(core.mix_colors(background, text_color, dark ? 0.15 : 0.12)), '--line-2': core.to_hex(core.mix_colors(background, text_color, dark ? 0.34 : 0.3)),
        '--accent': core.to_hex(accent), '--accent-ink': core.to_hex(ink_on(accent)),
        '--soft': core.to_hex(core.mix_colors(background, accent, dark ? 0.16 : 0.1)), '--soft-2': core.to_hex(core.mix_colors(background, accent, dark ? 0.28 : 0.2)),
        '--bad': dark ? '#ffb4ab' : '#b42318', '--bad-bg': dark ? '#3d1714' : '#fde8e8',
        '--shadow': '0 18px 48px ' + shadow_c + ', 0 2px 6px rgba(0,0,0,' + (dark ? '.4' : '.06') + ')'
      }
    };
  };
  // The background color really shown behind an element
  core.effective_background = function (element) {
    var node = element;
    while (node && node.nodeType === 1) {
      var style = getComputedStyle(node);
      if (style.backgroundImage && style.backgroundImage !== 'none') return null;
      var match = /rgba?\(([^)]+)\)/.exec(style.backgroundColor);
      if (match) {
        var parts = match[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat);
        if (parts.length < 4 || parts[3] > 0.9) return [parts[0], parts[1], parts[2]];
      }
      node = node.parentElement;
    }
    return [255, 255, 255];
  };
  core.color_canvas = null;
  try { core.color_canvas = document.createElement('canvas').getContext('2d'); } catch (error) { core.color_canvas = null; }
});
