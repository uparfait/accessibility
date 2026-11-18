/* panel-styles/panel-styles.js: The stylesheet of the widget itself */
accessibles_core.define('panel-styles/panel-styles.js', ['panel-styles-2.js', 'panel-styles-3.js', 'panel-styles-4.js', 'panel-styles-5.js', 'panel-styles-6.js', 'panel-styles-7.js', 'panel-styles-8.js', 'panel-styles-9.js', 'panel-styles-10.js', 'panel-styles-11.js', 'panel-styles-12.js'], function (core) {
  'use strict';
  // The widget's stylesheet for a palette
  core.widget_css = function (palette) {
    return core.widget_css_rules.map(function (rule) { return typeof rule === 'function' ? rule(palette) : rule; }).join('\n');
  };
  // CSS custom properties from a palette's variables
  core.css_variables = function (values) { return Object.keys(values).map(function (key) { return key + ':' + values[key]; }).join(';'); };
});
