/* panel/panel-30.js: The button, the panel, its tabs, tiles, views, help and messages, continued */
accessibles_core.define('panel/panel-30.js', [], function (core) {
  'use strict';
  core.register('click_attribute', { folder: 'panel', attribute: 'data-tab', order: 70, run: function (target) {
    core.ui.render_tab(target.getAttribute('data-tab'));
  } });
  core.register('click_attribute', { folder: 'panel', attribute: 'data-view', order: 80, run: function (target) {
    core.ui.click_view(target);
  } });
  core.register('click_attribute', { folder: 'panel', attribute: 'data-p', order: 90, run: function (target) {
    core.ui.set_busy(target.parentNode); core.toggle_profile(target.getAttribute('data-p')); core.ui.speak_state(target);
  } });
  core.register('click_attribute', { folder: 'panel', attribute: 'data-f', order: 100, run: function (target) {
    core.ui.click_feature(target);
  } });
  core.register('click_attribute', { folder: 'panel', attribute: 'data-c', order: 110, run: function (target) {
    core.set_state(target.getAttribute('data-c'), target.getAttribute('data-v') || '');
  } });
  // What a click on a panel button with data-act does, by its name
  core.register('action', { folder: 'panel', names: ['close'], run: function (target) {
    core.ui.close();
  } });
  core.register('action', { folder: 'panel', names: ['reset'], run: function (target) {
    core.reset_all(); if (core.ui.view) core.ui.close_view();
  } });
  core.register('action', { folder: 'panel', names: ['back'], run: function (target) {
    core.ui.close_view();
  } });
  core.register('action', { folder: 'panel', names: ['help-close'], run: function (target) {
    core.ui.help(null);
  } });
  core.register('action', { folder: 'panel', names: ['help-toggle'], run: function (target) {
    core.ui.help_action();
  } });
  core.register('action', { folder: 'panel', names: ['tts-test'], run: function (target) {
    core.speech.say(core.translate_ui('This is how the reading voice sounds.'), null);
  } });
  core.register('action', { folder: 'panel', names: ['voice-hush'], run: function (target) {
    core.speech.stop();
  } });
  core.register('action', { folder: 'panel', names: ['say-cmds', 'help-cmds'], run: function (target) {
    core.ui.say_cmds(target.getAttribute('data-cg'));
  } });
  core.register('action', { folder: 'panel', names: ['clear-search'], run: function (target) {
    core.find_one('.search input').value = ''; core.ui.render_tab(core.ui.tab);
  } });
  core.register('action', { folder: 'panel', names: ['cp-apply'], run: function (target) {
    core.ui.apply_hex();
  } });
  core.register('action', { folder: 'panel', names: ['help-report'], run: function (target) {
    core.ui.help(null); if (!core.ui.open) core.ui.show(); core.ui.open_view('report');
  } });
  core.register('action', { folder: 'panel', names: ['sclear'], run: function (target) {
    var search_input = target.parentNode.querySelector('input');
    if (search_input) { search_input.value = ''; search_input.dispatchEvent(new Event('input', { bubbles: true })); try { search_input.focus({ preventScroll: true }); } catch (error) { search_input.focus(); } }
    target.hidden = true;
  } });
  // The feature a data-act button belongs to, by the first word of its name
  core.action_features = { tts: 'tts', voice: 'voiceNav', ask: 'voiceNav', vkb: 'vkeyboard', reader: 'reader', dict: 'dictionary', sign: 'sign', sum: 'summary', report: 'reportIssue', audit: 'audit', pos: 'position', statement: 'statementLink' };
});
