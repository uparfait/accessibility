/* bigger-text/bigger-text-2.js: Bigger text, continued */
accessibles_core.define('bigger-text/bigger-text-2.js', [], function (core) {
  'use strict';
  // Resizes the text of a list of elements
  core.bigger_text.apply_list = function (list) {
    if (this.factor === 1) return;
    var self = this, item = this.factor;
    var targets = list.filter(function (item) { return !self.map.has(item); });
    // Measure everything first, then write, so we never read a value we already scaled
    var measured = targets.map(function (element) {
      var style = getComputedStyle(element);
      var size = parseFloat(style.fontSize) || 16;
      var line_height = /px$/.test(style.lineHeight) ? parseFloat(style.lineHeight) : 0;
      // New content inside an already scaled element inherits the scaled size; undo that once
      var anchor = element.parentElement, parent_record = null;
      while (anchor && !parent_record) { parent_record = self.map.get(anchor) || null; anchor = anchor.parentElement; }
      if (parent_record && Math.abs(size - parent_record.size * item) < 0.05) { size = parent_record.size; if (line_height) line_height = line_height / item; }
      return { element: element, size: size, line_height: line_height };
    });
    measured.forEach(function (match) {
      var status = match.element.style;
      var record = { had: match.element.hasAttribute('style'), size: match.size, font_size: status.getPropertyValue('font-size'), font_size_priority: status.getPropertyPriority('font-size'), line_height: status.getPropertyValue('line-height'), line_height_priority: status.getPropertyPriority('line-height'), set_line_height: false };
      status.setProperty('font-size', (match.size * item).toFixed(2) + 'px', 'important');
      if (!self.line_height_mode && match.line_height) { status.setProperty('line-height', (match.line_height * item).toFixed(2) + 'px', 'important'); record.set_line_height = true; }
      self.map.set(match.element, record);
      self.list.push(match.element);
    });
  };
  // Undoes every change this feature made to the page
  core.bigger_text.restore = function () {
    var self = this;
    this.run++;
    this.list.forEach(function (item) {
      var record = self.map.get(item);
      if (!record) return;
      if (record.font_size) item.style.setProperty('font-size', record.font_size, record.font_size_priority); else item.style.removeProperty('font-size');
      if (record.set_line_height) { if (record.line_height) item.style.setProperty('line-height', record.line_height, record.line_height_priority); else item.style.removeProperty('line-height'); }
      if (!record.had && !item.getAttribute('style')) item.removeAttribute('style');
      self.map.delete(item);
    });
    this.list = [];
  };
  core.register('module', { folder: 'bigger-text', order: 20, module: core.bigger_text });
});
