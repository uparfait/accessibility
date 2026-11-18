/* on-screen-keyboard/on-screen-keyboard-2.js: On-screen keyboard, continued */
accessibles_core.define('on-screen-keyboard/on-screen-keyboard-2.js', [], function (core) {
  'use strict';
    // Listeners for the keyboard: keys keep focus in the page, the top bar drags it
  core.on_screen_keyboard.bind = function () {
    core.find_one('.vkb').addEventListener('pointerdown', function (event) { if (event.target.closest('.key')) event.preventDefault(); });
    core.find_one('.vkb').addEventListener('mousedown', function (event) { if (event.target.closest('.key')) event.preventDefault(); });

    var keyboard_head = core.find_one('.vkb-head'), keyboard_drag = null;
    keyboard_head.addEventListener('pointerdown', function (event) {
      if (event.button !== 0 || event.target.closest('button')) return;
      var box = core.find_one('.vkb'), rect = box.getBoundingClientRect();
      keyboard_drag = { id: event.pointerId, start_x: event.clientX, start_y: event.clientY, origin_x: rect.left, origin_y: rect.top };
      box.classList.add('moved');
      box.style.left = rect.left + 'px'; box.style.top = rect.top + 'px'; box.style.bottom = 'auto';
      keyboard_head.classList.add('dragging');
      try { keyboard_head.setPointerCapture(event.pointerId); } catch (error) { /* ignore */ }
      event.preventDefault();
    });
    keyboard_head.addEventListener('pointermove', function (event) {
      if (!keyboard_drag || event.pointerId !== keyboard_drag.id) return;
      var box = core.find_one('.vkb'), width = box.offsetWidth, height = box.offsetHeight;
      core.ui.keyboard_position = { x: core.clamp(keyboard_drag.origin_x + event.clientX - keyboard_drag.start_x, 8, core.view_width() - width - 8), y: core.clamp(keyboard_drag.origin_y + event.clientY - keyboard_drag.start_y, 8, core.view_height() - height - 8) };
      box.style.left = core.ui.keyboard_position.x + 'px'; box.style.top = core.ui.keyboard_position.y + 'px';
    });
    var end_keyboard_drag = function () { keyboard_drag = null; keyboard_head.classList.remove('dragging'); };
    keyboard_head.addEventListener('pointerup', end_keyboard_drag); keyboard_head.addEventListener('pointercancel', end_keyboard_drag);
  };
    // The keyboard stays on screen when the window gets smaller
  core.on_screen_keyboard.bind_resize = function () {
    var keep_inside = core.debounce(function () { if (core.ui.keyboard_position) { var box = core.find_one('.vkb'), width = box.offsetWidth, height = box.offsetHeight; core.ui.keyboard_position = { x: core.clamp(core.ui.keyboard_position.x, 8, core.view_width() - width - 8), y: core.clamp(core.ui.keyboard_position.y, 8, core.view_height() - height - 8) }; box.style.left = core.ui.keyboard_position.x + 'px'; box.style.top = core.ui.keyboard_position.y + 'px'; } }, 80);
    window.addEventListener('resize', keep_inside);
  };
  // Brings this part of the page in line with the settings
  core.on_screen_keyboard.sync = function () {
    var box = core.find_one('.vkb');
    if (!this.bound) { this.bound = true; this.bind(); this.bind_resize(); }
    if (core.state.vkeyboard && box.hidden) { this.render(); box.hidden = false; core.ui.vkb_target(); }
    else if (!core.state.vkeyboard && !box.hidden) box.hidden = true;
  };
  core.register('module', { folder: 'on-screen-keyboard', order: 140, module: core.on_screen_keyboard });
  // Shows which field the on-screen keyboard types into
  core.ui.vkb_target = function () {
    var element = core.find_one('.vkb-target');
    if (!element) return;
    var target_element = core.last_editable;
    element.textContent = target_element && target_element.isConnected ? 'Typing in: ' + (core.accessible_name(target_element) || target_element.getAttribute('placeholder') || target_element.name || 'text field').slice(0, 50) : 'Select a text field on the page';
  };

  // What a click on a panel button with one of these data attributes does
  core.register('click_attribute', { folder: 'on-screen-keyboard', attribute: 'data-k', order: 10, run: function (target) {
    core.on_screen_keyboard.press(target.getAttribute('data-k'));
  } });
  core.register('action', { folder: 'on-screen-keyboard', names: ['vkb-close'], run: function (target) {
    core.set_state('vkeyboard', false);
  } });
});
