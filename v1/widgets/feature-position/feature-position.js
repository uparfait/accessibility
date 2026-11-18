/* feature-position/feature-position.js: Feature position: moves the button to another corner */
accessibles_core.define('feature-position/feature-position.js', [], function (core) {
  'use strict';
  core.ui.views.position = {
      title: 'Feature position',
      render: function (box) {
        var current = core.drag_position ? '' : (core.state.position ? core.normalize_position(core.state.position).key : core.config.position.key);
        var cells = [['top-left', 'top left'], ['top-center', 'top center'], ['top-right', 'top right'], ['left-center', 'middle left'], ['', ''], ['right-center', 'middle right'], ['bottom-left', 'bottom left'], ['bottom-center', 'bottom center'], ['bottom-right', 'bottom right']];
        box.innerHTML = '<div class="posgrid" role="group" aria-label="Position">' + cells.map(function (command) {
          if (!command[0]) return '<button type="button" class="mid" tabindex="-1" aria-hidden="true"></button>';
          return '<button type="button" data-pos="' + command[0] + '" class="' + (current === command[0] ? 'on' : '') + '" aria-pressed="' + (current === command[0]) + '" aria-label="Place ' + command[1] + '"><i class="pd"></i></button>';
        }).join('') + '</div>' +
          '<div class="btns"><button type="button" class="btn ghost" data-act="pos-reset">' + core.icon_svg('reset') + 'Move the button back to its default place</button></div>';
      }
    };
  core.register('click_attribute', { folder: 'feature-position', attribute: 'data-pos', order: 120, run: function (target) {
    core.set_state('position', target.getAttribute('data-pos')); core.drag_position = null; core.ui.panel_pos = null; core.ui.place_launcher(); core.save_settings(); core.ui.open_view('position');
  } });
  core.register('action', { folder: 'feature-position', names: ['pos-reset'], run: function (target) {
    core.drag_position = null; core.ui.panel_pos = null; core.set_state('position', ''); core.ui.place_launcher(); core.save_settings(); core.ui.open_view('position');
  } });
});
