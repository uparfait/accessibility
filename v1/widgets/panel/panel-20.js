/* panel/panel-20.js: The button, the panel, its tabs, tiles, views, help and messages, continued */
accessibles_core.define('panel/panel-20.js', [], function (core) {
  'use strict';
  // Chooses an option from a list
  core.ui.pick_option = function (option) {
    var attribute = option.getAttribute('data-ov');
    var big = option.closest('.biglist');
    if (big) {
      var kind = big.getAttribute('data-list');
      if (kind === 'font') { this.set_busy(option); core.set_state('font', attribute); this.mark_list(big, attribute); }
      else if (kind === 'lang') { this.mark_list(big, attribute); this.done_busy('translate'); this.set_busy(option, 'translate'); if (core.has('translate')) core.page_translation.run(attribute); }
      return;
    }
    var second = this.select_open;
    if (!second) return;
    var id = second.getAttribute('data-sel'), detail = this.selects[id];
    this.close_select(true);
    // Choices that take a moment show a spinner and progress on the select itself
    if (id === 'helplang' && second.classList.contains('cs-btn')) this.set_busy(second, 'help');
    detail.pick(attribute);
    var current = detail.options().filter(function (pos_x) { return pos_x.v === attribute; })[0];
    if (current && second.classList.contains('cs-btn')) { core.find_one('.cv', second).textContent = current.l; second.setAttribute('aria-label', detail.title + ': ' + current.l); core.panel_translation.apply(second); }
  };
  // Marks the selected option of a list
  core.ui.mark_list = function (box, value) {
    core.find_all('.opt', box).forEach(function (option) { option.setAttribute('aria-selected', option.getAttribute('data-ov') === value); });
  };

    /* --- color picker (no native color input) --- */
  core.ui.palette_colors = ['#000000', '#262626', '#4d4d4d', '#737373', '#a3a3a3', '#d4d4d4', '#f2f2f2', '#ffffff',
    '#7f1d1d', '#b91c1c', '#ea580c', '#b45309', '#a16207', '#4d7c0f', '#15803d', '#0f766e',
    '#0e7490', '#0369a1', '#1d4ed8', '#4338ca', '#6d28d9', '#7e22ce', '#a21caf', '#be185d',
    '#fee2e2', '#ffedd5', '#fef9c3', '#dcfce7', '#cffafe', '#dbeafe', '#ede9fe', '#fce7f3'];
  // Opens the color picker
  core.ui.open_color = function (button) {
    if (this.color_picker_open === button) { this.close_color(true); return; }
    this.close_select(); this.close_color();
    var key = button.getAttribute('data-cpick'), popup = core.find_one('.cp-pop'), current = (core.state[key] || '').toLowerCase();
    this.color_picker_open = button; this.color_picker_key = key;
    popup.innerHTML = '<div class="cp-grid" role="group" aria-label="Colors">' + this.palette_colors.map(function (color) { return '<button type="button" data-cpv="' + color + '" data-bg="' + color + '" aria-label="' + color + '"' + (current === color ? ' class="on"' : '') + '></button>'; }).join('') + '</div>' +
      '<div class="cp-row"><span class="prev"></span><input type="text" class="inp cp-hex" maxlength="24" aria-label="Color code" placeholder="#1A2B3C" value="' + core.escape_html(core.state[key] || '') + '" spellcheck="false" autocomplete="off"><button type="button" class="btn" data-act="cp-apply">Use this color</button></div>';
    core.find_all('[data-bg]', popup).forEach(function (button) { button.style.background = button.getAttribute('data-bg'); });
    core.find_one('.prev', popup).style.background = core.state[key] || 'transparent';
    popup.hidden = false;
    var rect = button.getBoundingClientRect(), width = popup.offsetWidth, height = popup.offsetHeight, view_h = core.view_height();
    popup.style.left = Math.round(core.clamp(rect.right - width, 8, core.view_width() - width - 8)) + 'px';
    popup.style.top = Math.round(view_h - rect.bottom - 8 >= height ? rect.bottom + 6 : core.clamp(rect.top - height - 6, 8, view_h - height - 8)) + 'px';
    core.panel_translation.apply(popup);
    var first = core.find_one('.cp-grid .on', popup) || core.find_one('.cp-grid button', popup); first.focus();
  };
  // Closes the color picker
  core.ui.close_color = function (refocus) {
    var popup = core.find_one('.cp-pop');
    if (!popup || popup.hidden) return;
    popup.hidden = true; popup.innerHTML = '';
    var second = this.color_picker_open; this.color_picker_open = null;
    if (refocus && second && second.isConnected) second.focus();
  };
});
