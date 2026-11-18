/* talk-and-type/talk-and-type-2.js: Talk & type, continued */
accessibles_core.define('talk-and-type/talk-and-type-2.js', [], function (core) {
  'use strict';
    // Finds a word in the box. Every copy is offered in turn: yes, next, previous, all or stop.
  core.voice.delete_ask = function (word) {
    var element = core.last_editable;
    word = String(word || '').replace(/[.,!?;:]+$/, '').trim();
    if (!element || !element.isConnected) { core.ui.pill(word, false, core.translate_ui('Click into a text box first')); return; }
    if (!word) return;
    var value = core.current_value(element), lower_value = value.toLowerCase(), width = word.toLowerCase(), position = [], index = -1;
    var edge = function (char) { return !char || !core.word_char_pattern.test(char); };
    while ((index = lower_value.indexOf(width, index + 1)) > -1) { if (edge(lower_value.charAt(index - 1)) && edge(lower_value.charAt(index + width.length))) position.push(index); }
    if (!position.length) { core.ui.pill(word, false, core.translate_ui('Not found in this box')); return; }
    var cut = function (current, position) {
      var text = position, count = position + width.length;
      if (current.charAt(count) === ' ') count++; else if (text > 0 && current.charAt(text - 1) === ' ') text--;
      return current.slice(0, text) + current.slice(count);
    };
    var put = function (new_value) { if (element.isContentEditable) element.textContent = new_value; else core.set_value(element, new_value); };
    var items = position.map(function (position) {
      return { label: '"' + value.substr(position, width.length) + '"', pos: position, show: function () {
        if (element.isContentEditable) return;
        try { element.focus({ preventScroll: true }); element.setSelectionRange(position, position + width.length); } catch (error) { /* ignore */ }
      } };
    });
    this.choose(items, core.translate_ui('Delete'), function (item) { put(cut(core.current_value(element), item.pos)); },
      function (all) { var current = core.current_value(element); all.slice().reverse().forEach(function (item) { current = cut(current, item.pos); }); put(current); });
  };
    // A text box to type into when none was chosen: the first one on the page, else the menu's search box
  core.voice.pick_field = function () {
    var elements = Array.prototype.filter.call(document.querySelectorAll(core.field_selector), function (field) { return !core.is_ours(field) && core.is_visible(field) && core.is_editable(field); })[0];
    if (elements) { try { elements.scrollIntoView({ block: 'center' }); } catch (error) { /* ignore */ } return elements; }
    if (core.ui.open && !core.find_one('.search').hidden) return core.find_one('.search input');
    return null;
  };
  // Types spoken text into the field
  core.voice.write = function (text) {
    var element = core.last_editable;
    if (!element || !element.isConnected) { element = core.last_editable = this.pick_field(); }
    if (!element) { core.ui.pill(text, false, core.translate_ui('This page has no text box. Open the menu to type in its search box.')); return; }
    text = this.punctuate(text);
    var is_input = element.tagName === 'INPUT';
    if (is_input) text = text.replace(/\n+/g, ' ');
    if (is_input && element.type === 'email') text = text.replace(/\s+at\s+/gi, '@').replace(/\s+dot\s+/gi, '.').replace(/\s+/g, '').toLowerCase();
    var before = core.current_value(element), caret = before.length;
    try { if (!element.isContentEditable && element.selectionStart != null) caret = element.selectionStart; } catch (error) { /* ignore */ }
    var left = before.slice(0, caret);
    // Capital letter at the start of a sentence
    if (!(is_input && element.type === 'email') && (!left.trim() || /[.!?]\s*$|\n\s*$/.test(left))) text = text.charAt(0).toUpperCase() + text.slice(1);
    var space = left && !/[\s\n(“"]$/.test(left) && !/^[.,?!:;)\n”]/.test(text) ? ' ' : '';
    if (is_input && element.type === 'email') space = '';
    core.insert_text(element, space + text);
    this.last_insert = { element: element, before: before, after: core.current_value(element) };
  };
});
