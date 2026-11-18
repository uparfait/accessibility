/* panel/panel-29.js: The button, the panel, its tabs, tiles, views, help and messages, continued */
accessibles_core.define('panel/panel-29.js', [], function (core) {
  'use strict';
  // Updates the read aloud bar to what is being read
  core.ui.speech_state = function () {
    var bar = core.find_one('.tts-bar');
    if (!bar) return;
    var play = core.find_one('[data-act="tts-page"]', bar);
    play.innerHTML = core.speech.active && !core.speech.paused ? core.icon_svg('pauseSm') : core.icon_svg('play');
    play.setAttribute('aria-label', core.speech.active ? (core.speech.paused ? 'Resume' : 'Pause') : 'Read the page');
    core.find_one('.bl', bar).textContent = core.speech.active ? (core.speech.paused ? 'Paused' : 'Reading…') : 'Select or click any text to hear it';
    core.root.classList.toggle('speaking', !!(core.speech.active && !core.speech.paused));
    // While something is read out, the listening bar offers stop instead of help
    var hush = core.find_one('.pill [data-act="voice-hush"]'), vhelp = core.find_one('.pill [data-act="voice-help"]');
    if (hush) { hush.hidden = !core.speech.active; vhelp.hidden = !!core.speech.active; }
    // Spoken commands and tips can always be stopped, even when the read aloud bar is off
    var hush_bar = core.find_one('.hush-bar');
    if (hush_bar) {
      hush_bar.hidden = !core.speech.active || !!core.state.tts;
      core.find_one('.bl', hush_bar).textContent = core.translate_ui(/^cmds:/.test(core.speech.tag) ? 'Reading the commands…' : 'Reading aloud…');
    }
    // The button that started a command list turns into a stop button until it ends
    var reading = core.speech.active ? core.speech.tag : '';
    core.find_all('[data-act="say-cmds"],[data-act="help-cmds"]').forEach(function (bar) {
      var is_on = reading === 'cmds:' + bar.getAttribute('data-cg');
      if (is_on === !!bar.__stop) return;
      if (is_on) {
        bar.__orig = bar.innerHTML; bar.__label = bar.getAttribute('aria-label'); bar.__tooltip = bar.getAttribute('data-tt');
        bar.innerHTML = core.icon_svg('stop') + (bar.classList.contains('btn') ? '<span class="bl">' + core.escape_html(core.translate_ui('Stop reading')) + '</span>' : '');
        bar.classList.add('stopping');
        bar.setAttribute('aria-label', core.translate_ui('Stop reading'));
        if (bar.__tooltip) bar.setAttribute('data-tt', 'Stop reading');
      } else {
        bar.innerHTML = bar.__orig;
        bar.classList.remove('stopping');
        if (bar.__label) bar.setAttribute('aria-label', bar.__label); else bar.removeAttribute('aria-label');
        if (bar.__tooltip) bar.setAttribute('data-tt', bar.__tooltip);
      }
      bar.__stop = is_on;
    });
  };
  core.register('click_attribute', { folder: 'panel', attribute: 'data-help', order: 20, run: function (target) {
    var help_id = target.getAttribute('data-help');
    if (help_id === 'i:panel') help_id = core.ui.view ? (core.view_help[core.ui.view] || 'i:panel') : (core.find_one('.search input').value.trim() ? 'i:panel' : 'i:tab-' + core.ui.tab);
    core.ui.help(help_id);
  } });
  core.register('click_attribute', { folder: 'panel', attribute: 'data-sel', order: 30, run: function (target) {
    core.ui.open_select(target);
  } });
  core.register('click_attribute', { folder: 'panel', attribute: 'data-ov', order: 40, run: function (target) {
    core.ui.pick_option(target);
  } });
  core.register('click_attribute', { folder: 'panel', attribute: 'data-cpick', order: 50, run: function (target) {
    core.ui.open_color(target);
  } });
  core.register('click_attribute', { folder: 'panel', attribute: 'data-cpv', order: 60, run: function (target) {
    core.ui.pick_color(target.getAttribute('data-cpv'));
  } });
});
