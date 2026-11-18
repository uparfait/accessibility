/* hide-images/hide-images.js: Hide images: hides pictures and shows their descriptions */
accessibles_core.define('hide-images/hide-images.js', [], function (core) {
  'use strict';
  core.register('page_css', { folder: 'hide-images', order: 210, rules: function (body) {
    var list = [];
    if (core.state.hideImages) {
      list.push(body + ' :is(img,picture,video,[role="img"]:not(svg),input[type="image"],object,embed){display:none!important}');
      list.push('.acc-imgalt{display:inline-flex!important;align-items:center!important;gap:.4em!important;max-width:100%!important;padding:.3em .65em!important;margin:.15em 0!important;border:1px dashed currentColor!important;border-radius:999px!important;font:500 .85em/1.35 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif!important;opacity:.85!important;vertical-align:middle!important}');
      list.push(body + ' *:not(svg *){background-image:none!important}');
    }
    return list;
  } });

  // Hide images: each meaningful picture or video is replaced by a small label with its description
  core.hide_images = {
    on: false, recorder: new core.change_recorder(),
    sync: function () { if (core.state.hideImages && !this.on) { this.on = true; this.fix(document.body); } else if (!core.state.hideImages && this.on) { this.on = false; this.recorder.revert(); this.clear(document.body); } },
    clear: function (root) { Array.prototype.forEach.call(root.querySelectorAll('img,video,[role="img"],input[type="image"]'), function (element) { element.__acc_alt = false; }); },
    fix: function (root) {
      if (!this.on || !root || root.nodeType !== 1) return;
      var recorder = this.recorder;
      var list = Array.prototype.slice.call(root.querySelectorAll('img,video,[role="img"]:not(svg),input[type="image"]'));
      if (root.matches && root.matches('img,video')) list.unshift(root);
      list.forEach(function (item) {
        if (item.__acc_alt || core.is_ours(item)) return;
        item.__acc_alt = true;
        var is_video = item.tagName === 'VIDEO';
        var text = (is_video ? (item.getAttribute('aria-label') || item.getAttribute('title') || '') : (item.getAttribute('alt') || item.getAttribute('aria-label') || item.getAttribute('title') || '')).trim();
        if (!text && !is_video) return;   // decorative: simply hidden
        var tag = document.createElement('span');
        tag.className = 'acc-imgalt';
        tag.setAttribute('role', 'img');
        tag.setAttribute('aria-label', (is_video ? 'Video' : 'Picture') + (text ? ': ' + text : ''));
        tag.textContent = (is_video ? 'Video' : 'Picture') + (text ? ': ' + text : '');
        var host_name = item.parentElement && item.parentElement.tagName === 'PICTURE' ? item.parentElement : item;
        host_name.parentNode.insertBefore(recorder.add(tag), host_name.nextSibling);
      });
    }
  };
  core.register('module', { folder: 'hide-images', order: 200, module: core.hide_images });
});
