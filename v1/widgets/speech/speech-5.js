/* speech/speech-5.js: Speaks text aloud for read aloud, voice commands and tips, continued */
accessibles_core.define('speech/speech-5.js', [], function (core) {
  'use strict';
  // Highlights the part being read
  core.speech.mark = function (element) {
    if (this.current_element) this.current_element.classList.remove('acc-reading');
    this.current_element = element && element.classList ? element : null;
    if (this.current_element) {
      this.current_element.classList.add('acc-reading');
      var rect = this.current_element.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > core.view_height()) { try { this.current_element.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (error) { this.current_element.scrollIntoView(); } }
    }
  };
  // Pauses or resumes reading
  core.speech.pause = function () { if (!this.active) return; if (this.paused) { window.speechSynthesis.resume(); this.paused = false; } else { window.speechSynthesis.pause(); this.paused = true; } core.ui.speech_state(); };
  // Stops reading aloud
  core.speech.stop = function () {
    var was = this.active;
    this.run_id++; this.active = false; this.paused = false; this.items = []; this.item_index = -1; this.current_lang = ''; this.tag = '';
    if (was && core.has('voice')) core.voice.heard_speech();
    try { window.speechSynthesis.cancel(); } catch (error) { /* ignore */ }
    this.mark(null);
    core.ui.speech_state();
  };
  // Reads the page from the top, or a given part of it
  core.speech.read_page = function (root) {
    var main = root || core.find_main();
    var selector = 'h1,h2,h3,h4,h5,h6,p,li,blockquote,dt,dd,figcaption,td,th,caption,pre';
    var all = Array.prototype.filter.call(main.querySelectorAll(selector), function (element) { return core.is_page_like(element) && core.is_visible(element) && core.text_of(element).length > 1; });
    var leaves = all.filter(function (item) { return !item.querySelector(selector); });
    if (!leaves.length && core.text_of(main)) leaves = [main];
    this.play(leaves.map(function (element) { return { text: core.text_of(element), element: element }; }));
  };
  // Handles a click
  core.speech.on_click = function (event) {
    var start_target = core.real_target(event);
    if (!core.is_page_like(start_target) || !event.isTrusted) return;
    var selector = String(core.get_selection() || '');
    if (selector && selector.trim().length > 1) return;
    var element = start_target.closest && start_target.closest('h1,h2,h3,h4,h5,h6,p,li,td,th,dt,dd,blockquote,figcaption,caption,label,button,a,summary,legend,span,div,img');
    if (!element || element === document.body || !core.is_page_like(element)) return;
    var text = element.tagName === 'IMG' ? (element.getAttribute('alt') || '') : (element.matches('a,button,summary') ? core.accessible_name(element) : core.text_of(element));
    if (element.tagName === 'DIV' && text.length > 600) return; // a wrapper, not a text block
    if (text) core.speech.say(text.slice(0, 5000), element);
  };
  // Handles an element getting keyboard focus
  core.speech.on_focus = function (event) {
    if (core.is_ours(event.target) || !core.state.keyboardNav) return;
    var name = core.accessible_name(event.target);
    if (name) core.speech.say(name.slice(0, 300), null);
  };
  // Handles text being selected
  core.speech.on_select = function (event) {
    if (!core.is_page_like(core.real_target(event))) return;
    core.run_later(function () {
      var text = String(core.get_selection() || '');
      if (text && text.trim().length > 2) core.speech.say(text.trim().slice(0, 5000), null);
    }, 30);
  };
});
