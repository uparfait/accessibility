/* reading-mask/reading-mask.js: Reading mask: darkens all but a band around the pointer */
accessibles_core.define('reading-mask/reading-mask.js', [], function (core) {
  'use strict';
  // Reading mask: darkens the page above and below the pointer
  core.register('pointer_drawer', { folder: 'reading-mask', order: 20, from_middle: true,
    is_on: function () { return !!core.state.readingMask; },
    show: function () { core.find_one('.mask-t').hidden = core.find_one('.mask-b').hidden = !core.state.readingMask; },
    draw: function (pointer_state) {
        var band = Math.max(60, Math.round(core.view_height() * 0.14));
        core.find_one('.mask-t').style.height = Math.max(0, pointer_state.y - band / 2) + 'px';
        core.find_one('.mask-b').style.top = Math.max(0, pointer_state.y + band / 2) + 'px';
    } });
});
