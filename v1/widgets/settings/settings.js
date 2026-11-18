/* settings/settings.js: Default settings, saving them and loading them again */
accessibles_core.define('settings/settings.js', ['settings-2.js'], function (core) {
  'use strict';
  // Saves the settings, the button position and usage counts
  core.save_settings = function () {
    var data = { s: core.state, pos: core.drag_position, u: core.usage, v: core.version };
    if (!core.state.remember) data.s = { remember: false };
    core.store.write(data, core.state.remember);
    if (!core.state.remember) {
      try { window.sessionStorage.setItem(core.storage_key + '.session', JSON.stringify({ s: core.state })); } catch (error) { /* ignore */ }
    }
  };
  // Counts how often each feature is used, and reports it when analytics is set
  core.track_usage = function (feature, value) {
    if (value === false || value === '' || value === 0 || value === 1 && /scale|size/i.test(feature)) return;
    core.usage[feature] = (core.usage[feature] || 0) + 1;
    var payload = { event: 'accessibles_feature', feature: feature, value: value, page: location.pathname, ts: Date.now(), v: core.version };
    if (core.config.analytics && /^https?:/i.test(core.config.analytics)) {
      try {
        var body = JSON.stringify(payload);
        if (navigator.sendBeacon) navigator.sendBeacon(core.config.analytics, new Blob([body], { type: 'application/json' }));
        else fetch(core.config.analytics, { method: 'POST', body: body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(function () { });
      } catch (error) { /* ignore */ }
    }
  };
  core.defaults = {
    profiles: [],
    contentScale: 1, fontSize: 1, font: '', lineHeight: 0, letterSpacing: 0, wordSpacing: 0, fontWeight: 0, textAlign: '',
    textDir: '', highlightTitles: false, highlightLinks: false, magnifier: false, smartContrast: false, hoverHighlight: false, tooltips: false,
    contrast: '', invert: false, saturation: '', colorBlind: '', textColor: '', titleColor: '', bgColor: '', brightness: 100,
    keyboardNav: false, focusRing: false, cursor: '', vkeyboard: false, voiceNav: false, dictation: false, bigTargets: false, extendedTime: false,
    tts: false, ttsRate: 1, ttsPitch: 1, ttsVoice: '', ttsLang: '', readingGuide: false, readingMask: false, stopAnimations: false,
    hideImages: false, mute: false, dictionary: false, sign: '', translateTo: '', spokenTips: true,
    ariaFix: true, altText: true, formFix: true, oversized: true, remember: true, position: ''
  };
  // Settings that are about the page view, used for the "something is active" dot on the button
  core.visual_keys = Object.keys(core.defaults).filter(function (key) {
    return ['profiles', 'ariaFix', 'altText', 'formFix', 'remember', 'position', 'ttsRate', 'ttsPitch', 'ttsVoice', 'oversized', 'spokenTips'].indexOf(key) < 0;
  });
  core.storage_key = 'accessibles.v1';
});
