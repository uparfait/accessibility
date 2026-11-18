/* config/config.js: Reads the options from the script URL, the page and window.AccessiblesConfig */
accessibles_core.define('config/config.js', ['config-2.js'], function (core) {
  'use strict';
  // Decodes a value from the script address (+ means a space)
  core.decode_value = function (text) { try { return decodeURIComponent(String(text).replace(/\+/g, ' ')); } catch (error) { return String(text); } };
  // Lower-case letters and digits only, so option names can be written in any style
  core.normalize_key = function (key) { return String(key).toLowerCase().replace(/[^a-z0-9]/g, ''); };

  // Parsed by hand (not with URL) so an unencoded "#" in color=#2F6B5A still works.
  core.parse_query = function (src) {
    var out = {};
    var query_index = src.indexOf('?');
    if (query_index < 0) return out;
    src.slice(query_index + 1).split(/[&;]/).forEach(function (pair) {
      if (!pair) return;
      var equals_index = pair.indexOf('=');
      var list = core.normalize_key(core.decode_value(equals_index < 0 ? pair : pair.slice(0, equals_index)));
      var list_2 = equals_index < 0 ? 'true' : core.decode_value(pair.slice(equals_index + 1)).trim();
      if (list) out[list] = list_2;
    });
    return out;
  };
  // True for "true", "yes", "1" and "on"
  core.is_truthy = function (value) { return value === true || /^(1|true|yes|on)$/i.test(String(value || '')); };
  // A number from text, or the default when it is not one
  core.to_number = function (value, default_value) { var value_2 = parseFloat(value); return isFinite(value_2) ? value_2 : default_value; };

  // Accepts common spellings and typos: "ritgh", "rigth", "botom", "centre", "middle"…
  core.normalize_position = function (value) {
    var text = String(value || '').toLowerCase().replace(/[\s_]+/g, '-')
      .replace(/rigth|ritgh|rihgt|rght|riht|rigt|rgiht/g, 'right')
      .replace(/botom|bottm|buttom|bottem|botton/g, 'bottom')
      .replace(/lfet|leftt|lef(?!t)/g, 'left')
      .replace(/tpo(?!s)/g, 'top')
      .replace(/middle|centre|centr(?!e)|cener|cntr/g, 'center');
    var has_top = text.indexOf('top') > -1, has_bottom = text.indexOf('bottom') > -1;
    var has_left = text.indexOf('left') > -1, has_right = text.indexOf('right') > -1;
    if (!has_top && !has_bottom && !has_left && !has_right) return { v: 'bottom', h: 'right', key: 'bottom-right' };
    var vertical = has_top ? 'top' : has_bottom ? 'bottom' : 'center';
    var horizontal = has_left ? 'left' : has_right ? 'right' : 'center';
    return { v: vertical, h: horizontal, key: vertical === 'center' ? horizontal + '-center' : horizontal === 'center' ? vertical + '-center' : vertical + '-' + horizontal };
  };
});
