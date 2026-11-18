/* changes/changes-2.js: Changes a setting and brings the page in line with all settings, continued */
accessibles_core.define('changes/changes-2.js', [], function (core) {
  'use strict';
  // Turns a profile on or off
  core.toggle_profile = function (id) {
    var list = core.profiles.filter(function (profile) { return profile.id === id; })[0];
    if (!list) return;
    var active = core.state.profiles.slice();
    var position = active.indexOf(id);
    if (position > -1) {
      active.splice(position, 1);
      Object.keys(list.set).forEach(function (key) { core.state[key] = core.defaults[key]; });
      // Re-apply what other active profiles still want
      core.profiles.forEach(function (other_profile) { if (active.indexOf(other_profile.id) > -1) Object.keys(other_profile.set).forEach(function (key) { core.state[key] = other_profile.set[key]; }); });
      core.announce(list.label + ' profile off');
    } else {
      active.push(id);
      Object.keys(list.set).forEach(function (key) { core.state[key] = list.set[key]; });
      core.announce(list.label + ' profile on');
      core.track_usage('profile:' + id, true);
    }
    core.state.profiles = active;
    core.emit_change('profiles', active);
    core.schedule_apply();
  };
  // Puts every setting back to its default
  core.reset_all = function () {
    core.speech.stop();
    if (core.has('voice')) core.voice.stop();
    if (core.has('translate') && (core.state.translateTo || core.page_translation.engine)) { core.page_translation.target = ''; core.page_translation.restore(); core.panel_translation.set(''); }
    core.state = JSON.parse(JSON.stringify(core.defaults));
    core.drag_position = null;
    core.ui.panel_pos = null; core.ui.keyboard_position = null; core.ui.help_lang = undefined; core.ui.report_type = undefined; core.ui.reader_font_size = undefined; core.ui.reader_theme_name = undefined; core.ui.structure_mode = 'headings';
    var keyboard_box = core.find_one('.vkb'); if (keyboard_box) { keyboard_box.classList.remove('moved'); keyboard_box.style.left = keyboard_box.style.top = keyboard_box.style.bottom = ''; }
    core.ui.scale();
    core.ui.place_launcher();
    core.apply_all();
    if (core.ui.open) { var element = core.find_one('.search input'); if (element) element.value = ''; core.ui.view = null; core.ui.render_tab(core.ui.tab); core.ui.place_panel(); }
    core.announce('All settings reset');
    core.emit_change('reset', true);
  };
  // Brings the whole page in line with every setting
  core.apply_all = function () {
    var css = core.build_page_css();
    if (css !== core.last_page_css) { core.set_page_css(css); core.last_page_css = css; }
    var waits = [];
    // Every loaded feature brings its part of the page in line with the settings
    core.registered('module').forEach(function (entry) {
      if (!core.has(entry.folder)) return;
      try {
        var result = entry.module.sync();
        if (result && typeof result.then === 'function') waits.push(result);
      } catch (error) { if (window.console) console.warn('[Accessibles]', error); }
    });
    core.ui.refresh();
    core.ui.place_launcher();
    core.save_settings();
    Promise.all(waits).then(function () { core.ui.done_busy(); }, function () { core.ui.done_busy(); });
  };
});
