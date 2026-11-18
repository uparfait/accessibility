/* translate/translate-2.js: Translate, continued */
accessibles_core.define('translate/translate-2.js', [], function (core) {
  'use strict';
    // Progress is estimated from how many text blocks Google has already rewritten
  core.page_translation.measure = function () {
    var total = 0, done = 0;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null), text_node, seen = 0;
    while ((text_node = walker.nextNode()) && seen < 4000) {
      var part = text_node.parentElement;
      if (!part || core.is_ours(part) || core.skip_tags[part.tagName] || !core.has_letters(text_node.nodeValue)) continue;
      seen++; total++;
      if (part.closest('font')) done++;
    }
    return total ? done / total : 1;
  };
  // Waits until the page translation has finished
  core.page_translation.wait_done = function (target, sequence) {
    var self = this;
    return new Promise(function (resolve) {
      var tries = 0, last = -1, still = 0;
      var value = core.native_set_interval.call(window, function () {
        if (sequence !== self.sequence) { clearInterval(value); resolve(true); return; }
        var flagged = self.is_translated();
        var part = self.measure();
        self.progress = Math.max(self.progress, Math.min(0.99, flagged ? part : part * 0.5));
        core.ui.translate_wait();
        if (Math.abs(part - last) < 0.005) still++; else still = 0;
        last = part;
        tries++;
        if (flagged && (part > 0.9 || still > 6)) { clearInterval(value); resolve(true); }
        else if (!flagged && tries > 20) { clearInterval(value); resolve(false); }      // nothing happened in 4 s
        else if (tries > 120) { clearInterval(value); resolve(flagged); }
      }, 200);
    });
  };
});
