/* voice-commands/voice-commands-6.js: Voice commands, continued */
accessibles_core.define('voice-commands/voice-commands-6.js', [], function (core) {
  'use strict';
    // "turn on dark contrast", "check remember me", "toggle notifications"
  core.voice.guess_toggle = function (name, head_score, mode) {
    var want = mode === 'on' ? true : mode === 'off' ? false : null;
    var verb = want === true ? 'Turn on ' : want === false ? 'Turn off ' : 'Toggle ';
    var value = Math.min(1, head_score + 0.1);
    var is_on = function (element) { return element.tagName === 'INPUT' ? !!element.checked : (element.getAttribute('aria-checked') || element.getAttribute('aria-pressed')) === 'true'; };
    var already = function (feature_name, is_on) { core.ui.pill('', false, feature_name + ' ' + core.translate_ui(is_on ? 'is already on' : 'is already off')); };
    var selector = 'input[type="checkbox"],input[type="radio"],[role="checkbox"],[role="switch"],[role="radio"],[aria-pressed],[aria-checked]';
    var list = core.find_all('.panel:not([hidden]) [aria-pressed]').concat(Array.prototype.filter.call(document.querySelectorAll(selector), function (element) {
      return !core.is_ours(element) && (core.is_visible(element) || (element.labels && element.labels[0] && core.is_visible(element.labels[0])));
    }));
    var best = null, script = 0;
    list.forEach(function (item) { var text = (core.accessible_name(item) || '').trim(); if (!text) return; var text_2 = core.word_match(name, text); if (text_2 > script) { script = text_2; best = item; } });
    // This menu's own features and profiles work by name, even with the menu closed
    var feat = null, font_size_px = 0;
    core.features.concat(core.profiles.map(function (profile) { return { id: profile.id, label: profile.label, profile: true }; })).forEach(function (feature) {
      if (!(feature.profile || feature.type === 'toggle' || feature.type === 'radio')) return;
      var value = Math.max(core.word_match(name, feature.label), core.word_match(name, core.translate_ui(feature.label)));
      if (value > font_size_px) { font_size_px = value; feat = feature; }
    });
    if (feat && font_size_px >= 0.75 && font_size_px >= script) {
      return { score: font_size_px * value, label: verb + feat.label, run: function () {
        var is_on = feat.profile ? core.state.profiles.indexOf(feat.id) > -1 : feat.type === 'toggle' ? !!core.state[feat.key] : core.state[feat.key] === feat.value;
        if ((want === null ? !is_on : want) === is_on) { already(core.translate_ui(feat.label), is_on); return; }
        if (feat.profile) core.toggle_profile(feat.id); else core.ui.feature(feat.id);
      } };
    }
    if (!best) return null;
    var element = best, label = (core.accessible_name(element) || '').trim().slice(0, 60);
    return { score: script * value, label: verb + label, run: function () {
      var is_on_2 = is_on(element);
      if ((want === null ? !is_on_2 : want) === is_on_2) { already(label, is_on_2); return; }
      if (core.is_ours(element)) { try { element.focus(); } catch (error) { /* ignore */ } } else core.focus_element(element);
      element.click();
    } };
  };
    // Presses Enter on the selected box or button, or sends its form
  core.voice.enter = function () {
    var first = document.activeElement, element = first && first !== document.body && !core.is_ours(first) ? first : core.last_editable;
    if (!element || !element.isConnected) { core.ui.pill('', false, core.translate_ui('Select a box or a button first')); return; }
    if (/^(BUTTON|A|SUMMARY)$/.test(element.tagName) || element.getAttribute('role') === 'button') { element.click(); return; }
    if (element.form && element.tagName !== 'TEXTAREA') { if (element.form.requestSubmit) element.form.requestSubmit(); else element.form.submit(); return; }
    core.press_enter(element);
  };
  // Empties the field being typed in
  core.voice.clear_field = function () {
    var element = core.last_editable;
    if (!element || !element.isConnected) { core.ui.pill('', false, core.translate_ui('Click into a text box first')); return; }
    if (element.isContentEditable) element.textContent = ''; else core.set_value(element, '');
  };
  // Everything that can be clicked by voice, the panel included
  core.voice.clickables = function (all) {
    // Includes the accessibility panel itself, so it can be used fully by voice
    var own = core.find_all('.panel:not([hidden]) button, .help:not([hidden]) button, .cs-pop:not([hidden]) .opt, .vkb:not([hidden]) button, .tts-bar:not([hidden]) button, .ask:not([hidden]) button').filter(function (button) { var session = button.getBoundingClientRect(); return session.width && session.height && session.bottom > 0 && session.top < core.view_height(); });
    return own.concat(Array.prototype.filter.call(document.querySelectorAll('a[href],button,[role="button"],[role="link"],[role="tab"],[role="menuitem"],input[type="submit"],input[type="button"],input[type="checkbox"],input[type="radio"],summary,select,[onclick],[data-acc-kb]'), function (element) { return !core.is_ours(element) && core.is_visible(element) && !element.closest('details:not([open]) > :not(summary)') && (all || core.in_viewport(element)); }));
  };
});
