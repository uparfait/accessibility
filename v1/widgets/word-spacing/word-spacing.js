/* word-spacing/word-spacing.js: Word spacing: more space between words */
accessibles_core.define('word-spacing/word-spacing.js', [], function (core) {
  'use strict';
  core.register('page_css', { folder: 'word-spacing', order: 90, rules: function (body) {
    var list = [];
    if (core.state.wordSpacing) list.push(body + ',' + body + ' *:not(svg *){word-spacing:' + core.state.wordSpacing + 'em!important}');
    return list;
  } });
});
