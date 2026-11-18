/* monochrome/monochrome.js: Monochrome: shows the page in grays */
accessibles_core.define('monochrome/monochrome.js', [], function (core) {
  'use strict';
  core.register('page_filter', { folder: 'monochrome', order: 30, filter: function () { return core.state.saturation === 'mono' ? 'grayscale(1)' : ''; } });
});
