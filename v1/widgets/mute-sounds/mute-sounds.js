/* mute-sounds/mute-sounds.js: Mute sounds: silences audio and video */
accessibles_core.define('mute-sounds/mute-sounds.js', [], function (core) {
  'use strict';
  core.mute_sounds = {
    on: false, prev: [], orig_play: null, orig_audio_context: null, orig_webkit_audio_context: null, ctxs: [],
    sync: function () { if (core.state.mute && !this.on) this.enable(); else if (!core.state.mute && this.on) this.disable(); },
    enable: function () {
      this.on = true;
      var self = this;
      this.fix(document.body);
      if (window.HTMLMediaElement && !this.orig_play) {
        this.orig_play = HTMLMediaElement.prototype.play;
        var orig = this.orig_play;
        HTMLMediaElement.prototype.play = function () {
          if (self.on && !this.muted) { self.prev.push([this, false]); this.muted = true; }
          return orig.apply(this, arguments);
        };
      }
      ['AudioContext', 'webkitAudioContext'].forEach(function (name) {
        var original_constructor = window[name];
        if (typeof original_constructor !== 'function' || original_constructor.__acc) return;
        var wrapped_constructor = function () {
          var list = new (Function.prototype.bind.apply(original_constructor, [null].concat(Array.prototype.slice.call(arguments))))();
          self.ctxs.push(list);
          if (self.on && list.suspend) list.suspend();
          return list;
        };
        wrapped_constructor.prototype = original_constructor.prototype;
        wrapped_constructor.__acc = original_constructor;
        try { window[name] = wrapped_constructor; } catch (error) { /* read-only */ }
      });
      this.ctxs.forEach(function (audio_context) { if (audio_context.suspend) audio_context.suspend(); });
    },
    fix: function (root) {
      if (!this.on || !root || root.nodeType !== 1) return;
      var self = this;
      Array.prototype.forEach.call(root.querySelectorAll('audio,video'), function (media) { if (!media.muted) { self.prev.push([media, false]); media.muted = true; } });
      Array.prototype.forEach.call(root.querySelectorAll('iframe'), function (frame) { core.post_to_player(frame, 'mute'); });
    },
    disable: function () {
      this.on = false;
      this.prev.forEach(function (muted_pair) { try { muted_pair[0].muted = muted_pair[1]; } catch (error) { /* ignore */ } });
      this.prev = [];
      if (this.orig_play) { HTMLMediaElement.prototype.play = this.orig_play; this.orig_play = null; }
      ['AudioContext', 'webkitAudioContext'].forEach(function (name) { if (window[name] && window[name].__acc) { try { window[name] = window[name].__acc; } catch (error) { /* ignore */ } } });
      this.ctxs.forEach(function (audio_context) { if (audio_context.resume && audio_context.state === 'suspended') audio_context.resume(); });
      Array.prototype.forEach.call(document.querySelectorAll('iframe'), function (frame) { core.post_to_player(frame, 'unmute'); });
    }
  };
  core.register('module', { folder: 'mute-sounds', order: 110, module: core.mute_sounds });
});
