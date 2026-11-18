/* text-direction/text-direction-2.js: Text direction, continued */
accessibles_core.define('text-direction/text-direction-2.js', [], function (core) {
  'use strict';
  core.text_direction = {
    current: '', saved: null, list: [],
    sync: function () {
      var detail = core.page_direction();
      if (detail === this.current) return;
      var height = document.documentElement, second = document.body;
      this.restore();
      if (detail) {
        if (!this.saved) this.saved = { h: height.getAttribute('dir'), b: second.getAttribute('dir') };
        height.setAttribute('dir', detail); second.setAttribute('dir', detail);
        this.current = detail;
        this.fix(second);
      } else {
        if (this.saved) {
          if (this.saved.h === null) height.removeAttribute('dir'); else height.setAttribute('dir', this.saved.h);
          if (this.saved.b === null) second.removeAttribute('dir'); else second.setAttribute('dir', this.saved.b);
        }
        this.saved = null; this.current = '';
      }
    },
    fix: function (root) {
      if (!this.current || !root || root.nodeType !== 1) return;
      var self = this, from = this.current === 'rtl' ? 'left' : 'right', target = this.current === 'rtl' ? 'right' : 'left';
      var all = [root].concat(Array.prototype.slice.call(root.querySelectorAll('*')));
      var todo = [];
      all.forEach(function (item) {
        if (item.__acc_dir || core.is_ours(item) || core.skip_tags[item.tagName] || item.namespaceURI === 'http://www.w3.org/2000/svg') return;
        var style = getComputedStyle(item), sets = [];
        if (style.float === from) sets.push(['float', target]); else if (style.float === target) sets.push(['float', from]);
        if (style.textAlign === from) sets.push(['text-align', target]); else if (style.textAlign === target) sets.push(['text-align', from]);
        if (sets.length) todo.push([item, sets]);
      });
      todo.forEach(function (title) {
        var element = title[0];
        element.__acc_dir = true;
        title[1].forEach(function (preview) {
          self.list.push([element, preview[0], element.style.getPropertyValue(preview[0]), element.style.getPropertyPriority(preview[0]), element.hasAttribute('style')]);
          element.style.setProperty(preview[0], preview[1], 'important');
        });
      });
    },
    restore: function () {
      for (var index = this.list.length - 1; index >= 0; index--) {
        var record = this.list[index], element = record[0];
        element.__acc_dir = false;
        if (record[2]) element.style.setProperty(record[1], record[2], record[3]); else element.style.removeProperty(record[1]);
        if (!record[4] && !element.getAttribute('style')) element.removeAttribute('style');
      }
      this.list = [];
    }
  };
  core.register('module', { folder: 'text-direction', order: 190, module: core.text_direction });
});
