/* image-descriptions/image-descriptions.js: Image descriptions: adds missing image descriptions */
accessibles_core.define('image-descriptions/image-descriptions.js', [], function (core) {
  'use strict';
  core.image_descriptions = {
    on: false, recorder: new core.change_recorder(), pending: 0,
    sync: function () { if (core.state.altText && !this.on) { this.on = true; this.fix(document.body); } else if (!core.state.altText && this.on) { this.on = false; this.recorder.revert(); } },
    describe: function (image) {
      var figure = image.closest('figure'), caption = figure && figure.querySelector('figcaption');
      if (caption && core.text_of(caption)) return core.text_of(caption).slice(0, 180);
      if (image.getAttribute('title')) return image.getAttribute('title').trim();
      var described_id = image.getAttribute('aria-describedby');
      if (described_id) { var element = document.getElementById(described_id.split(/\s+/)[0]); if (element && core.text_of(element)) return core.text_of(element).slice(0, 180); }
      for (var key in image.dataset) { if (/alt|caption|title|desc/i.test(key) && image.dataset[key]) return String(image.dataset[key]).slice(0, 180); }
      var src = image.currentSrc || image.getAttribute('src') || '';
      if (/^data:/i.test(src)) return '';
      var file = '';
      try { file = decodeURIComponent(new URL(src, location.href).pathname.split('/').pop() || ''); } catch (error) { file = ''; }
      file = file.replace(/\.[a-z0-9]{2,5}$/i, '').replace(/[@-]?\d+x\d+$|[-_]?(scaled|thumb|small|large|medium|copy|final|edited)$/gi, '');
      var letters = file.replace(/[^a-z]/gi, '');
      // Hash-like or numeric file names carry no meaning
      if (letters.length < 3 || /^[a-f0-9]{8,}$/i.test(file.replace(/[-_]/g, '')) || /^(img|image|dsc|pxl|photo|pic|screenshot)[-_ ]?\d/i.test(file)) return '';
      return core.humanize(file);
    },
    fix: function (root) {
      if (!this.on || !root || root.nodeType !== 1) return;
      var recorder = this.recorder, self = this;
      var imgs = Array.prototype.slice.call(root.querySelectorAll('img:not([alt]),input[type="image"]:not([alt]),[role="img"]:not([aria-label]):not([aria-labelledby])'));
      if (root.matches && root.matches('img:not([alt])')) imgs.unshift(root);
      imgs.forEach(function (image) {
        if (core.is_ours(image)) return;
        if (image.getAttribute('role') === 'img' && image.tagName !== 'IMG') {
          var title = image.getAttribute('title') || (image.querySelector('title') && image.querySelector('title').textContent);
          if (title) { recorder.set(image, 'aria-label', title.trim()); core.mark_fixed(recorder, image, 'alt'); }
          return;
        }
        var width = image.naturalWidth || image.width, heading = image.naturalHeight || image.height;
        var control = image.closest('a,button');
        if ((width && width <= 3 && heading && heading <= 3) || (control && core.text_of(control).length > 1) || /(spacer|pixel|tracking|blank)\./i.test(image.getAttribute('src') || '')) {
          recorder.set(image, 'alt', ''); core.mark_fixed(recorder, image, 'alt'); return;
        }
        var guess = self.describe(image);
        if (!guess && control) guess = core.guess_name(control);
        recorder.set(image, 'alt', guess || 'Image'); core.mark_fixed(recorder, image, 'alt');
        if (core.config.alt_text_provider) {
          self.pending++;
          Promise.resolve().then(function () { return core.config.alt_text_provider(image); }).then(function (text) {
            if (self.on && text && typeof text === 'string') image.setAttribute('alt', text.slice(0, 300));
          }).catch(function () { /* keep heuristic alt */ }).then(function () { self.pending--; });
        }
      });
    }
  };
  core.register('module', { folder: 'image-descriptions', order: 50, module: core.image_descriptions });
});
