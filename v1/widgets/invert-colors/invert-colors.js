/* invert-colors/invert-colors.js: Invert colors: reverses the page colors */
accessibles_core.define('invert-colors/invert-colors.js', [], function (core) {
  'use strict';
  core.register('page_filter', { folder: 'invert-colors', order: 10, filter: function () { return core.state.invert ? 'invert(1) hue-rotate(180deg)' : ''; } });
  core.register('page_css', { folder: 'invert-colors', order: 30, rules: function (body) {
    var list = [];
    if (core.state.invert) list.push(body + ' :is(img,video,picture,canvas,iframe,embed,object){filter:invert(1) hue-rotate(180deg)!important}');
    return list;
  } });
});
