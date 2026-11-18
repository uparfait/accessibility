/* fonts/fonts.js: Font: swaps the page font for an easy-to-read or dyslexia-friendly one */
accessibles_core.define('fonts/fonts.js', ['fonts-2.js'], function (core) {
  'use strict';
  // The details of a font choice by its id
  core.font_info = function (id) { for (var count = 0; count < core.font_list.length; count++) if (core.font_list[count].id === id) return core.font_list[count]; return id ? { id: id, name: id, family: id, stack: '"' + id + '", sans-serif' } : core.font_list[0]; };
  // The name of a font choice, shown on the Font tile
  core.font_name = function (id) { var item = core.font_info(id); return id ? item.name : 'Original'; };
  // The Google Fonts address for a font
  core.google_font_url = function (family, extra) { return 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(family).replace(/%20/g, '+') + (extra || '') + '&display=swap'; };
  // Loads a font before it is used
  core.load_font = function (id) {
    if (!id) return Promise.resolve();
    if (core.font_ready[id]) return core.font_ready[id];
    var item = core.font_info(id);
    if (id === 'readable' && core.config.readable_font_url) core.add_css_link(core.config.readable_font_url);
    else if (id === 'dyslexic' && core.config.dyslexic_font_url) core.add_css_link(core.config.dyslexic_font_url);
    // Not every family ships a bold cut; fall back to the regular weight if the request is refused
    else if (item.google_family) core.add_css_link(core.google_font_url(item.google_family, ':wght@400;700'), function () { core.add_css_link(core.google_font_url(item.google_family)); });
    core.font_ready[id] = new Promise(function (resolve) {
      if (!item.family || !document.fonts || !document.fonts.load) { resolve(); return; }
      var timer = core.run_later(resolve, 4000);
      core.run_later(function () { document.fonts.load('16px "' + item.family + '"').then(function () { core.cancel_later(timer); resolve(); }, function () { core.cancel_later(timer); resolve(); }); }, 60);
    });
    return core.font_ready[id];
  };
  // Loads the fonts shown in the font list
  core.load_font_previews = function () {
    if (core.previews_loaded) return;
    core.previews_loaded = true;
    var families = core.font_list.filter(function (font) { return font.google_family; });
    var chars = {};
    core.font_list.forEach(function (font) { (font.name + (font.google_family || '')).split('').forEach(function (char) { chars[char] = 1; }); });
    var text = encodeURIComponent(Object.keys(chars).join(''));
    for (var count = 0; count < families.length; count += 10) {
      var list = families.slice(count, count + 10).map(function (font) { return 'family=' + encodeURIComponent(font.google_family).replace(/%20/g, '+'); }).join('&');
      core.add_css_link('https://fonts.googleapis.com/css2?' + list + '&text=' + text + '&display=swap');
    }
  };
  // Fonts the visitor can apply to the website. google_family: loaded from Google Fonts; the others are installed on most systems.
  core.font_list = (function () {
    var out = [
      { id: '', name: 'Original font', note: 'As designed' },
      { id: 'readable', name: 'Easy to read', note: 'Atkinson Hyperlegible', family: 'Atkinson Hyperlegible', google_family: 'Atkinson Hyperlegible', stack: '"Atkinson Hyperlegible", Verdana, Tahoma, "Segoe UI", Arial, sans-serif' },
      { id: 'dyslexic', name: 'Dyslexia friendly', note: 'OpenDyslexic or Lexend', family: 'Lexend', google_family: 'Lexend', stack: '"OpenDyslexic", "Lexend", Verdana, Tahoma, "Trebuchet MS", sans-serif' }
    ];
    var google_api = { sans: 'Inter,Roboto,Open Sans,Lato,Montserrat,Poppins,Nunito,Figtree,Source Sans 3,Noto Sans,PT Sans,Work Sans,IBM Plex Sans,DM Sans,Manrope,Raleway,Rubik,Karla,Mulish,Quicksand,Ubuntu,Fira Sans,Cabin,Arimo,Space Grotesk,Josefin Sans,Sora,Outfit,Plus Jakarta Sans,Public Sans,Red Hat Display,Barlow,Hind,Titillium Web,Archivo,Libre Franklin,Varela Round,Overpass,Asap,Heebo,Assistant,Kanit,Mukta,Lexend Deca,Andika,Comic Neue,Atkinson Hyperlegible,Lexend',
      serif: 'Merriweather,Lora,Playfair Display,PT Serif,Libre Baskerville,Source Serif 4,Noto Serif,IBM Plex Serif,Crimson Pro,EB Garamond,Cormorant Garamond,Roboto Slab,Bitter,Zilla Slab,Tinos,DM Serif Display',
      monospace: 'JetBrains Mono,Roboto Mono,IBM Plex Mono,Inconsolata,Space Mono' };
    var seen = {};
    Object.keys(google_api).forEach(function (category) {
      google_api[category].split(',').forEach(function (node) { if (seen[node]) return; seen[node] = 1; out.push({ id: node, name: node, note: category === 'sans' ? 'Sans serif' : category === 'serif' ? 'Serif' : 'Monospace', family: node, google_family: node, stack: '"' + node + '", ' + (category === 'sans' ? 'sans-serif' : category) }); });
    });
    [['Arial', 'sans-serif'], ['Verdana', 'sans-serif'], ['Tahoma', 'sans-serif'], ['Trebuchet MS', 'sans-serif'], ['Segoe UI', 'sans-serif'], ['Helvetica', 'sans-serif'], ['Georgia', 'serif'], ['Times New Roman', 'serif'], ['Palatino Linotype', 'serif'], ['Courier New', 'monospace'], ['Comic Sans MS', 'cursive']].forEach(function (item) {
      out.push({ id: item[0], name: item[0], note: 'System font', family: item[0], stack: '"' + item[0] + '", ' + item[1] });
    });
    return out;
  })();
});
