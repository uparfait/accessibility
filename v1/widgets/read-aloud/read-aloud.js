/* read-aloud/read-aloud.js: Read aloud: reads the page, a selection or what you click */
accessibles_core.define('read-aloud/read-aloud.js', [], function (core) {
  'use strict';
  core.register('module', { folder: 'read-aloud', order: 80, module: core.speech });
  core.register('action', { folder: 'read-aloud', names: ['tts-page'], run: function (target) {
    if (core.speech.active) core.speech.pause(); else core.speech.read_page();
  } });
  core.register('action', { folder: 'read-aloud', names: ['tts-pause'], run: function (target) {
    core.speech.pause();
  } });
  core.register('action', { folder: 'read-aloud', names: ['tts-stop'], run: function (target) {
    core.speech.stop();
  } });
  core.register('action', { folder: 'read-aloud', names: ['tts-off'], run: function (target) {
    core.set_state('tts', false);
  } });
  core.register('action', { folder: 'read-aloud', names: ['tts-prev'], run: function (target) {
    core.speech.skip(-1);
  } });
  core.register('action', { folder: 'read-aloud', names: ['tts-next'], run: function (target) {
    core.speech.skip(1);
  } });
});
