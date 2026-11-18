/* magnifier/magnifier-3.js: Magnifier, continued: making every copied element look like the real one */
accessibles_core.define('magnifier/magnifier-3.js', [], function (core) {
  'use strict';
  // Goes through the copy and the page side by side; then removes what must not run twice
  core.magnifier.clean = function (copy, original) {
    var self = this, copies = Array.prototype.slice.call(copy.getElementsByTagName('*')), sources = Array.prototype.slice.call(original.getElementsByTagName('*'));
    this.live = []; this.fixed = []; this.scrolled = [];
    if (original.scrollTop || original.scrollLeft) this.scrolled.push([copy, original]);
    copies.forEach(function (node, index) { self.match(node, sources[index]); });
    Array.prototype.forEach.call(copy.querySelectorAll('script,noscript,audio,template,dialog:not([open])'), function (node) { node.remove(); });
  };
  // Makes one copied element look like the real one right now
  core.magnifier.match = function (node, source) {
    if (!source || node.tagName !== source.tagName || core.is_ours(source)) return;
    var tag = node.tagName;
    if (source.scrollTop || source.scrollLeft) this.scrolled.push([node, source]);
    if (source.shadowRoot && !node.shadowRoot) {
      try { var root = node.attachShadow({ mode: 'open' }); Array.prototype.forEach.call(source.shadowRoot.childNodes, function (child) { root.appendChild(child.cloneNode(true)); }); } catch (error) { /* this element cannot hold a copy */ }
    }
    // Videos and drawings are shown live: their picture is painted into the glass as it changes
    if (tag === 'VIDEO' || tag === 'CANVAS') {
      var rect = source.getBoundingClientRect(), canvas = document.createElement('canvas');
      canvas.width = source.videoWidth || source.width || Math.round(rect.width) || 300;
      canvas.height = source.videoHeight || source.height || Math.round(rect.height) || 150;
      canvas.style.cssText = 'display:' + (getComputedStyle(source).display === 'block' ? 'block' : 'inline-block') + ';width:' + rect.width + 'px;height:' + rect.height + 'px;vertical-align:top';
      node.replaceWith(canvas);
      this.live.push([canvas, source]);
      return;
    }
    if (tag === 'IFRAME') { this.copy_frame(node, source); return; }
    if (tag === 'IMG') node.removeAttribute('loading');
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) { node.value = source.value; if (/checkbox|radio/.test(source.type)) node.checked = source.checked; }
    // Boxes fixed on the screen are moved to where they are now, as the page scrolls
    if (getComputedStyle(source).position === 'fixed') this.fixed.push([node, source]);
  };
  // Frames: a page from this site is copied too; a page from another site is loaded again in the glass, without sound
  core.magnifier.copy_frame = function (node, source) {
    var inner = null, rect = source.getBoundingClientRect();
    try { inner = source.contentDocument; } catch (error) { inner = null; }
    if (!inner || !inner.body) { node.setAttribute('allow', ''); node.setAttribute('tabindex', '-1'); return; }
    var box = document.createElement('div');
    box.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;width:' + rect.width + 'px;height:' + rect.height + 'px';
    var root = box.attachShadow({ mode: 'open' });
    Array.prototype.forEach.call(inner.querySelectorAll('link[rel~="stylesheet"],style'), function (sheet) {
      var sheet_copy = sheet.cloneNode(true);
      if (sheet.href) sheet_copy.href = sheet.href;
      root.appendChild(sheet_copy);
    });
    var page = inner.documentElement.cloneNode(false);
    page.style.setProperty('display', 'block'); page.style.setProperty('width', rect.width + 'px');
    page.appendChild(inner.body.cloneNode(true));
    root.appendChild(page);
    node.replaceWith(box);
  };
});
