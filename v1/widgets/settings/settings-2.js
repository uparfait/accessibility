/* settings/settings-2.js: Default settings, saving them and loading them again, continued */
accessibles_core.define('settings/settings-2.js', [], function (core) {
  'use strict';
  core.store = {
    read: function () {
      var raw = null;
      try { raw = window.localStorage.getItem(core.storage_key); } catch (error) { /* blocked */ }
      if (!raw) { try { raw = window.sessionStorage.getItem(core.storage_key); } catch (error) { /* blocked */ } }
      if (!raw) {
        try { var match = document.cookie.match(/(?:^|;\s*)accessibles=([^;]*)/); if (match) raw = decodeURIComponent(match[1]); } catch (error) { /* blocked */ }
      }
      try { return raw ? JSON.parse(raw) : null; } catch (error) { return null; }
    },
    write: function (data, persistent) {
      var text = JSON.stringify(data);
      var primary = persistent ? 'localStorage' : 'sessionStorage';
      var other = persistent ? 'sessionStorage' : 'localStorage';
      try { window[other].removeItem(core.storage_key); } catch (error) { /* ignore */ }
      try { window[primary].setItem(core.storage_key, text); return; } catch (error) { /* fall through */ }
      try {
        document.cookie = 'accessibles=' + encodeURIComponent(text) + ';path=/;SameSite=Lax' + (persistent ? ';max-age=31536000' : '');
      } catch (error) { /* ignore */ }
    }
  };
  core.state = JSON.parse(JSON.stringify(core.defaults));
  core.drag_position = null;
  core.usage = {};
  (function load() {
    var detail = core.store.read();
    if (!detail) return;
    if (detail.s && typeof detail.s === 'object') {
      Object.keys(core.defaults).forEach(function (key) {
        if (detail.s[key] !== undefined && typeof detail.s[key] === typeof core.defaults[key]) core.state[key] = detail.s[key];
      });
    }
    if (detail.pos && isFinite(detail.pos.x) && isFinite(detail.pos.y)) core.drag_position = { x: core.clamp(detail.pos.x, 0, 1), y: core.clamp(detail.pos.y, 0, 1) };
    if (detail.u && typeof detail.u === 'object') core.usage = detail.u;
  })();
  // Voice input only comes back on a new page when the microphone is already allowed (checked at start-up)
  core.voice_was_on = core.state.voiceNav ? 'voiceNav' : core.state.dictation ? 'dictation' : '';
  core.state.voiceNav = false;
  core.state.dictation = false;
  if (!core.state.remember) {
    try { var session_data = JSON.parse(window.sessionStorage.getItem(core.storage_key + '.session') || 'null'); if (core.session_data && core.session_data.s) Object.keys(core.defaults).forEach(function (key) { if (core.session_data.s[key] !== undefined) core.state[key] = core.session_data.s[key]; }); } catch (error) { /* ignore */ }
    core.voice_was_on = core.state.voiceNav ? 'voiceNav' : core.state.dictation ? 'dictation' : core.voice_was_on;
    core.state.voiceNav = false; core.state.dictation = false;
  }
});
