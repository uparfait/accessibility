/* panel/panel-19.js: The button, the panel, its tabs, tiles, views, help and messages, continued */
accessibles_core.define('panel/panel-19.js', [], function (core) {
  'use strict';
  // The HTML for a drop-down list button
  core.ui.select_html = function (id) {
    var detail = this.selects[id], value = detail.value(), current = detail.options().filter(function (option) { return option.v === value; })[0];
    var label = current ? current.l : '';
    return '<button type="button" class="cs-btn" data-sel="' + id + '" aria-haspopup="listbox" aria-expanded="false" aria-label="' + core.escape_html(detail.title) + ': ' + core.escape_html(label) + '"><span class="cv">' + core.escape_html(label) + '</span>' + core.icon_svg('chevron') + '</button>';
  };
  // The HTML for the options of a list, filtered by a search text
  core.ui.options_html = function (opts, value, query) {
    query = String(query || '').trim().toLowerCase();
    var list = query ? opts.filter(function (option) { return (option.l + ' ' + (option.s || '') + ' ' + (option.k || '')).toLowerCase().indexOf(query) > -1; }) : opts;
    if (!list.length) return '<p class="empty">No matches</p>';
    return list.map(function (option) {
      return '<button type="button" class="opt" role="option" data-ov="' + core.escape_html(option.v) + '" aria-selected="' + (option.v === value) + '"' + (option.font ? ' data-font="' + core.escape_html(option.font) + '"' : '') + '>' + core.icon_svg('check', 'oc') +
        '<span class="ol"' + (option.native ? ' translate="no"' : '') + '>' + core.escape_html(option.l) + '</span>' + (option.s ? '<span class="os">' + core.escape_html(option.s) + '</span>' : '') + '</button>';
    }).join('');
  };
  // Shows each font option in its own font and scrolls to the selected option
  core.ui.after_list = function (box) {
    core.find_all('.opt[data-font]', box).forEach(function (option) { core.find_one('.ol', option).style.fontFamily = option.getAttribute('data-font'); });
    var selector = core.find_one('.opt[aria-selected="true"]', box) || core.find_one('.opt', box);
    if (selector) selector.classList.add('act');
    core.panel_translation.apply(box);
  };
  // Opens a drop-down list
  core.ui.open_select = function (button) {
    if (this.select_open === button) { this.close_select(true); return; }
    this.close_select(); this.close_color();
    var id = button.getAttribute('data-sel'), detail = this.selects[id], popup = core.find_one('.cs-pop');
    this.select_open = button;
    button.setAttribute('aria-expanded', 'true');
    popup.setAttribute('aria-label', detail.title);
    popup.innerHTML = '<div class="q">' + core.icon_svg('search') + '<input type="text" placeholder="Search" aria-label="Search ' + core.escape_html(detail.title.toLowerCase()) + '" autocomplete="off" spellcheck="false">' + core.clear_button_html() + '</div><div class="opts" role="listbox" aria-label="' + core.escape_html(detail.title) + '">' + this.options_html(detail.options(), detail.value()) + '</div>';
    popup.hidden = false;
    var rect = button.getBoundingClientRect(), white = core.view_width(), view_h = core.view_height(), font_size_px = parseFloat(core.root.style.fontSize) || 15;
    var value = Math.min(Math.max(rect.width, 16 * font_size_px), white - 16);
    popup.style.width = value + 'px';
    var below = view_h - rect.bottom - 12, above = rect.top - 12;
    var room = Math.max(below, above);
    core.find_one('.opts', popup).style.maxHeight = Math.max(6 * font_size_px, Math.min(17 * font_size_px, room - 3.6 * font_size_px)) + 'px';
    var height = popup.offsetHeight;
    var pos_y = (below >= height || below >= above) ? rect.bottom + 4 : rect.top - 4 - height;
    popup.style.left = Math.round(core.clamp(rect.left, 8, white - value - 8)) + 'px';
    popup.style.top = Math.round(core.clamp(pos_y, 8, Math.max(8, view_h - height - 8))) + 'px';
    this.after_list(popup);
    var action = core.find_one('.opt.act', popup); if (action) action.scrollIntoView({ block: 'nearest' });
    core.panel_translation.apply(popup);
    core.find_one('.q input', popup).focus();
  };
  // Closes the open drop-down list
  core.ui.close_select = function (refocus) {
    var popup = core.find_one('.cs-pop');
    if (!popup || popup.hidden) return;
    popup.hidden = true; popup.innerHTML = '';
    var second = this.select_open; this.select_open = null;
    if (second) { second.setAttribute('aria-expanded', 'false'); if (refocus && second.isConnected) second.focus(); }
  };
});
