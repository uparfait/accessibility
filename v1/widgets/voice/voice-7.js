/* voice/voice-7.js: Voice, continued */
accessibles_core.define('voice/voice-7.js', [], function (core) {
  'use strict';
  // Ends choosing: runs the chosen match (or all of them) or cancels
  core.voice.end_pick = function (run_next, every) {
    var part = this.pick;
    if (!part) return;
    this.pick = null;
    core.ui.ask(null);
    part.items.forEach(function (item) { if (item.element) item.element.classList.remove('acc-pick', 'acc-pick-on'); });
    if (core.speech.active && core.speech.items.length && core.speech.items[0].raw) core.speech.stop();
    if (every && part.all) part.all(part.items);
    else if (run_next) part.run(part.items[part.index]);
  };
  // Handles a spoken answer while choosing between matches
  core.voice.pick_answer = function (spoken_text) {
    var part = this.pick;
    if (!part) return false;
    var words = core.normalize_words(spoken_text), match = words.match(/^(?:number |choose |select |pick )?(\d+|[a-z]+)$/), node = match ? this.number_of(match[1]) : 0;
    if (node && part.items[node - 1]) { part.index = node - 1; core.ui.pill(spoken_text); this.end_pick(true); return true; }
    var self = this, best = '', script = 0;
    [['yes', this.yes_words], ['next', this.next_words], ['prev', this.previous_words], ['stop', this.stop_words_list], ['all', this.all_words]].forEach(function (answer_group) {
      var text = self.score(words, answer_group[1]);
      if (text > script) { script = text; best = answer_group[0]; }
    });
    // Anything else ends the choice and is handled as a new command
    if (script < 0.8) { this.end_pick(false); return false; }
    core.ui.pill(spoken_text);
    if (best === 'yes') this.end_pick(true);
    else if (best === 'next') this.move_pick(1);
    else if (best === 'prev') this.move_pick(-1);
    else if (best === 'all') { if (part.all) this.end_pick(false, true); else this.show_pick(); }
    else this.end_pick(false);
    return true;
  };
    // Stops whatever is going on: reading, numbers, a question or a choice
  core.voice.stop_all = function () {
    core.speech.stop();
    this.hide_numbers();
    this.end_pick(false);
    this.pending = null;
    core.ui.ask(null);
  };
  core.register('module', { folder: 'voice', order: 130, module: core.voice });
});
