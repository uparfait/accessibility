/* bigger-text/bigger-text.js: Bigger text: makes the page text larger */
accessibles_core.define('bigger-text/bigger-text.js', ['bigger-text-2.js'], function (core) {
  'use strict';
  core.bigger_text = {
    factor: 1,
    line_height_mode: false,
    map: new WeakMap(),
    list: []
  };
  // Brings this part of the page in line with the settings
  core.bigger_text.sync = function () {
    var item = core.state.fontSize, line_height = !!core.state.lineHeight;
    if (item === this.factor && line_height === this.line_height_mode) return;
    this.restore();
    this.factor = item; this.line_height_mode = line_height;
    if (item !== 1 && document.body) return this.apply_async(document.body);
  };
  // Resizes text in small batches, so the page stays responsive
  core.bigger_text.apply_async = function (root) {
    var self = this, all = core.collect_text_elements(root), total = all.length, count = 0, size = 600, run = ++this.run;
    if (total <= size * 2) { this.apply_list(all); return null; }
    return new Promise(function (resolve) {
      (function next() {
        if (run !== self.run) { resolve(); return; }
        self.apply_list(all.slice(count, count + size));
        count += size;
        core.ui.progress(Math.min(1, count / total));
        if (count < total) core.run_later(next, 0); else resolve();
      })();
    });
  };
  core.bigger_text.run = 0;
  // Resizes the text under an element
  core.bigger_text.apply = function (root) { if (this.factor !== 1) this.apply_list(core.collect_text_elements(root)); };
    // New content gets the same text size
  core.bigger_text.fix = function (root) { if (this.factor !== 1) this.apply(root); };
});
