/* stop-animations/stop-animations-2.js: Stop animations, continued */
accessibles_core.define('stop-animations/stop-animations-2.js', [], function (core) {
  'use strict';
  core.stop_animations = {
    on: false, videos: [], gifs: [], marquees: [], svgs: [], anims: [],
    sync: function () { if (core.state.stopAnimations && !this.on) { this.on = true; this.fix(document.body); core.run_later(this.pause_web_animations.bind(this), 60); } else if (!core.state.stopAnimations && this.on) { this.on = false; this.restore(); } },
    fix: function (root) {
      if (!this.on || !root || root.nodeType !== 1) return;
      var self = this;
      Array.prototype.forEach.call(root.querySelectorAll('video'), function (video) { if (!video.paused || video.autoplay) { try { video.pause(); } catch (error) { /* ignore */ } self.videos.push(video); } });
      Array.prototype.forEach.call(root.querySelectorAll('marquee'), function (media) { if (media.stop) { media.stop(); self.marquees.push(media); } });
      Array.prototype.forEach.call(root.querySelectorAll('svg'), function (svg) { if (svg.pauseAnimations && svg.querySelector('animate,animateTransform,animateMotion,set')) { svg.pauseAnimations(); self.svgs.push(svg); } });
      Array.prototype.forEach.call(root.querySelectorAll('img'), function (image) { self.freeze(image); });
      Array.prototype.forEach.call(root.querySelectorAll('iframe'), function (frame) { core.post_to_player(frame, 'pause'); });
    },
    freeze: function (image) {
      if (image.__acc_frozen || core.is_ours(image)) return;
      var src = image.currentSrc || image.src || '';
      if (!/\.gif($|[?#])/i.test(src) && !/^data:image\/gif/i.test(src)) return;
      var self = this;
      var run_next = function () {
        if (!self.on || image.__acc_frozen) return;
        try {
          var canvas = document.createElement('canvas');
          canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
          canvas.getContext('2d').drawImage(image, 0, 0);
          var url = canvas.toDataURL('image/png');
          self.gifs.push([image, image.getAttribute('src'), image.getAttribute('srcset')]);
          image.__acc_frozen = true;
          image.removeAttribute('srcset');
          image.setAttribute('src', url);
        } catch (error) { /* cross-origin GIF without CORS: cannot be frozen */ }
      };
      if (image.complete && image.naturalWidth) run_next(); else image.addEventListener('load', run_next, { once: true });
    },
    pause_web_animations: function () {
      if (!this.on || !document.getAnimations) return;
      var self = this;
      document.getAnimations().forEach(function (first) {
        var css = (typeof CSSAnimation !== 'undefined' && first instanceof CSSAnimation) || (typeof CSSTransition !== 'undefined' && first instanceof CSSTransition);
        if (!css && first.playState === 'running') { try { first.pause(); self.anims.push(first); } catch (error) { /* ignore */ } }
      });
    },
    restore: function () {
      this.videos.forEach(function (video) { if (video.autoplay) { var part = video.play(); if (part && part.catch) part.catch(function () { }); } }); this.videos = [];
      this.marquees.forEach(function (marquee) { if (marquee.start) marquee.start(); }); this.marquees = [];
      this.svgs.forEach(function (svg) { svg.unpauseAnimations(); }); this.svgs = [];
      this.anims.forEach(function (animation) { try { animation.play(); } catch (error) { /* ignore */ } }); this.anims = [];
      this.gifs.forEach(function (gif) {
        gif[0].__acc_frozen = false;
        if (gif[1] !== null) gif[0].setAttribute('src', gif[1]);
        if (gif[2] !== null) gif[0].setAttribute('srcset', gif[2]);
      });
      this.gifs = [];
    }
  };
  core.register('module', { folder: 'stop-animations', order: 100, module: core.stop_animations });
});
