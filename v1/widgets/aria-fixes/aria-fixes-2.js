/* aria-fixes/aria-fixes-2.js: ARIA fixes, continued */
accessibles_core.define('aria-fixes/aria-fixes-2.js', [], function (core) {
  'use strict';
    // Frames get titles and table headers get a scope
  core.aria_fixes.fix_frames_and_tables = function (elements, record) {
    // Frames
    elements('iframe:not([title]):not([aria-label])').forEach(function (frame) {
      var src = frame.getAttribute('src') || '', host_name = '';
      try { host_name = new URL(src, location.href).hostname.replace(/^www\./, ''); } catch (error) { host_name = ''; }
      record.set(frame, 'title', host_name ? 'Embedded content from ' + host_name : 'Embedded content'); core.mark_fixed(record, frame, 'aria');
    });
    // Table headers
    elements('table th:not([scope])').forEach(function (header_cell) {
      var row = header_cell.parentElement;
      var scope = (header_cell.closest('thead') || (row && row === header_cell.closest('table').querySelector('tr'))) ? 'col' : (row && row.firstElementChild === header_cell ? 'row' : 'col');
      record.set(header_cell, 'scope', scope);
    });
  };
    // Links that open a new tab say so; alert-like boxes are announced
  core.aria_fixes.fix_links_and_messages = function (elements, record) {
    var self = this;
    // Links that open a new window
    var new_tab_links = elements('a[target="_blank"]:not([aria-describedby])');
    if (new_tab_links.length) {
      if (!self.new_tab_description || !self.new_tab_description.isConnected) {
        var label = document.createElement('span');
        label.id = 'acc-desc-newtab'; label.className = 'acc-sr-only'; label.textContent = 'Opens in a new tab';
        document.body.appendChild(record.add(label));
        self.new_tab_description = label;
      }
      new_tab_links.forEach(function (link) { record.set(link, 'aria-describedby', 'acc-desc-newtab'); });
    }
    // Live regions for status/alert style containers
    elements('[class*="alert"]:not([role]):not([aria-live]),[class*="toast"]:not([role]):not([aria-live]),[class*="notification"]:not([role]):not([aria-live])').forEach(function (element) {
      if (element.children.length < 6 && core.text_of(element).length < 300) { record.set(element, 'aria-live', 'polite'); }
    });
  };
  core.register('module', { folder: 'aria-fixes', order: 40, module: core.aria_fixes });
});
