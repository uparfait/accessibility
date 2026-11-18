/* page-text/page-text.js: Finds the main text of the page and makes a clean copy of it */
accessibles_core.define('page-text/page-text.js', ['page-text-2.js'], function (core) {
  'use strict';
  // A clean copy of page content: text, headings, lists, links and images only
  core.clean_copy = function (src, depth) {
    var frag = document.createDocumentFragment();
    if (depth > 40) return frag;
    for (var node = src.firstChild; node; node = node.nextSibling) {
      if (node.nodeType === 3) { frag.appendChild(document.createTextNode(node.nodeValue)); continue; }
      if (node.nodeType !== 1 || core.is_ours(node) || core.reader_drop_tags[node.tagName]) continue;
      if (node.getAttribute('aria-hidden') === 'true' || node.hidden) continue;
      var class_name = (typeof node.className === 'string' ? node.className : '') + ' ' + (node.id || '');
      if (core.clutter_pattern.test(class_name) && core.text_of(node).length < 600) continue;
      if (node.tagName === 'HEADER' && depth > 0 && node.querySelector('nav')) continue;
      var style = null;
      try { style = getComputedStyle(node); } catch (error) { style = null; }
      if (style && (style.display === 'none' || style.visibility === 'hidden')) continue;
      if (core.reader_keep_tags[node.tagName]) {
        var element = document.createElement(node.tagName.toLowerCase());
        if (node.tagName === 'A') {
          var href = node.href || '';
          if (/^(https?:|mailto:|tel:)/i.test(href)) { element.setAttribute('href', href); element.setAttribute('target', '_blank'); element.setAttribute('rel', 'noopener noreferrer'); }
        } else if (node.tagName === 'IMG') {
          var text = node.currentSrc || node.src || '';
          if (!/^(https?:|data:image\/)/i.test(text) || (node.naturalWidth && node.naturalWidth < 48)) continue;
          element.setAttribute('src', text);
          element.setAttribute('alt', node.getAttribute('alt') || '');
          element.setAttribute('loading', 'lazy');
        } else if (/^T[DH]$/.test(node.tagName)) {
          if (node.colSpan > 1) element.setAttribute('colspan', node.colSpan);
          if (node.rowSpan > 1) element.setAttribute('rowspan', node.rowSpan);
        }
        element.appendChild(core.clean_copy(node, depth + 1));
        frag.appendChild(element);
        // Inline tags the page shows on their own line (a bold label above its text) keep that line break
        if (style && /^(B|STRONG|EM|I|U|A|CODE|SMALL|MARK|TIME|CITE|Q|ABBR|SUP|SUB)$/.test(node.tagName) && /^(block|flex|grid|table|list-item)$/.test(style.display)) frag.appendChild(document.createElement('br'));
      } else {
        // Unwrap containers (div, span, section…) but keep block separation
        var inner = core.clean_copy(node, depth + 1);
        if (style && /^(block|flex|grid|list-item|table)/.test(style.display) && inner.childNodes.length) {
          var has_block = false;
          for (var item = inner.firstChild; item; item = item.nextSibling) if (item.nodeType === 1 && /^(P|H\d|UL|OL|TABLE|BLOCKQUOTE|PRE|FIGURE|DL|HR)$/.test(item.tagName)) { has_block = true; break; }
          if (!has_block && core.text_of({ innerText: node.innerText }).length) { var paragraph = document.createElement('p'); paragraph.appendChild(inner); frag.appendChild(paragraph); continue; }
        }
        frag.appendChild(inner);
      }
    }
    return frag;
  };
});
