/* high-saturation/high-saturation.js: High saturation: stronger, vivid colors */
accessibles_core.define('high-saturation/high-saturation.js', [], function (core) {
  'use strict';
  core.register('page_filter', { folder: 'high-saturation', order: 32, filter: function () { return core.state.saturation === 'high' ? 'saturate(1.8)' : ''; } });
});
