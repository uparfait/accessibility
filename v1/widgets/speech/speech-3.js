/* speech/speech-3.js: Speaks text aloud for read aloud, voice commands and tips, continued */
accessibles_core.define('speech/speech-3.js', [], function (core) {
  'use strict';
    // Move through what is being read: d = 1 next, -1 previous, 0 repeat
  core.speech.skip = function (step) {
    if (!this.active || !this.items.length) return false;
    var target = this.item_index + step;
    if (target >= this.items.length) { this.stop(); return true; }
    this.item_index = core.clamp(target, 0, this.items.length - 1) - 1;
    this.run_id++; this.paused = false;
    try { window.speechSynthesis.cancel(); } catch (error) { /* ignore */ }
    this.next(this.run_id);
    core.ui.speech_state();
    return true;
  };
  // Changes the reading speed
  core.speech.speed = function (step) {
    core.set_state('ttsRate', Math.round(core.clamp(core.state.ttsRate + step, 0.5, 2) * 10) / 10);
    if (this.active) this.skip(0);
    else this.guide(step > 0 ? 'Faster' : 'Slower');
  };
  // Reads the selected text, or the page when nothing is selected
  core.speech.read_this = function () {
    var text = String(core.get_selection() || '').trim();
    if (text) { this.say(text.slice(0, 5000), null); return; }
    var first = document.activeElement;
    if (first && first !== document.body && !core.is_ours(first)) { var text_2 = core.text_of(first) || core.accessible_name(first); if (text_2) { this.say(text_2.slice(0, 5000), first); return; } }
    if (this.current_element) { this.say(core.text_of(this.current_element), this.current_element); return; }
    this.read_page();
  };
  // Reads every heading of the page
  core.speech.read_headings = function () {
    var head_score = Array.prototype.filter.call(document.querySelectorAll(core.headings), function (element) { return !core.is_ours(element) && core.is_visible(element) && core.text_of(element); });
    if (!head_score.length) { this.guide('This page has no headings'); return; }
    this.play(head_score.map(function (heading) { return { text: core.text_of(heading), element: heading }; }));
  };
});
