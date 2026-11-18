/* sign-language/sign-language-5.js: Sign language, continued */
accessibles_core.define('sign-language/sign-language-5.js', [], function (core) {
  'use strict';
  core.register('action', { folder: 'sign-language', names: ['sign-asl', 'sign-libras'], run: function (target) {
    var kind = target.getAttribute('data-act').slice(5);
    core.ui.set_busy(target.parentNode);
    core.set_state('sign', core.state.sign === kind ? '' : kind);
  } });
});
