/* dictionary/dictionary.js: Dictionary: double-click a word to see its meaning */
accessibles_core.define('dictionary/dictionary.js', ['dictionary-2.js', 'dictionary-3.js'], function (core) {
  'use strict';
  core.dictionary = {
    on: false
  };
  core.dictionary.cache = {};
  // Brings this part of the page in line with the settings
  core.dictionary.sync = function () {
    if (core.state.dictionary && !this.on) { this.on = true; document.addEventListener('pointerup', this.on_up, true); document.addEventListener('keyup', this.on_key_up, true); window.addEventListener('resize', this.on_resize); }
    else if (!core.state.dictionary && this.on) { this.on = false; document.removeEventListener('pointerup', this.on_up, true); document.removeEventListener('keyup', this.on_key_up, true); window.removeEventListener('resize', this.on_resize); core.ui.dict(null); }
  };
  // Shows the meaning of a word next to it
  core.dictionary.word = function () {
    var selector = core.get_selection();
    if (!selector || !selector.rangeCount || selector.isCollapsed) return null;
    // Grow a partial selection ("The Gr") to whole words ("The Green") before looking it up
    try {
      var range = selector.getRangeAt(0), script = range.startContainer, end_node = range.endContainer;
      if (script.nodeType === 3 && end_node.nodeType === 3) {
        var start_offset = range.startOffset, end_offset = range.endOffset;
        while (start_offset > 0 && core.has_letters(script.nodeValue.charAt(start_offset - 1) + 'a')) { if (!/[\s.,;:!?()"“”«»]/.test(script.nodeValue.charAt(start_offset - 1))) start_offset--; else break; }
        while (end_offset < end_node.nodeValue.length && !/[\s.,;:!?()"“”«»]/.test(end_node.nodeValue.charAt(end_offset))) end_offset++;
        if (start_offset !== range.startOffset || end_offset !== range.endOffset) { range.setStart(script, start_offset); range.setEnd(end_node, end_offset); selector.removeAllRanges(); selector.addRange(range); }
      }
    } catch (error) { /* keep the selection as it is */ }
    var text = String(selector).trim();
    if (!text || text.length > 40 || /\s{2,}/.test(text) || text.split(/\s+/).length > 3) return null;
    core.edge_punctuation_pattern.lastIndex = 0; text = text.replace(core.edge_punctuation_pattern, '');
    if (!text) return null;
    var rect = selector.rangeCount ? selector.getRangeAt(0).getBoundingClientRect() : null;
    return { word: text, rect: rect };
  };
  // Handles a double click
  core.dictionary.on_double_click = function (event) { if (core.is_ours(event.target)) return; var width = core.dictionary.word(); if (width) core.dictionary.lookup(width.word, width.rect); };
  core.dictionary.last = '';
  core.dictionary.last_at = 0;
  // Looks up the selected word
  core.dictionary.from_selection = function () {
    var width = core.dictionary.word();
    if (!width) return;
    if (width.word === core.dictionary.last && Date.now() - core.dictionary.last_at < 1500) return;
    core.dictionary.last = width.word; core.dictionary.last_at = Date.now();
    core.dictionary.lookup(width.word, width.rect);
  };
  // Handles the mouse button being released
  core.dictionary.on_up = function (event) {
    var target = core.real_target(event);
    if (!core.is_page_like(target) || core.is_editable(target)) return;
    core.run_later(core.dictionary.from_selection, event.pointerType === 'touch' ? 400 : 20);
  };
  // Handles a key being released
  core.dictionary.on_key_up = function (event) {
    var target = core.real_target(event);
    if (!core.is_page_like(target) || core.is_editable(target) || event.key !== 'Shift') return;
    core.run_later(core.dictionary.from_selection, 20);
  };
});
