/* highlight-links/highlight-links.js: Highlight links: underlines and outlines every link */
accessibles_core.define('highlight-links/highlight-links.js', [], function (core) {
  'use strict';
  core.register('page_css', { folder: 'highlight-links', order: 130, rules: function (body, accent) {
    var list = [];
    if (core.state.highlightLinks) list.push(body + ' :is(a[href],[role="link"]){text-decoration:underline!important;text-decoration-thickness:2px!important;text-underline-offset:3px!important;outline:2px dashed ' + accent + '!important;outline-offset:2px!important}');
    return list;
  } });
});
