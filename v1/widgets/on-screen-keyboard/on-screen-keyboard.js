/* on-screen-keyboard/on-screen-keyboard.js: On-screen keyboard: type with clicks or taps */
accessibles_core.define('on-screen-keyboard/on-screen-keyboard.js', ['on-screen-keyboard-2.js'], function (core) {
  'use strict';
  core.on_screen_keyboard = {
    shift: false,
    caps: false,
    symbols: false
  };
  // The rows of keys for the current mode
  core.on_screen_keyboard.rows = function () {
    if (this.symbols) return [['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'], ['@', '#', '$', '&', '*', '(', ')', '-', "'", '"'], ['=', '%', '+', '!', '?', ',', '.', '/', ':', 'BKSP'], ['ABC', 'LEFT', 'SPACE', 'RIGHT', 'TAB', 'ENTER']];
    return [['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'], ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '-'], ['SHIFT', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '.', 'BKSP'], ['123', 'LEFT', 'SPACE', 'RIGHT', 'TAB', 'ENTER']];
  };
  // Draws it again from the current state
  core.on_screen_keyboard.render = function () {
    var is_upper = this.shift || this.caps, html = '';
    var key_labels = { BKSP: core.icon_svg('backspace'), SHIFT: core.icon_svg('shift'), ENTER: core.icon_svg('enter'), LEFT: core.icon_svg('left'), RIGHT: core.icon_svg('right'), SPACE: 'space', TAB: 'tab', '123': '123', ABC: 'abc' };
    var key_names = { BKSP: 'Backspace', SHIFT: 'Shift', ENTER: 'Enter', LEFT: 'Move left', RIGHT: 'Move right', SPACE: 'Space', TAB: 'Next field', '123': 'Numbers and symbols', ABC: 'Letters' };
    this.rows().forEach(function (row) {
      html += '<div class="krow">';
      row.forEach(function (key_row) {
        var special = key_labels[key_row] !== undefined;
        var char = special ? key_labels[key_row] : core.escape_html(is_upper ? key_row.toUpperCase() : key_row);
        var class_name = 'key' + (special ? ' k-' + key_row.toLowerCase() : '') + (key_row === 'SHIFT' && is_upper ? ' on' : '');
        html += '<button type="button" class="' + class_name + '" data-k="' + core.escape_html(key_row) + '" aria-label="' + core.escape_html(special ? key_names[key_row] : (is_upper ? key_row.toUpperCase() : key_row)) + '"' + (key_row === 'SHIFT' ? ' aria-pressed="' + is_upper + '"' : '') + '>' + char + '</button>';
      });
      html += '</div>';
    });
    core.find_one('.vkb-keys').innerHTML = html;
  };
  // Presses a key of the on-screen keyboard
  core.on_screen_keyboard.press = function (key) {
    var element = core.last_editable;
    if (key === 'SHIFT') { if (this.shift && !this.caps) { this.caps = true; } else if (this.caps) { this.caps = false; this.shift = false; } else this.shift = true; this.render(); return; }
    if (key === '123') { this.symbols = true; this.render(); return; }
    if (key === 'ABC') { this.symbols = false; this.render(); return; }
    if (!element || !element.isConnected) { core.toast('Select a text field on the page first'); return; }
    if (key === 'BKSP') core.backspace(element);
    else if (key === 'ENTER') core.press_enter(element);
    else if (key === 'LEFT') core.move_caret(element, -1);
    else if (key === 'RIGHT') core.move_caret(element, 1);
    else if (key === 'TAB') core.focus_next_field(element);
    else {
      var char = key === 'SPACE' ? ' ' : ((this.shift || this.caps) ? key.toUpperCase() : key);
      core.insert_text(element, char);
      if (this.shift && !this.caps) { this.shift = false; this.render(); }
    }
    core.ui.vkb_target();
  };
});
