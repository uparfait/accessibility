/* magnifier/magnifier-3.js: Magnifier, continued: making the copy quiet and finding the page color */
accessibles_core.define('magnifier/magnifier-3.js', [], function (core) {
  'use strict';
  // Makes the copy quiet: no scripts, frames or sound; fields, canvases and videos look like the real ones
  core.magnifier.clean = function (copy, original) {
    var kinds = 'input,textarea,select,canvas,video,iframe,img';
    var originals = original.querySelectorAll(kinds), copies = copy.querySelectorAll(kinds);
    Array.prototype.forEach.call(copies, function (node, index) {
      var source = originals[index];
      if (!source) return;
      if (node.tagName === 'IFRAME') {
        var rect = source.getBoundingClientRect(), box = document.createElement('div');
        box.style.cssText = 'display:inline-block;width:' + rect.width + 'px;height:' + rect.height + 'px;background:#e8eaed;border-radius:4px';
        node.replaceWith(box);
      } else if (node.tagName === 'VIDEO') {
        node.removeAttribute('autoplay'); node.muted = true; node.preload = 'none';
      } else if (node.tagName === 'CANVAS') {
        try { node.getContext('2d').drawImage(source, 0, 0); } catch (error) { /* a canvas from another site cannot be copied */ }
      } else if (node.tagName === 'IMG') {
        node.removeAttribute('loading');
      } else if ('value' in source) {
        node.value = source.value;
        if (source.type === 'checkbox' || source.type === 'radio') node.checked = source.checked;
      }
    });
    Array.prototype.forEach.call(copy.querySelectorAll('script,noscript,audio,template,dialog:not([open])'), function (node) { node.remove(); });
  };
  // The color behind the page, so the glass is never see-through
  core.magnifier.page_background = function () {
    var colors = [getComputedStyle(document.body).backgroundColor, getComputedStyle(document.documentElement).backgroundColor];
    for (var index = 0; index < colors.length; index++) {
      if (colors[index] && !/rgba\(0, 0, 0, 0\)|transparent/.test(colors[index])) return colors[index];
    }
    return '#ffffff';
  };
});
