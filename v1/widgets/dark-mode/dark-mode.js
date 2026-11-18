/* dark-mode/dark-mode.js: Dark mode: turns the page dark while keeping its own colors, each one turned around */
accessibles_core.define('dark-mode/dark-mode.js', ['dark-mode-2.js', 'dark-mode-3.js'], function (core) {
  'use strict';
  core.dark_mode = {
    on: false, recorder: new core.change_recorder(), turn: 0, done: [],
    // Turns dark mode on or off to match the settings
    sync: function () {
      if (core.state.darkMode && !this.on) { this.on = true; this.fix(document.documentElement); }
      else if (!core.state.darkMode && this.on) {
        this.on = false; this.turn++;
        this.recorder.revert();
        this.done.forEach(function (element) { element.__acc_dark = false; });
        this.done = [];
      }
    },
    // New content gets dark colors too
    fix: function (root) {
      if (!this.on || !root || root.nodeType !== 1) return;
      var skip = /^(IMG|PICTURE|VIDEO|CANVAS|IFRAME|EMBED|OBJECT|SCRIPT|STYLE|NOSCRIPT|TEMPLATE|SOURCE|TRACK|HEAD|META|LINK|TITLE|BASE|ACCESSIBLES-LENS)$/i;
      var list = [root].concat(Array.prototype.slice.call(root.getElementsByTagName('*'))).filter(function (element) {
        return !element.__acc_dark && !skip.test(element.tagName) && !core.is_ours(element) && !(element.closest && element.closest('accessibles-lens'));
      });
      this.read_then_write(list, this.turn);
    }
  };
  // The very back of the page is black
  core.register('page_css', { folder: 'dark-mode', order: 145, rules: function () {
    return core.state.darkMode ? ['html{background-color:#000000!important}'] : [];
  } });
  core.register('module', { folder: 'dark-mode', order: 32, module: core.dark_mode });
});
