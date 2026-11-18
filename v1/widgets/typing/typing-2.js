/* typing/typing-2.js: Types into page fields for the on-screen keyboard and voice typing, continued */
accessibles_core.define('typing/typing-2.js', [], function (core) {
  'use strict';
  // Clears everything before or after the cursor; returns how much was removed
  core.clear_side = function (element, before) {
    if (!element || !element.isConnected) return 0;
    var value = core.current_value(element), count = value.length, count_2 = value.length;
    try { if (!element.isContentEditable && element.selectionStart != null) { count = element.selectionStart; count_2 = element.selectionEnd; } } catch (error) { /* use the end */ }
    var new_value = before ? value.slice(count_2) : value.slice(0, count);
    if (element.isContentEditable) element.textContent = new_value;
    else { core.set_value(element, new_value); try { var count_3 = before ? 0 : new_value.length; element.setSelectionRange(count_3, count_3); } catch (error) { /* ignore */ } }
    return value.length - new_value.length;
  };
  // Deletes the word before the caret
  core.delete_word = function (element) {
    if (!element) return;
    if (element.isContentEditable) { element.textContent = (element.textContent || '').replace(/\s*\S+\s*$/, ''); return; }
    core.set_value(element, (element.value || '').replace(/\s*\S+\s*$/, ''));
  };
  // Moves the caret left or right
  core.move_caret = function (element, detail) {
    if (!element || element.isContentEditable) return;
    try { var text = core.clamp(element.selectionStart + detail, 0, element.value.length); element.setSelectionRange(text, text); element.focus(); } catch (error) { /* ignore */ }
  };
  // Presses Enter in a field (new line, or sends the form)
  core.press_enter = function (element) {
    if (!element) return;
    if (element.tagName === 'TEXTAREA' || element.isContentEditable) { core.insert_text(element, '\n'); return; }
    var event = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true });
    var is_ok = element.dispatchEvent(event);
    element.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
    var item = element.form;
    if (is_ok && item) {
      var single = item.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"])').length === 1;
      if (item.querySelector('[type="submit"],button:not([type]),button[type="submit"]') || single) { if (item.requestSubmit) item.requestSubmit(); else item.submit(); }
    }
  };
  // Moves to the next field on the page
  core.focus_next_field = function (element) {
    var all = Array.prototype.filter.call(document.querySelectorAll('input:not([type="hidden"]),select,textarea,button,a[href],[tabindex]:not([tabindex="-1"]),[contenteditable="true"]'), function (node) { return !core.is_ours(node) && core.is_visible(node) && !node.disabled; });
    var position = all.indexOf(element);
    var node = all[(position + 1) % all.length];
    if (node) { node.focus(); if (core.is_editable(node)) core.last_editable = node; }
  };
  core.last_editable = null;
  document.addEventListener('focusin', function (event) { if (!core.is_ours(event.target) && core.is_editable(event.target)) core.last_editable = event.target; }, true);
  core.field_selector = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]),select,textarea,[contenteditable="true"],[contenteditable=""]';
  core.word_char_pattern = core.make_regex('[\\p{L}\\p{N}]', 'u', /[A-Za-z0-9\u00C0-\u024F]/);
});
