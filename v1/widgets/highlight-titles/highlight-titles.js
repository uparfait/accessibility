/* highlight-titles/highlight-titles.js: Highlight titles: outlines every heading */
accessibles_core.define('highlight-titles/highlight-titles.js', [], function (core) {
  'use strict';
  core.register('page_css', { folder: 'highlight-titles', order: 120, rules: function (body, accent) {
    var list = [];
    if (core.state.highlightTitles) list.push(body + ' :is(' + core.headings + '){outline:2px solid ' + accent + '!important;outline-offset:4px!important;border-radius:2px}');
    return list;
  } });
});
