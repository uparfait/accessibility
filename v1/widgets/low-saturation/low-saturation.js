/* low-saturation/low-saturation.js: Low saturation: softer, muted colors */
accessibles_core.define('low-saturation/low-saturation.js', [], function (core) {
  'use strict';
  core.register('page_filter', { folder: 'low-saturation', order: 31, filter: function () { return core.state.saturation === 'low' ? 'saturate(0.45)' : ''; } });
});
