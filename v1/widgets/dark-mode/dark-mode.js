/* dark-mode/dark-mode.js: Dark mode: every background dark and every text light, each keeping its own color */
accessibles_core.define('dark-mode/dark-mode.js', ['dark-mode-2.js', 'dark-mode-3.js', 'dark-mode-4.js', 'dark-mode-5.js'], function (core) {
  'use strict';
  core.dark_mode = {
    on: false, recorder: new core.change_recorder(), turn: 0, done: [], sheet: null, watch: null, rebuild_timer: 0, state_count: 0,
    // Turns dark mode on or off to match the settings
    sync: function () {
      var self = this;
      if (core.state.darkMode && !this.on) {
        this.on = true;
        this.build_sheet();
        this.watch_states(true);
        // Stylesheets the page adds later get dark colors too
        this.watch = new MutationObserver(function (list) {
          if (!list.some(function (change) { return Array.prototype.some.call(change.addedNodes, function (node) { return node !== self.sheet && /^(STYLE|LINK)$/.test(node.nodeName); }); })) return;
          core.cancel_later(self.rebuild_timer);
          self.rebuild_timer = core.run_later(function () { if (self.on) { self.build_sheet(); self.fix(document.body); } }, 300);
        });
        this.watch.observe(document.documentElement, { childList: true, subtree: true });
        core.run_later(function () { self.fix(document.body); }, 0);
      } else if (!core.state.darkMode && this.on) {
        this.on = false; this.turn++;
        if (this.watch) this.watch.disconnect();
        this.watch_states(false);
        if (this.sheet) this.sheet.remove();
        this.sheet = null;
        this.recorder.revert();
        this.done.forEach(function (element) { element.__acc_dark = false; });
        this.done = [];
      }
    },
    // Parts of the page whose colors come from places the dark stylesheet cannot reach are made dark one by one
    fix: function (root) {
      if (!this.on || !root || root.nodeType !== 1) return;
      var skip = /^(IMG|PICTURE|VIDEO|CANVAS|IFRAME|EMBED|OBJECT|SCRIPT|STYLE|NOSCRIPT|TEMPLATE|SOURCE|TRACK|HEAD|META|LINK|TITLE|BASE|ACCESSIBLES-LENS)$/i;
      var list = [root].concat(Array.prototype.slice.call(root.getElementsByTagName('*'))).filter(function (element) {
        return !element.__acc_dark && !skip.test(element.tagName) && !core.is_ours(element) && !(element.closest && element.closest('accessibles-lens'));
      });
      this.check_elements(list, this.turn);
    }
  };
  core.register('module', { folder: 'dark-mode', order: 32, module: core.dark_mode });
});
