/* panel/panel-26.js: The button, the panel, its tabs, tiles, views, help and messages, continued */
accessibles_core.define('panel/panel-26.js', [], function (core) {
  'use strict';
  // Removes the loading spinners of a task
  core.ui.done_busy = function (owner) {
    owner = owner || '';
    var list = this.busy_list.filter(function (element) { return element.acc_busy === owner; });
    if (!list.length) return;
    this.busy_list = this.busy_list.filter(function (element) { return element.acc_busy !== owner; });
    core.run_later(function () {
      list.forEach(function (item) { item.classList.remove('busy'); item.removeAttribute('aria-busy'); var element = item.querySelector('.bz'); if (element) element.remove(); });
    }, Math.max(0, 260 - (Date.now() - this.busy_at)));
  };

    /* --- help explainer: full screen, icon, description, translatable on its own --- */
  core.ui.help_item = function (id) {
    if (id.indexOf('i:') === 0) { var list = id.slice(2), info = core.heading_help[list]; return { is_info: true, key: list, item: info ? { id: list, label: info.title, icon: info.icon, kind: info.kind, desc: info.desc, type: 'info' } : null }; }
    if (id.indexOf('a:') === 0) {
      var cache_key = id.slice(2), list_2 = this.audit_res && this.audit_res.checks.filter(function (entry) { return entry.id === cache_key; })[0];
      return { is_audit: true, key: cache_key, check: list_2, item: list_2 ? { id: cache_key, label: list_2.label, icon: 'audit', kind: 'Page check', desc: core.check_help[cache_key] || list_2.help, type: 'info' } : null };
    }
    var is_p = id.indexOf('p:') === 0, key = id.replace(/^p:/, '');
    var item = is_p ? core.profiles.filter(function (profile) { return profile.id === key; })[0] : core.features_by_id[key];
    return { is_profile: is_p, key: key, item: item };
  };
  // True when a feature is on
  core.ui.feature_on = function (feature) {
    if (!feature) return false;
    if (feature.type === 'toggle') return !!core.state[feature.key];
    if (feature.type === 'radio') return core.state[feature.key] === feature.value;
    if (feature.type === 'cycle') return feature.options.indexOf(core.state[feature.key]) > 0;
    if (feature.id === 'translate') return !!core.state.translateTo;
    if (feature.id === 'sign') return !!core.state.sign;
    if (feature.value) return !!core.state[feature.key];
    return false;
  };
    // Plain sentences for the help window: what state the feature is in, and what the button will do
  core.ui.help_words = function (help_item) {
    var item = help_item.item, is_on = help_item.is_profile ? core.state.profiles.indexOf(help_item.key) > -1 : this.feature_on(item);
    var noun = help_item.is_profile ? 'profile' : 'feature';
    if (help_item.is_audit) {
      var node = help_item.check ? help_item.check.open.length : 0;
      return { on: !node, state: node ? node + (node === 1 ? ' problem found on this page' : ' problems found on this page') : 'No problems found', action: node ? 'Show them on the page' : '' };
    }
    if (help_item.is_info) return { state: '', action: '' };
    if (help_item.is_profile || item.type === 'toggle' || item.type === 'radio') return { on: is_on, state: 'This ' + noun + ' is ' + (is_on ? 'on' : 'off'), action: 'Turn this ' + noun + (is_on ? ' off' : ' on') };
    if (item.type === 'cycle') {
      var position = Math.max(0, item.options.indexOf(core.state[item.key])), next = item.options[(position + 1) % item.options.length];
      return { on: position > 0, state: position > 0 ? 'This feature is set to ' + item.format(core.state[item.key]) : 'This feature is off', action: (position + 1) % item.options.length === 0 ? 'Turn this feature off' : 'Change this feature to ' + item.format(next) };
    }
    if (item.id === 'translate') return { on: is_on, state: is_on ? 'This page is shown in ' + core.language_name(core.state.translateTo) : 'This page is shown in its original language', action: 'Choose a language' };
    if (item.id === 'sign') return { on: is_on, state: is_on ? 'Sign language is on' : 'Sign language is off', action: 'Choose sign language' };
    if (item.id === 'font') return { on: is_on, state: 'The font is ' + (core.has('fonts') ? core.font_name(core.state.font) : 'Original'), action: 'Choose a font' };
    if (item.type === 'view') return { state: '', action: 'Open this feature' };
    return { state: '', action: { reader: 'Open the reader view', resetAll: 'Reset all settings', statementLink: 'Read the accessibility statement' }[item.id] || 'Use this feature' };
  };
});
