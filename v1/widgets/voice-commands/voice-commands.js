/* voice-commands/voice-commands.js: Voice commands: control the page by speaking */
accessibles_core.define('voice-commands/voice-commands.js', ['voice-commands-2.js', 'voice-commands-3.js', 'voice-commands-4.js', 'voice-commands-5.js', 'voice-commands-6.js', 'voice-commands-7.js'], function (core) {
  'use strict';
  // Finds text on the page and highlights it
  core.search_page = function (words) {
    // With the menu open, search its features
    if (core.ui.open) {
      if (core.ui.view) core.ui.close_view();
      var element = core.find_one('.search input');
      element.value = words; core.ui.search(words);
      core.ui.pill(words, false, core.translate_ui('Searching the menu'));
      return;
    }
    // The page's own search box
    var box = Array.prototype.filter.call(document.querySelectorAll('input[type="search"],input[name="q"],input[name="s"],input[name*="search" i],input[placeholder*="search" i]'), function (second) { return !core.is_ours(second) && core.is_visible(second); })[0];
    if (box) {
      core.focus_element(box); core.set_value(box, words);
      if (box.form) { if (box.form.requestSubmit) box.form.requestSubmit(); else box.form.submit(); }
      return;
    }
    // Otherwise find the words on the page
    var item = core.find_on_page(words);
    core.ui.pill(words, false, item ? core.translate_ui('Found on the page') + ' (' + item.index + '/' + item.total + ')' : core.translate_ui('Not found on this page'));
  };
  // The next place a text appears on the page
  core.find_on_page = function (words) {
    var needle = String(words || '').trim().toLowerCase();
    if (!needle || !document.body) return false;
    var hits = [], text_node;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (text_node) {
        var part = text_node.parentElement;
        if (!part || core.is_ours(part) || core.skip_tags[part.tagName]) return NodeFilter.FILTER_REJECT;
        return text_node.nodeValue.toLowerCase().indexOf(needle) > -1 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    while ((text_node = walker.nextNode())) { if (core.is_visible(text_node.parentElement)) hits.push(text_node); }
    if (!hits.length) return false;
    var start = 0;
    if (core.last_find.words === needle) { var position = hits.indexOf(core.last_find.node); if (position > -1) start = (position + 1) % hits.length; }
    var node = hits[start], position_2 = node.nodeValue.toLowerCase().indexOf(needle);
    core.last_find = { words: needle, node: node, at: position_2 };
    core.focus_element(node.parentElement);
    try {
      var range = document.createRange(); range.setStart(node, position_2); range.setEnd(node, position_2 + needle.length);
      var selector = window.getSelection(); selector.removeAllRanges(); selector.addRange(range);
    } catch (error) { /* the outline still shows where it is */ }
    return { index: start + 1, total: hits.length };
  };
});
