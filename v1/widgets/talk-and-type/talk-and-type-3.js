/* talk-and-type/talk-and-type-3.js: Talk & type, continued */
accessibles_core.define('talk-and-type/talk-and-type-3.js', [], function (core) {
  'use strict';
  // Turns spoken punctuation ("comma", "full stop") into marks
  core.voice.punctuate = function (text) {
    var self = this;
    core.spoken_punctuation.forEach(function (punctuation) {
      self.variants(punctuation[0]).forEach(function (variant) {
        var escaped_variant = variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        text = text.replace(new RegExp('(^|\\s)' + escaped_variant + '(?=\\s|$)', 'gi'), punctuation[2] ? '$1' + punctuation[1] : punctuation[1]);
      });
    });
    // Tidy spaces around punctuation and capitalise new sentences
    text = text.replace(/\s+([.,?!:;)”])/g, '$1').replace(/([(“])\s+/g, '$1').replace(/ *\n */g, '\n');
    return text.replace(/([.!?]\s+|\n)([a-zà-ɏ])/g, function (whole, break_text, letter) { return break_text + letter.toUpperCase(); }).replace(/^ +| +$/g, '');
  };
  // Removes the text typed last
  core.voice.undo = function () {
    var item = this.last_insert, element = core.last_editable;
    if (item && item.element === element && core.current_value(element) === item.after) { if (element.isContentEditable) element.textContent = item.before; else core.set_value(element, item.before); this.last_insert = null; return; }
    core.delete_word(element);
  };
  // Moves to the next or previous field
  core.voice.field = function (direction) {
    var all = Array.prototype.filter.call(document.querySelectorAll(core.field_selector), function (field) { return !core.is_ours(field) && core.is_visible(field) && core.is_editable(field); });
    if (!all.length) return;
    var position = all.indexOf(core.last_editable);
    var next = all[(position + direction + all.length) % all.length];
    core.focus_element(next);
    core.last_editable = next;
    core.ui.pill('');
  };
  // Sends the form of the field being typed in
  core.voice.send = function () {
    var element = core.last_editable, item = element && element.form;
    if (!item) { if (element) core.press_enter(element); return; }
    if (item.requestSubmit) item.requestSubmit(); else item.submit();
  };
  // Spoken punctuation: [what you say, what is typed, keep the space before]
  core.spoken_punctuation = [
    ['new paragraph', '\n\n'], ['new line', '\n'], ['next line', '\n'],
    ['full stop', '.'], ['period', '.'], ['question mark', '?'], ['exclamation mark', '!'], ['exclamation point', '!'],
    ['semicolon', ';'], ['colon', ':'], ['comma', ','], ['dash', ' -', 1], ['hyphen', '-'],
    ['open quote', '“', 1], ['close quote', '”'], ['open bracket', '(', 1], ['close bracket', ')']
  ];
});
