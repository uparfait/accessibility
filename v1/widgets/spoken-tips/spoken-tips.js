/* spoken-tips/spoken-tips.js: Spoken tips: short spoken help when a feature turns on */
accessibles_core.define('spoken-tips/spoken-tips.js', [], function (core) {
  'use strict';
    // Short spoken instructions, in the visitor's language
  core.ui.say_tip = function (key) {
    if (!core.speech.ok) return;
    var element = core.last_editable && core.last_editable.isConnected ? core.last_editable : null;
    var tips = {
      tts: ['Read aloud is on.', 'Click any text to hear it, or press Alt and R to read the whole page.', 'Press Escape to stop.'],
      voiceNav: ['Voice commands are on.', 'Say a command, for example: scroll down, or: click, and the name of a link.', 'Say: what can I say, to hear every command.'],
      dictation: ['Talk and type is on.', element ? 'Speak, and your words are typed into ' + (core.accessible_name(element) || 'the text box') + '.' : 'Click into a text box, then speak.', 'Say: what can I say, to hear punctuation and editing commands.'],
      spokenTips: ['Spoken tips are on.']
    }[key];
    if (tips) core.run_later(function () { core.speech.guide(tips); }, 120);
  };
});
