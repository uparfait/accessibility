/* translation/translation-4.js: Translates the panel into the visitor's language, continued */
accessibles_core.define('translation/translation-4.js', [], function (core) {
  'use strict';
  // Translates every text inside an element
  core.panel_translation.apply = function (root) {
    if (!root) return;
    var self = this, is_on = !!this.lang;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), node;
    while ((node = walker.nextNode())) {
      if (self.skip(node.parentElement)) continue;
      var record = self.nodes.get(node);
      if (!record || node.nodeValue !== record.type) { if (!is_on) { if (record) self.nodes.delete(node); continue; } record = { original: node.nodeValue }; }
      var raw = record.original, trimmed = raw.trim();
      if (!trimmed || !core.has_letters(trimmed)) continue;
      var value = is_on ? raw.replace(trimmed, self.translated(trimmed)) : raw;
      if (node.nodeValue !== value) node.nodeValue = value;
      record.type = value;
      self.nodes.set(node, record);
    }
    Array.prototype.forEach.call(root.querySelectorAll('[aria-label],[placeholder],[title]'), function (element) {
      if (self.skip(element)) return;
      var map = self.attrs.get(element) || {};
      ['aria-label', 'placeholder', 'title'].forEach(function (first) {
        var attribute = element.getAttribute(first);
        if (attribute == null) return;
        var recorder = map[first];
        if (!recorder || attribute !== recorder.type) recorder = map[first] = { original: attribute };
        var value = is_on ? self.translated(recorder.original) : recorder.original;
        if (attribute !== value) element.setAttribute(first, value);
        recorder.type = value;
      });
      self.attrs.set(element, map);
    });
  };
});
