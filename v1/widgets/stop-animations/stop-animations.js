/* stop-animations/stop-animations.js: Stop animations: pauses motion, videos and GIFs */
accessibles_core.define('stop-animations/stop-animations.js', ['stop-animations-2.js'], function (core) {
  'use strict';
  core.register('page_css', { folder: 'stop-animations', order: 200, rules: function (body) {
    var list = [];
    if (core.state.stopAnimations) {
      list.push('html,' + body + ',' + body + ' *,' + body + ' *::before,' + body + ' *::after{animation-duration:.001ms!important;animation-delay:0s!important;animation-iteration-count:1!important;transition-duration:.001ms!important;transition-delay:0s!important;scroll-behavior:auto!important}');
    }
    return list;
  } });
});
