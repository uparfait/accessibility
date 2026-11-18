/* hover-highlight/hover-highlight.js: Highlight hover: a frame around what is under the pointer */
accessibles_core.define('hover-highlight/hover-highlight.js', [], function (core) {
  'use strict';
  core.hover_highlight = {
    on: false, frame_request: 0, target: null,
    sync: function () {
      if (core.state.hoverHighlight && !this.on) { this.on = true; document.addEventListener('pointermove', this.on_move, { passive: true }); window.addEventListener('scroll', this.on_scroll, true); }
      else if (!core.state.hoverHighlight && this.on) { this.on = false; document.removeEventListener('pointermove', this.on_move); window.removeEventListener('scroll', this.on_scroll, true); core.find_one('.hl').hidden = true; }
    },
    on_move: function (event) {
      core.hover_highlight.target = core.real_target(event);
      if (!core.hover_highlight.frame_request) core.hover_highlight.frame_request = requestAnimationFrame(function () { core.hover_highlight.frame_request = 0; core.hover_highlight.draw(); });
    },
    on_scroll: function () { if (core.hover_highlight.target) core.hover_highlight.draw(); },
    draw: function () {
      var box = core.find_one('.hl'), target = this.target;
      if (!target || target.nodeType !== 1 || !core.is_page_like(target)) { box.hidden = true; return; }
      var element = target.closest('a[href],button,input,select,textarea,label,summary,[role="button"],[role="link"],img,video,h1,h2,h3,h4,h5,h6,p,li,td,th,blockquote,figure') || target;
      if (element === document.body || element === document.documentElement) { box.hidden = true; return; }
      var rect = element.getBoundingClientRect();
      if (rect.width > core.view_width() * 0.95 && rect.height > core.view_height() * 0.8) { box.hidden = true; return; }
      box.hidden = false;
      box.style.width = Math.round(rect.width + 8) + 'px';
      box.style.height = Math.round(rect.height + 8) + 'px';
      box.style.transform = 'translate(' + Math.round(rect.left - 4) + 'px,' + Math.round(rect.top - 4) + 'px)';
    }
  };
  core.register('module', { folder: 'hover-highlight', order: 180, module: core.hover_highlight });
});
