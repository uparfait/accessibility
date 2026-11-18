/* translation/translation-2.js: Translates the panel into the visitor's language, continued */
accessibles_core.define('translation/translation-2.js', [], function (core) {
  'use strict';
  core.panel_translation.pending = {};
  core.panel_translation.busy = false;
  core.panel_translation.nodes = new WeakMap();
  core.panel_translation.attrs = new WeakMap();
  core.panel_translation.failed = false;
  core.panel_translation.timer = 0;
  // Loads saved translations
  core.panel_translation.load = function () { try { this.cache = JSON.parse(window.sessionStorage.getItem(core.storage_key + '.i18n') || '{}') || {}; } catch (error) { this.cache = {}; } };
  // Saves the translations for the next visit
  core.panel_translation.persist = function () { try { window.sessionStorage.setItem(core.storage_key + '.i18n', JSON.stringify(this.cache)); } catch (error) { /* full or blocked */ } };
  // Switches the panel to a language
  core.panel_translation.set = function (lang) {
    this.lang = lang && !/^en(-|$)/i.test(lang) ? lang : '';
    this.failed = false;
    if (core.root) core.root.setAttribute('dir', lang && core.rtl_languages.test(lang) ? 'rtl' : (document.documentElement.getAttribute('dir') === 'rtl' && !(core.has('text-direction') && core.text_direction.current) ? 'rtl' : 'ltr'));
    if (core.root) this.apply(core.root);
  };
  // The translation of one text, or the text itself until it arrives
  core.panel_translation.translated = function (text) {
    if (!this.lang || !text || !core.has_letters(text)) return text;
    var item = this.cache[this.lang] || (this.cache[this.lang] = {});
    if (item[text] != null) return item[text];
    this.queue(text);
    return text;
  };
  // Adds a text to the next translation batch
  core.panel_translation.queue = function (text) {
    if (this.failed && Date.now() - this.failed < 20000) return;
    this.pending[text] = 1;
    var self = this;
    core.cancel_later(this.timer);
    this.timer = core.run_later(function () { self.flush(); }, 60);
  };
});
