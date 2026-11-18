/* typing/typing.js: Types into page fields for the on-screen keyboard and voice typing */
accessibles_core.define('typing/typing.js', ['typing-2.js'], function (core) {
  'use strict';
  // The browser's own value setter for a field, so page frameworks notice the change
  core.value_setter = function (element) {
    var proto = element.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    var detail = Object.getOwnPropertyDescriptor(proto, 'value');
    return detail && detail.set;
  };
  // The text currently in a field
  core.current_value = function (element) { if (!element) return ''; return element.isContentEditable ? (element.textContent || '') : (element.value || ''); };
  // Sets a field's text and tells the page it changed
  core.set_value = function (element, value) {
    var set = core.value_setter(element);
    if (set) set.call(element, value); else element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  };
  // Types text into a field at the caret
  core.insert_text = function (element, text) {
    if (!element || !element.isConnected) return false;
    if (element.isContentEditable) {
      try { element.focus({ preventScroll: true }); } catch (error) { element.focus(); }
      if (!document.execCommand('insertText', false, text)) element.textContent += text;
      return true;
    }
    if (element.tagName !== 'INPUT' && element.tagName !== 'TEXTAREA') return false;
    try { element.focus({ preventScroll: true }); } catch (error) { element.focus(); }
    var text_2 = element.value, text_3 = null, selection_end = null;
    try { text_3 = element.selectionStart; selection_end = element.selectionEnd; } catch (error) { text_3 = null; }
    var set = core.value_setter(element);
    if (text_3 === null || text_3 === undefined) { set.call(element, text_2 + text); }
    else { set.call(element, text_2.slice(0, text_3) + text + text_2.slice(selection_end)); try { element.setSelectionRange(text_3 + text.length, text_3 + text.length); } catch (error) { /* ignore */ } }
    element.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
    return true;
  };
  // Deletes the character before the caret
  core.backspace = function (element) {
    if (!element || !element.isConnected) return;
    if (element.isContentEditable) { element.focus(); document.execCommand('delete'); return; }
    var text = element.value, text_2 = null, selection_end = null;
    try { text_2 = element.selectionStart; selection_end = element.selectionEnd; } catch (error) { text_2 = null; }
    var set = core.value_setter(element);
    if (text_2 === null || text_2 === undefined) set.call(element, text.slice(0, -1));
    else if (text_2 !== selection_end) { set.call(element, text.slice(0, text_2) + text.slice(selection_end)); element.setSelectionRange(text_2, text_2); }
    else if (text_2 > 0) { set.call(element, text.slice(0, text_2 - 1) + text.slice(text_2)); element.setSelectionRange(text_2 - 1, text_2 - 1); }
    element.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'deleteContentBackward' }));
  };
  // Removes n words from the start or the end of a box
  core.delete_words = function (element, node, from_start) {
    if (!element || !element.isConnected) return;
    var new_value = core.current_value(element);
    for (var count = 0; count < node; count++) new_value = from_start ? new_value.replace(/^\s*\S+\s*/, '') : new_value.replace(/\s*\S+\s*$/, '');
    if (element.isContentEditable) element.textContent = new_value; else core.set_value(element, new_value);
  };
});
