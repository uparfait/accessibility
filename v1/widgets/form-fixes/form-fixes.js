/* form-fixes/form-fixes.js: Form fixes: labels fields and announces errors */
accessibles_core.define('form-fixes/form-fixes.js', ['form-fixes-2.js'], function (core) {
  'use strict';
  core.form_fixes = {
    on: false,
    recorder: new core.change_recorder()
  };
  // Brings this part of the page in line with the settings
  core.form_fixes.sync = function () { if (core.state.formFix && !this.on) { this.on = true; this.fix(document.body); } else if (!core.state.formFix && this.on) { this.on = false; this.recorder.revert(); } };
  // Text written just before a field, used as its label when it has none
  core.form_fixes.nearby_text = function (element) {
    var previous_value = element.previousElementSibling;
    if (previous_value && !/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(previous_value.tagName)) { var text = core.text_of(previous_value); if (text && text.length < 80) return text; }
    var part = element.parentElement;
    if (part && part.children.length <= 3) {
      var clone = '';
      for (var node = part.firstChild; node; node = node.nextSibling) { if (node.nodeType === 3) clone += node.nodeValue; else if (node !== element && node.nodeType === 1 && !/^(INPUT|SELECT|TEXTAREA)$/.test(node.tagName)) clone += ' ' + core.text_of(node); }
      clone = clone.replace(/\s+/g, ' ').trim();
      if (clone && clone.length < 80) return clone;
    }
    return '';
  };
});
