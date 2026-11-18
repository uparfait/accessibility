/* text-align/text-align.js: Text align: aligns the page text left, center, right or justified */
accessibles_core.define('text-align/text-align.js', [], function (core) {
  'use strict';
  core.register('page_css', { folder: 'text-align', order: 110, rules: function (body) {
    var list = [];
    if (core.state.textAlign) list.push(body + ',' + body + ' *:not(svg *){text-align:' + core.state.textAlign + '!important}');
    return list;
  } });
});
