/* content-scaling/content-scaling.js: Content scaling: zooms the whole page */
accessibles_core.define('content-scaling/content-scaling.js', [], function (core) {
  'use strict';
  core.register('page_css', { folder: 'content-scaling', order: 40, rules: function (body) {
    var list = [];
    if (core.state.contentScale !== 1) {
      if ('zoom' in document.documentElement.style) list.push(body + '{zoom:' + core.state.contentScale + '!important}');
      else list.push(body + '{transform:scale(' + core.state.contentScale + ')!important;transform-origin:0 0!important;width:' + (100 / core.state.contentScale) + '%!important}');
    }
    return list;
  } });
});
