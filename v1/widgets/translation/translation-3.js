/* translation/translation-3.js: Translates the panel into the visitor's language, continued */
accessibles_core.define('translation/translation-3.js', [], function (core) {
  'use strict';
  // Translates every queued text in one request
  core.panel_translation.flush = function () {
    if (this.busy) return;
    var lang = this.lang, list = Object.keys(this.pending);
    if (!lang || !list.length) return;
    this.pending = {};
    this.busy = true;
    var self = this;
    // Small batches so one failed request only affects a few strings; failures are retried once
    var groups = [];
    for (var count = 0; count < list.length; count += 25) groups.push(list.slice(count, count + 25));
    var done = 0;
    var item = self.cache[lang] || (self.cache[lang] = {});
    var run_group = function (group, retry) {
      return core.google_translate_text(group, lang).then(function (out) { group.forEach(function (text, index) { if (out[index]) item[text] = out[index]; }); })
        .catch(function () { if (!retry) return run_group(group, true); self.failed = Date.now(); });
    };
    groups.reduce(function (previous, group) {
      return previous.then(function () { return run_group(group).then(function () { done++; core.panel_translation.panel_progress = done / groups.length; core.ui.translate_wait(); if (self.lang === lang && core.root) self.apply(core.root); }); });
    }, Promise.resolve()).then(function () { self.persist(); }).then(function () {
      self.busy = false;
      core.panel_translation.panel_progress = 1;
      if (self.lang === lang && core.root) self.apply(core.root);
      core.ui.translate_wait();
      if (Object.keys(self.pending).length) self.flush();
    });
  };
  // True when an element must not be translated
  core.panel_translation.skip = function (element) { return !element || (element.closest && element.closest('[translate="no"],.vkb-keys,.rbody,.lens,.tip,.num,.help-text')); };
});
