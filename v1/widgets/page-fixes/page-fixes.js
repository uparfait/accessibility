/* page-fixes/page-fixes.js: Shared tools for fixing page markup and naming elements */
accessibles_core.define('page-fixes/page-fixes.js', ['page-fixes-2.js', 'page-fixes-3.js'], function (core) {
  'use strict';
  // Records every change made to the page so it can be undone exactly
  core.change_recorder = function () { this.records = []; this.nodes = []; };
  // True when an element holds text of its own (or is a field or button)
  core.has_own_text = function (element) {
    if (/^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(element.tagName)) return true;
    for (var node = element.firstChild; node; node = node.nextSibling) {
      if (node.nodeType === 3 && /\S/.test(node.nodeValue)) return true;
    }
    return false;
  };
  // Every element under root that holds text, skipping the widget, SVG and script-like tags
  core.collect_text_elements = function (root) {
    var out = [];
    if (!root || root.nodeType !== 1 || core.is_ours(root)) return out;
    if (core.has_own_text(root)) out.push(root);
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
      acceptNode: function (node) {
        if (core.skip_tags[node.tagName] || node.namespaceURI === 'http://www.w3.org/2000/svg' || core.is_ours(node)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var node;
    while ((node = walker.nextNode())) { if (core.has_own_text(node)) out.push(node); }
    return out;
  };
  // Marks an element as fixed by a feature, for the page check
  core.mark_fixed = function (record, element, kind) {
    var current = element.getAttribute('data-acc-fixed') || '';
    if ((' ' + current + ' ').indexOf(' ' + kind + ' ') < 0) record.set(element, 'data-acc-fixed', (current + ' ' + kind).trim());
  };
  // The name a screen reader would read for an element
  core.accessible_name = function (target_element) {
    if (!target_element) return '';
    var attribute = target_element.getAttribute('aria-label');
    if (attribute && attribute.trim()) return attribute.trim();
    var labelled_by = target_element.getAttribute('aria-labelledby');
    if (labelled_by) {
      var element = labelled_by.split(/\s+/).map(function (id) { var element = document.getElementById(id); return element ? core.text_of(element) : ''; }).join(' ').trim();
      if (element) return element;
    }
    if (target_element.labels && target_element.labels.length) {
      var label_text = Array.prototype.map.call(target_element.labels, core.text_of).join(' ').trim();
      if (label_text) return label_text;
    }
    if (target_element.tagName === 'IMG' || (target_element.tagName === 'INPUT' && target_element.type === 'image')) return (target_element.getAttribute('alt') || '').trim();
    var spoken_text = core.text_of(target_element);
    if (spoken_text) return spoken_text;
    var imgs = target_element.querySelectorAll ? target_element.querySelectorAll('img[alt],svg title,[aria-label]') : [];
    for (var count = 0; count < imgs.length; count++) {
      var attribute_2 = imgs[count].tagName === 'title' ? imgs[count].textContent : (imgs[count].getAttribute('alt') || imgs[count].getAttribute('aria-label'));
      if (attribute_2 && attribute_2.trim()) return attribute_2.trim();
    }
    if (target_element.getAttribute('title')) return target_element.getAttribute('title').trim();
    if (target_element.tagName === 'INPUT' && /^(submit|reset|button)$/i.test(target_element.type)) return target_element.value || '';
    return '';
  };
});
