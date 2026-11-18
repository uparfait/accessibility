/* brightness/brightness.js: Brightness: makes the page lighter or darker */
accessibles_core.define('brightness/brightness.js', [], function (core) {
  'use strict';
  core.register('page_filter', { folder: 'brightness', order: 40, filter: function () { return core.state.brightness !== 100 ? 'brightness(' + (core.state.brightness / 100) + ')' : ''; } });
});
