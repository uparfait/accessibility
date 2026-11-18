/* smart-contrast/smart-contrast.js: Smart contrast: fixes only the text that is hard to read */
accessibles_core.define('smart-contrast/smart-contrast.js', [], function (core) {
  'use strict';
  // Fixes only the text that fails WCAG contrast, leaving the rest of the design alone
  core.smart_contrast = {
    on: false, list: [], signature: '',
    sync: function () {
      var signature = [core.state.contrast, core.state.textColor, core.state.bgColor, core.state.fontSize, core.state.invert].join('|');
      if (core.state.smartContrast && this.on && signature !== this.signature) { this.restore(); this.signature = signature; this.fix(document.body); return; }
      this.signature = signature;
      if (core.state.smartContrast && !this.on) { this.on = true; this.fix(document.body); } else if (!core.state.smartContrast && this.on) { this.on = false; this.restore(); }
    },
    fix: function (root) {
      if (!this.on || !root || root.nodeType !== 1 || core.state.contrast === 'dark' || core.state.contrast === 'light' || core.state.textColor || core.state.bgColor) return;
      var self = this, todo = [];
      core.collect_text_elements(root).forEach(function (element) {
        if (element.__acc_smart || !core.is_visible(element)) return;
        var style = getComputedStyle(element), foreground = core.parse_color(style.color), background = core.effective_background(element);
        if (!foreground || !background) return;
        var size = parseFloat(style.fontSize), bold = parseInt(style.fontWeight, 10) >= 700;
        var need = (size >= 24 || (bold && size >= 18.66)) ? 3 : 4.5;
        if (core.contrast_ratio(foreground, background) >= need) return;
        var dark = core.contrast_ratio([0, 0, 0], background) >= core.contrast_ratio([255, 255, 255], background);
        todo.push([element, core.to_hex(core.ensure_contrast(foreground, dark ? [0, 0, 0] : [255, 255, 255], background, need + 0.3))]);
      });
      todo.forEach(function (title) {
        var element = title[0];
        self.list.push([element, element.style.getPropertyValue('color'), element.style.getPropertyPriority('color'), element.hasAttribute('style')]);
        element.__acc_smart = true;
        element.style.setProperty('color', title[1], 'important');
      });
    },
    restore: function () {
      this.list.forEach(function (record) {
        var element = record[0]; element.__acc_smart = false;
        if (record[1]) element.style.setProperty('color', record[1], record[2]); else element.style.removeProperty('color');
        if (!record[3] && !element.getAttribute('style')) element.removeAttribute('style');
      });
      this.list = [];
    }
  };
  core.register('module', { folder: 'smart-contrast', order: 30, module: core.smart_contrast });
});
