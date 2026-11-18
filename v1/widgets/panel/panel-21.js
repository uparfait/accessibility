/* panel/panel-21.js: The button, the panel, its tabs, tiles, views, help and messages, continued */
accessibles_core.define('panel/panel-21.js', [], function (core) {
  'use strict';
  // Chooses a color in the color picker
  core.ui.pick_color = function (color) { var key = this.color_picker_key; this.close_color(true); core.set_state(key, color); };
  // Uses the color typed into the color picker
  core.ui.apply_hex = function () {
    var color = core.parse_color((core.find_one('.cp-hex') || {}).value || '');
    if (!color) { var element = core.find_one('.cp-hex'); if (element) { element.focus(); element.select(); } return; }
    this.pick_color(core.to_hex(color));
  };

    // Each clear button shows only while its search box has text
  core.ui.sync_clears = function () {
    core.find_all('.sclr').forEach(function (button) { var element = button.parentNode.querySelector('input'); button.hidden = !(element && element.value); });
  };
  // Finishes drawing a tab or view: clear buttons, button rows, translation
  core.ui.after_render = function () {
    var self = this;
    this.sync_clears();
    this.wrap_buttons();
    core.find_all('.body [data-bg]').forEach(function (button) { button.style.background = button.getAttribute('data-bg'); });
    core.find_all('.sl').forEach(function (slider) { self.paint_slider(slider); });
    this.refresh();
  };
  // Filters the features by a search text
  core.ui.search = function (query) {
    var self = this;
    this.sync_clears();
    query = query.trim().toLowerCase();
    if (!query) { this.render_tab(this.tab); return; }
    core.find_one('.tabs').hidden = true;
    var hits = core.features.filter(function (feature) { return (feature.label + ' ' + core.translate_ui(feature.label) + ' ' + (feature.keywords || '') + ' ' + feature.tab).toLowerCase().indexOf(query) > -1; });
    var profs = core.profiles.filter(function (profile) { return (profile.label + ' ' + core.translate_ui(profile.label) + ' ' + profile.desc + ' profile').toLowerCase().indexOf(query) > -1; });
    var html = '';
    if (profs.length) html += '<div class="plist">' + profs.map(function (profile) { return self.profile_html(profile); }).join('') + '</div>';
    if (hits.length) html += '<div class="grid' + (profs.length ? ' mt' : '') + '">' + hits.map(this.tile_html).join('') + '</div>';
    if (!html) html = '<p class="empty">No features match "' + core.escape_html(query) + '".</p><div class="btns center"><button type="button" class="btn ghost" data-act="clear-search">Clear the search</button></div>';
    core.find_one('.body').innerHTML = html;
    this.refresh();
  };
});
