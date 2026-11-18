/* panel/panel-28.js: The button, the panel, its tabs, tiles, views, help and messages, continued */
accessibles_core.define('panel/panel-28.js', [], function (core) {
  'use strict';
  // Translates the open help text into the chosen language
  core.ui.help_translate = function () {
    var box = core.find_one('.help'), id = this.help_id;
    if (!id || box.hidden || id === 'doc') return;
    var height = this.help_item(id), item = height.item, lang = this.help_lang || '';
    var src = [item.label].concat(core.guide_words(this.help_source(height)));
    var title = core.find_one('.help-title', box), wait = core.find_one('.help-wait', box);
    var put = function (list_value) {
      title.textContent = list_value[0] || src[0];
      core.find_all('.gd [data-l]', box).forEach(function (element) { var attribute = +element.getAttribute('data-l') + 1; if (list_value[attribute]) element.textContent = list_value[attribute]; });
    };
    if (!lang || /^en(-|$)/.test(lang)) { put(src); wait.hidden = true; box.setAttribute('lang', 'en'); box.setAttribute('dir', 'ltr'); this.done_busy('help'); return; }
    var direction = core.rtl_languages.test(lang) ? 'rtl' : 'ltr';
    var cache_key = lang + '|' + id + '|' + src.length;
    if (this.help_cache[cache_key]) { put(this.help_cache[cache_key]); wait.hidden = true; box.setAttribute('lang', lang); box.setAttribute('dir', direction); this.done_busy('help'); return; }
    wait.hidden = false;
    core.find_one('span', wait).textContent = core.translate_ui('Waiting…');
    var self = this, todo = src.filter(Boolean);
    var help_language_button = core.find_one('.help-lang', box); if (help_language_button) this.set_busy(help_language_button, 'help');
    core.google_translate_text(todo, lang, function (fraction) { core.find_one('span', wait).textContent = core.translate_ui('Waiting…') + ' ' + Math.round(fraction * 100) + '%'; self.progress(fraction, 'help'); }).then(function (out) {
      var count = 0, full = src.map(function (text) { return text ? (out[count++] || text) : ''; });
      self.help_cache[cache_key] = full;
      if (self.help_id !== id || self.help_lang !== lang) return;
      put(full);
      box.setAttribute('lang', lang); box.setAttribute('dir', direction);
      wait.hidden = true;
      self.done_busy('help');
    }).catch(function () {
      self.done_busy('help');
      if (self.help_id !== id) return;
      wait.hidden = true;
      core.toast(core.translate_ui('Translation is not available right now'));
    });
  };
  // Runs the button at the bottom of the help window
  core.ui.help_action = function () {
    var height = this.help_item(this.help_id), item = height.item;
    if (height.is_audit && core.has('page-check')) { this.help(null); this.mark_check(height.key); return; }
    if (height.is_profile) { core.toggle_profile(height.key); this.help(this.help_id); return; }
    if (item.id === 'statementLink' && core.has('accessibility-statement')) { this.statement(); return; }
    if (item.type === 'view' || item.type === 'action') { this.help(null); if (!this.open) this.show(); this.feature(height.key); return; }
    this.feature(height.key);
    var self = this, id = this.help_id;
    core.run_later(function () { if (self.help_id === id) self.help(id); }, 30);
  };

    /* --- floating parts --- */
  core.ui.speech_bar = function (is_on) { core.find_one('.tts-bar').hidden = !is_on; this.speech_state(); };
});
