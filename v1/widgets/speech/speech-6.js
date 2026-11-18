/* speech/speech-6.js: Speaks text aloud for read aloud, voice commands and tips, continued */
accessibles_core.define('speech/speech-6.js', [], function (core) {
  'use strict';
  core.speech.on_click = core.speech.on_click.bind(core.speech);
  core.speech.on_focus = core.speech.on_focus.bind(core.speech);
  core.speech.on_select = core.speech.on_select.bind(core.speech);
  core.speech_recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
});
