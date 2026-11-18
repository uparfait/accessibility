/* magnifier/magnifier.js: Text magnifier: shows the text under the pointer in large letters */
accessibles_core.define('magnifier/magnifier.js', [], function (core) {
  'use strict';
  // Text magnifier: the text under the pointer, in large letters next to it
  core.register('pointer_drawer', { folder: 'magnifier', order: 30,
    is_on: function () { return !!core.state.magnifier; },
    show: function () { if (!core.state.magnifier) core.find_one('.lens').hidden = true; },
    draw: function (pointer_state) {
      var element = core.find_one('.lens'), target = pointer_state.last_target;
      if (!target || target.nodeType !== 1 || !core.is_page_like(target)) { element.hidden = true; return; }
      var block = target.closest('h1,h2,h3,h4,h5,h6,p,li,td,th,dt,dd,a,button,label,span,blockquote,figcaption,caption,summary,legend,div');
      var text = block ? core.text_of(block) : '';
      if (!text || (block.tagName === 'DIV' && text.length > 400)) { element.hidden = true; return; }
      if (element.__text !== text) { element.textContent = text.length > 280 ? text.slice(0, 280) + '…' : text; element.__text = text; }
      element.hidden = false;
      var width = element.offsetWidth, height = element.offsetHeight, pos_x = pointer_state.x + 18, pos_y = pointer_state.y + 22;
      if (pos_x + width > core.view_width() - 8) pos_x = Math.max(8, pointer_state.x - width - 18);
      if (pos_y + height > core.view_height() - 8) pos_y = Math.max(8, pointer_state.y - height - 18);
      element.style.transform = 'translate(' + Math.round(pos_x) + 'px,' + Math.round(pos_y) + 'px)';
    } });
});
