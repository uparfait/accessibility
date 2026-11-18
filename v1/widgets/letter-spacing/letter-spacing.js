/* letter-spacing/letter-spacing.js: Letter spacing: more space between letters */
accessibles_core.define('letter-spacing/letter-spacing.js', [], function (core) {
  'use strict';
  core.register('page_css', { folder: 'letter-spacing', order: 80, rules: function (body) {
    var list = [];
    if (core.state.letterSpacing) list.push(body + ',' + body + ' *:not(svg *){letter-spacing:' + core.state.letterSpacing + 'em!important}');
    return list;
  } });
});
