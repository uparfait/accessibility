/* voice/voice-8.js: Voice, continued */
accessibles_core.define('voice/voice-8.js', [], function (core) {
  'use strict';
    // Listening indicator: quietly shows the words captured most recently
  core.ui.pill = function (text, interim, note) {
    var element = core.find_one('.pill');
    if (!core.state.voiceNav && !core.state.dictation) { element.hidden = true; this.heard = []; return; }
    this.heard = this.heard || [];
    if (text && !interim && this.heard[this.heard.length - 1] !== text) { this.heard.push(text); if (this.heard.length > 3) this.heard.shift(); }
    var past = this.heard.slice(0, interim || note ? this.heard.length : -1).slice(-2);
    var now = note || (interim ? text : this.heard[this.heard.length - 1]);
    core.find_one('.vr', element).textContent = past.join('  ·  ');
    core.find_one('.vn', element).textContent = now || core.translate_ui('Listening');
    core.find_one('.vn', element).classList.toggle('dim', !now || !!interim || !!note);
    // Talk & type shows which box the words go into
    var target_element = core.state.dictation && core.last_editable && core.last_editable.isConnected ? core.last_editable : null;
    core.find_one('.vt', element).textContent = core.state.dictation ? (target_element ? (core.accessible_name(target_element) || target_element.getAttribute('placeholder') || target_element.name || core.translate_ui('Text box')).slice(0, 40) : core.translate_ui('No text box')) : '';
    element.hidden = false;
  };
    // A question ("Did you mean …?") or, with pick, a choice between several matches
  core.ui.ask = function (label, pick) {
    var element = core.find_one('.ask');
    if (!element) return;
    if (!label) { element.hidden = true; return; }
    core.find_one('.aw', element).hidden = !!pick;
    core.find_one('b', element).textContent = pick ? label : '"' + label + '"?';
    core.find_one('.ap', element).textContent = pick && pick.many ? pick.pos : '';
    core.find_one('[data-act="ask-prev"]', element).hidden = core.find_one('[data-act="ask-next"]', element).hidden = !(pick && pick.many);
    core.find_one('[data-act="ask-all"]', element).hidden = !(pick && pick.all);
    core.find_one('[data-act="ask-no"]', element).textContent = pick ? 'Stop' : 'No';
    element.setAttribute('aria-label', pick ? 'Choose' : 'Did you mean');
    element.hidden = false;
    core.panel_translation.apply(element);
  };
  core.register('action', { folder: 'voice', names: ['voice-off'], run: function (target) {
    core.set_state('voiceNav', false); core.set_state('dictation', false);
  } });
  core.register('action', { folder: 'voice', names: ['voice-help'], run: function (target) {
    if (core.speech.active) core.speech.stop(); else core.ui.commands(core.state.dictation ? 'dict' : 'nav');
  } });
  core.register('action', { folder: 'voice', names: ['ask-yes'], run: function (target) {
    if (core.voice.pick) core.voice.end_pick(true); else core.voice.reply(true);
  } });
  core.register('action', { folder: 'voice', names: ['ask-no'], run: function (target) {
    if (core.voice.pick) core.voice.end_pick(false); else core.voice.reply(false);
  } });
  core.register('action', { folder: 'voice', names: ['ask-prev'], run: function (target) {
    core.voice.move_pick(-1);
  } });
  core.register('action', { folder: 'voice', names: ['ask-next'], run: function (target) {
    core.voice.move_pick(1);
  } });
  core.register('action', { folder: 'voice', names: ['ask-all'], run: function (target) {
    core.voice.end_pick(false, true);
  } });
});
