/* reading-guide/reading-guide.js: Reading guide: a line that follows the pointer */
accessibles_core.define('reading-guide/reading-guide.js', [], function (core) {
  'use strict';
  // Reading guide: a line under the pointer
  core.register('pointer_drawer', { folder: 'reading-guide', order: 10, from_middle: true,
    is_on: function () { return !!core.state.readingGuide; },
    show: function () { core.find_one('.guide').hidden = !core.state.readingGuide; },
    draw: function (pointer_state) {
        var element = core.find_one('.guide'), guide_width = element.offsetWidth || 400, pointer_x = pointer_state.x < 0 ? core.view_width() / 2 : pointer_state.x;
        var guide_x = core.clamp(pointer_x - guide_width / 2, 12, Math.max(12, core.view_width() - guide_width - 12));
        element.style.setProperty('--gx', Math.round(core.clamp(pointer_x - guide_x, 14, guide_width - 14)) + 'px');
        element.style.transform = 'translate(' + Math.round(guide_x) + 'px,' + Math.round(pointer_state.y + 14) + 'px)';
    } });
});
