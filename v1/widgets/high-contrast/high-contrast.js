/* high-contrast/high-contrast.js: High contrast: stronger contrast for the whole page */
accessibles_core.define('high-contrast/high-contrast.js', [], function (core) {
  'use strict';
  core.register('page_filter', { folder: 'high-contrast', order: 20, filter: function () { return core.state.contrast === 'high' ? 'contrast(1.35)' : ''; } });
});
