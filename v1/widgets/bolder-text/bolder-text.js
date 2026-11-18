/* bolder-text/bolder-text.js: Bolder text: makes the page text heavier */
accessibles_core.define('bolder-text/bolder-text.js', [], function (core) {
  'use strict';
  core.register('page_css', { folder: 'bolder-text', order: 60, rules: function (body) {
    var list = [];
    if (core.state.fontWeight) {
      list.push(body + ' *' + core.not_icon + '{font-weight:' + core.state.fontWeight + '!important}');
      list.push(body + ' :is(' + core.headings + ',b,strong,th){font-weight:800!important}');
    }
    return list;
  } });
});
