/* voice-commands/voice-commands-5.js: Voice commands, continued */
accessibles_core.define('voice-commands/voice-commands-5.js', [], function (core) {
  'use strict';
  // Finds the buttons and links whose names match what was said
  core.voice.guess_click = function (name, head_score) {
    var scored = [];
    var collect = function (all) {
      scored = [];
      core.voice.clickables(all).forEach(function (element) {
        var text = (core.accessible_name(element) || '').trim();
        if (!text || text.length > 80) return;
        scored.push({ element: element, s: core.word_match(name, text), label_text: text });
      });
    };
    // What is on screen first; if nothing there matches well, the whole page (it scrolls there)
    collect(false);
    if (!scored.some(function (entry) { return entry.s >= core.voice.sure_score; })) collect(true);
    // Options in drop-down lists can be chosen by name too
    Array.prototype.forEach.call(document.querySelectorAll('select'), function (selector) {
      if (core.is_ours(selector) || selector.disabled || !core.is_visible(selector)) return;
      Array.prototype.forEach.call(selector.options, function (option) { var text = core.text_of(option); if (text) scored.push({ element: option, s: core.word_match(name, text), label_text: text, opt: selector }); });
    });
    if (!scored.length) return null;
    scored.sort(function (entry, other) { return other.s - entry.s; });
    var top = scored[0], value = Math.min(1, head_score + 0.1);
    if (!top.s) return null;
    var press = function (item) {
      var element = item.element;
      if (item.opt) {
        item.opt.value = element.value; element.selected = true;
        item.opt.dispatchEvent(new Event('input', { bubbles: true }));
        item.opt.dispatchEvent(new Event('change', { bubbles: true }));
        core.focus_element(item.opt);
        return;
      }
      if (core.is_ours(element)) { try { element.focus(); } catch (error) { /* ignore */ } } else core.focus_element(element);
      element.click();
    };
    // Several things with the same name: highlight them and let the visitor pick one
    var same = scored.filter(function (entry) { return entry.s >= Math.max(0.86, top.s - 0.02); });
    if (same.length > 1) {
      var items = same.slice(0, 30).map(function (entry) { return { element: entry.opt || entry.element, label: entry.label_text.slice(0, 60), entry: entry }; });
      return { score: top.s * value, label: 'Click ' + top.label_text.slice(0, 60), run: function () { core.voice.choose(items, core.translate_ui(top.opt ? 'Choose' : 'Click'), function (item) { press(item.entry); }); } };
    }
    return { score: top.s * value, label: (top.opt ? 'Choose ' : 'Click ') + top.label_text.slice(0, 60), run: function () { press(top); } };
  };
});
