/* focus-highlight/focus-highlight.js: Focus highlight: a strong outline on the focused element */
accessibles_core.define('focus-highlight/focus-highlight.js', [], function (core) {
  'use strict';
  core.register('page_css', { folder: 'focus-highlight', order: 180, rules: function (body, accent) {
    var list = [];
    if (core.state.focusRing || core.state.keyboardNav) {
      list.push(body + ' *:focus{outline:3px solid ' + accent + '!important;outline-offset:2px!important;box-shadow:0 0 0 6px rgba(255,255,255,.9)!important}');
    }
    return list;
  } });
});
