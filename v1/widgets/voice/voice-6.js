/* voice/voice-6.js: Voice, continued */
accessibles_core.define('voice/voice-6.js', [], function (core) {
  'use strict';
  // Answers the "Did you mean" question with a button
  core.voice.reply = function (yes) {
    var part = this.pending;
    this.pending = null; core.ui.ask(null);
    if (!part) return;
    if (core.speech.active) core.speech.stop();
    if (yes) part.yes(); else if (part.no) part.no();
  };

    // Several matches: each one is highlighted in turn. Answer with yes, next, previous, a number, all or stop.
  core.voice.next_words = ['next', 'next one', 'skip', 'another', 'forward'];
  core.voice.previous_words = ['previous', 'previous one', 'back', 'go back', 'before'];
  core.voice.stop_words_list = ['stop', 'cancel', 'terminate', 'quit', 'exit', 'never mind', 'no', 'none'];
  core.voice.all_words = ['all', 'all of them', 'every one', 'everything', 'yes all'];
  core.voice.number_words = { one: 1, two: 2, to: 2, too: 2, three: 3, four: 4, for: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20 };
  // Reads a spoken or written number
  core.voice.number_of = function (width) { return /^\d+$/.test(width) ? parseInt(width, 10) : (this.number_words[width] || 0); };
  // Lets the visitor choose between several matches
  core.voice.choose = function (items, verb, run, all) {
    if (!items.length) return;
    this.end_pick(false);
    this.pending = null;
    this.pick = { items: items, index: 0, verb: verb, run: run, all: all || null, until: Date.now() + 60000 };
    items.forEach(function (item) { if (item.element && !core.is_ours(item.element)) item.element.classList.add('acc-pick'); });
    this.show_pick(true);
    var self = this;
    core.run_later(function () { if (self.pick && Date.now() > self.pick.until) self.end_pick(false); }, 60100);
  };
  // Highlights the current match and asks about it
  core.voice.show_pick = function (first) {
    var part = this.pick;
    if (!part) return;
    part.items.forEach(function (item) { if (item.element) item.element.classList.remove('acc-pick-on'); });
    var item = part.items[part.index];
    if (item.element) {
      item.element.classList.add('acc-pick-on');
      try { item.element.scrollIntoView({ block: 'center', behavior: 'auto' }); } catch (error) { item.element.scrollIntoView(); }
    }
    if (item.show) item.show();
    core.ui.ask(part.verb + ' ' + item.label, { pos: (part.index + 1) + ' / ' + part.items.length, many: part.items.length > 1, all: !!part.all && part.items.length > 1 });
    if (core.state.spokenTips && core.speech.ok) {
      core.speech.guide(first && part.items.length > 1
        ? part.items.length + ' found. ' + part.verb + ' ' + item.label + '? Say yes, next, previous, all or stop.'
        : part.verb + ' ' + item.label + '? Say yes or stop.');
    }
  };
  // Moves to the next or previous match
  core.voice.move_pick = function (step) {
    var part = this.pick;
    if (!part) return;
    part.index = (part.index + step + part.items.length) % part.items.length;
    part.until = Date.now() + 60000;
    this.show_pick();
  };
});
