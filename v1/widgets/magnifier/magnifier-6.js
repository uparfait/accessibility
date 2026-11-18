/* magnifier/magnifier-6.js: Magnifier, continued: frames and embedded pages inside the glass */
accessibles_core.define('magnifier/magnifier-6.js', [], function (core) {
  'use strict';
  // Frames: a page from this site is copied in; a page from another site is shown again in the glass's frame layer
  core.magnifier.copy_frame = function (node, source) {
    var inner = null, rect = source.getBoundingClientRect();
    try { inner = source.contentDocument; } catch (error) { inner = null; }
    if (!inner || !inner.body) {
      // A page from another site keeps its place; it is shown from its own layer, loaded once
      var space_box = document.createElement('div');
      space_box.style.cssText = 'display:inline-block;vertical-align:top;width:' + rect.width + 'px;height:' + rect.height + 'px';
      node.replaceWith(space_box);
      this.frame_sources.push(source);
      return;
    }
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
  // Pages from other sites get one frame each in the glass's frame layer: made once, kept while the page keeps them
  core.magnifier.sync_frames = function () {
    var self = this, layer = this.frames_layer, sources = this.frame_sources;
    this.frames = this.frames.filter(function (pair) {
      if (sources.indexOf(pair[1]) > -1 && pair[0].src === pair[1].src) return true;
      pair[0].remove();
      return false;
    });
    sources.forEach(function (source) {
      if (self.frames.some(function (pair) { return pair[1] === source; })) return;
      var frame = document.createElement('iframe');
      frame.src = source.src; frame.title = source.title || ''; frame.tabIndex = -1; frame.setAttribute('allow', ''); frame.setAttribute('aria-hidden', 'true');
      layer.appendChild(frame);
      self.frames.push([frame, source]);
    });
  };
});
