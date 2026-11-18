/* panel/panel-14.js: The button, the panel, its tabs, tiles, views, help and messages, continued */
accessibles_core.define('panel/panel-14.js', [], function (core) {
  'use strict';
    // Announce a toggled feature aloud when read aloud is on (so the panel itself is usable by ear)
  core.ui.speak_state = function (button) {
    if (!core.state.tts || !core.speech.ok) return;
    core.run_later(function () {
      var is_on = button.getAttribute('aria-pressed') === 'true' || (button.parentNode && button.parentNode.classList.contains('on'));
      var name = (button.querySelector('.tl,.pn') || button).textContent.trim();
      var value_label = button.querySelector('.tv');
      core.speech.say(name + ', ' + (value_label && value_label.textContent ? value_label.textContent : core.translate_ui(is_on ? 'on' : 'off')), null);
    }, 60);
  };
  // Turns a feature on, off or to its next value
  core.ui.feature = function (id, is_profile) {
    if (is_profile) { core.toggle_profile(id); return; }
    var item = core.features_by_id[id];
    if (!item) return;
    if (item.type === 'toggle') {
      core.set_state(item.key, !core.state[item.key]); core.announce(core.translate_ui(item.label) + ' ' + core.translate_ui(core.state[item.key] ? 'on' : 'off'));
      if (core.state[item.key] && core.state.spokenTips && core.has('spoken-tips')) this.say_tip(item.key);
    }
    else if (item.type === 'radio') { var is_on = core.state[item.key] !== item.value; core.set_state(item.key, is_on ? item.value : ''); core.announce(core.translate_ui(item.label) + ' ' + core.translate_ui(is_on ? 'on' : 'off')); }
    else if (item.type === 'cycle') {
      var position = item.options.indexOf(core.state[item.key]);
      var new_value = item.options[(position + 1) % item.options.length];
      core.set_state(item.key, new_value);
      core.announce(core.translate_ui(item.label) + ', ' + core.translate_ui(item.format(new_value)));
    }
    else if (item.type === 'view') { this.help(null); this.open_view(item.view); }
    else if (item.type === 'action') {
      if (id === 'reader' && core.has('reader-view')) this.reader(true);
      else if (id === 'resetAll') core.reset_all();
      else if (id === 'statementLink' && core.has('accessibility-statement')) this.statement();
    }
  };
    // Reads a list of commands out loud and shows it
  core.ui.commands = function (group) {
    this.show();
    this.open_view('shortcuts');
    var section = core.find_one('[data-g="' + group + '"]');
    if (section) try { section.scrollIntoView({ block: 'start' }); } catch (error) { /* ignore */ }
    core.speech.guide(core.command_speech(group), 'cmds:' + group);
  };
    // Reads a list of commands, or stops it when that list is already being read
  core.ui.say_cmds = function (group) {
    if (core.speech.active && core.speech.tag === 'cmds:' + group) { core.speech.stop(); return; }
    core.speech.guide(core.command_speech(group), 'cmds:' + group);
  };
});
