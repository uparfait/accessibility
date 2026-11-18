/* magnifier/magnifier-3.js: Magnifier, continued: making every copied element look like the real one */
accessibles_core.define('magnifier/magnifier-3.js', [], function (core) {
  'use strict';
  // Goes through the copy and the page side by side; then removes what must not run twice
  core.magnifier.clean = function (copy, original) {
    var self = this, copies = Array.prototype.slice.call(copy.getElementsByTagName('*')), sources = Array.prototype.slice.call(original.getElementsByTagName('*'));
    this.live = []; this.fixed = []; this.scrolled = []; this.frame_sources = [];
    if (original.scrollTop || original.scrollLeft) this.scrolled.push([copy, original]);
    copies.forEach(function (node, index) { self.match(node, sources[index]); });
    Array.prototype.forEach.call(copy.querySelectorAll('script,noscript,audio,template,dialog:not([open])'), function (node) { node.remove(); });
    this.sync_frames();
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
    // Boxes fixed or stuck on the screen are pinned to where they are now; a stuck box leaves a space of its size behind
    var position = getComputedStyle(source).position;
    if (position === 'sticky') { var space = document.createElement('div'); space.style.height = source.getBoundingClientRect().height + 'px'; node.before(space); }
    if (position === 'fixed' || position === 'sticky') this.fixed.push([node, source]);
  };
});
