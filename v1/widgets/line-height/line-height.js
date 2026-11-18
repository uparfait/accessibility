/* line-height/line-height.js: Line height: more space between lines */
accessibles_core.define('line-height/line-height.js', [], function (core) {
  'use strict';
  core.register('page_css', { folder: 'line-height', order: 70, rules: function (body) {
    var list = [];
    if (core.state.lineHeight) list.push(body + ',' + body + ' *:not(svg *){line-height:' + core.state.lineHeight + '!important}');
    return list;
  } });
});
