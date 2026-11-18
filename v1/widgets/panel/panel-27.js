/* panel/panel-27.js: The button, the panel, its tabs, tiles, views, help and messages, continued */
accessibles_core.define('panel/panel-27.js', [], function (core) {
  'use strict';
  // The HTML frame of the help window
  core.ui.help_shell = function (icon, kind, title, lang_picker) {
    var lower_value = this.selects.helplang.options().filter(function (option) { return option.v === (core.ui.help_lang || ''); })[0];
    return '<div class="help-win" role="document"><div class="help-head"><span class="help-ico">' + core.icon_svg(icon) + '</span>' +
      '<div class="help-ht"><div class="help-kind">' + core.escape_html(kind || '') + '</div><h2 id="acc-help-title" class="help-title" tabindex="-1" translate="no">' + core.escape_html(title) + '</h2></div>' +
      (lang_picker ? '<button type="button" class="cs-btn help-lang" data-sel="helplang" aria-haspopup="listbox" aria-expanded="false" aria-label="Description language: ' + core.escape_html(lower_value ? lower_value.l : 'English') + '">' + core.icon_svg('gtranslate') + '<span class="cv" translate="no">' + core.escape_html(lower_value ? lower_value.l : 'English') + '</span>' + core.icon_svg('chevron') + '</button>' : '') +
      '<button type="button" class="ib" data-act="help-close" aria-label="Close" data-tt="Close">' + core.icon_svg('close') + '</button></div><div class="help-main"></div></div>';
  };
  // Opens the help window with some content
  core.ui.open_shell = function (html) {
    var box = core.find_one('.help');
    this.close_select(); this.close_color();
    if (box.hidden) this.help_from = core.shadow.activeElement;
    box.innerHTML = html;
    box.hidden = false;
    core.find_one('.launch').classList.add('under');
    return box;
  };
  // Opens or closes the help window
  core.ui.help = function (id) {
    var box = core.find_one('.help');
    if (!id) {
      if (box.hidden) return;
      box.hidden = true; box.innerHTML = ''; this.help_id = null;
      if (core.speech.active && /^cmds:/.test(core.speech.tag)) core.speech.stop();
      core.find_one('.launch').classList.toggle('under', !!this.open);
      this.place_panel();
      if (this.help_from && this.help_from.isConnected) { try { this.help_from.focus({ preventScroll: true }); } catch (error) { /* ignore */ } }
      return;
    }
    var height = this.help_item(id), item = height.item;
    if (!item) return;
    this.help_id = id;
    if (this.help_lang === undefined) this.help_lang = core.panel_translation.lang || '';
    var kind = height.is_profile ? 'Profile' : (height.is_info || height.is_audit) ? item.kind : (core.tabs.filter(function (tab) { return tab.id === item.tab; })[0] || {}).label;
    var width = this.help_words(height);
    var command_group = !height.is_profile && !height.is_info && !height.is_audit ? { tts: 'read', voiceNav: 'nav', dictation: 'dict' }[height.key] : (height.is_info && height.key === 'shortcuts' ? 'nav' : '');
    this.open_shell(this.help_shell(item.icon, kind, item.label, true));
    core.find_one('.help-main', box).innerHTML =
      '<div class="wait help-wait" hidden translate="no">' + core.icon_svg('spinner', 'spin') + '<span></span></div>' +
      '<div class="help-text gd" translate="no">' + core.guide_html(this.help_source(height)) + '</div>' +
      (width.state ? '<div class="help-state' + (width.on ? ' on' : '') + '"><i class="d"></i><span>' + core.escape_html(width.state) + '</span></div>' : '') +
      (width.action || command_group ? '<div class="btns">' + (width.action ? '<button type="button" class="btn" data-act="help-toggle">' + core.escape_html(width.action) + '</button>' : '') +
        (command_group && core.speech.ok ? '<button type="button" class="btn ghost" data-act="help-cmds" data-cg="' + command_group + '">' + core.icon_svg('speak') + 'Hear the commands</button>' : '') + '</div>' : '');
    this.wrap_buttons(box);
    core.panel_translation.apply(box);
    this.help_translate();
    try { core.find_one('.help-title', box).focus({ preventScroll: true }); } catch (error) { /* ignore */ }
  };
  core.ui.help_cache = {};
  // The help text for an entry
  core.ui.help_source = function (help_item) { return (help_item.is_info || help_item.is_audit) ? help_item.item.desc : (core.descriptions[help_item.key] || help_item.item.desc || ''); };
});
