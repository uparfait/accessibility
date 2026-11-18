/* voice/voice-5.js: Voice, continued */
accessibles_core.define('voice/voice-5.js', [], function (core) {
  'use strict';
  // The command that best matches what was said
  core.voice.best = function (said, cmds) {
    var top = null, script = 0, self = this;
    cmds.forEach(function (command) { var text = self.score(said, command.say); if (text > script) { script = text; top = command; } });
    return { command: top, score: script };
  };

    // Everything said ends up here
  core.voice.heard = function (spoken_text, alts, mode) {
    var self = this;
    if (this.hearing_self(spoken_text)) return;
    if (this.pick && this.pick_answer(spoken_text)) return;
    if (this.pending && this.answer(spoken_text)) return;
    core.ui.pill(spoken_text);
    // The visitor is talking: a guide or tip being spoken stops, so it does not talk over them
    if (core.speech.active && core.speech.items.length && core.speech.items[0].raw) core.speech.stop();
    if (mode === 'nav') {
      // Try every alternative the browser heard and keep the best guess
      var top = null;
      alts.forEach(function (alternative) { var group = self.guess_nav(alternative); if (group && (!top || group.score > top.score)) top = group; });
      this.act(top, spoken_text);
    } else this.type(spoken_text, alts);
  };
  // Runs the best guess, or asks first when unsure
  core.voice.act = function (group, spoken_text) {
    if (group && group.score >= this.sure_score) { this.pending = null; core.ui.ask(null); group.run(); return; }
    if (group && group.score >= this.maybe_score) { this.confirm(group.label, group.run, null); return; }
    core.ui.pill(spoken_text, false, core.translate_ui('Not sure what you meant. Say "What can I say" to hear the commands.'));
  };
    // Ask "Did you mean …?" — answer by voice (yes / no) or with the buttons
  core.voice.confirm = function (label, yes, on_no) {
    var self = this;
    this.end_pick(false);
    this.pending = { label: label, yes: yes, no: on_no, until: Date.now() + 15000 };
    core.ui.ask(label);
    if (core.state.spokenTips && core.speech.ok) core.speech.guide('Did you mean: ' + label + '?');
    core.run_later(function () { if (self.pending && Date.now() > self.pending.until) { self.pending = null; core.ui.ask(null); } }, 15100);
  };
  // Answers the "Did you mean" question by voice
  core.voice.answer = function (spoken_text) {
    var part = this.pending;
    if (!part) return false;
    var pos_y = this.score(spoken_text, this.yes_words), node = this.score(spoken_text, this.no_words);
    if (pos_y < 0.8 && node < 0.8) { this.pending = null; core.ui.ask(null); return false; }
    this.pending = null; core.ui.ask(null);
    core.ui.pill(spoken_text);
    if (pos_y >= node) part.yes(); else if (part.no) part.no();
    return true;
  };
});
