/* panel/panel-6.js: The button, the panel, its tabs, tiles, views, help and messages, continued */
accessibles_core.define('panel/panel-6.js', [], function (core) {
  'use strict';
    // The site's own picture for the hover card: site-icon-url, else the site's favicon, else a plain website icon.
    // Loaded only the first time the card is shown, with a placeholder until it arrives.
  core.ui.card_icon = function () {
    if (this.card_icon_done) return;
    this.card_icon_done = true;
    var box = core.find_one('.lc-ico'), list = [];
    var safe = function (utterance) { try { var pos_x = new URL(utterance, location.href); return /^(https?:|data:image\/)/.test(pos_x.protocol + (pos_x.protocol === 'data:' ? pos_x.pathname.slice(0, 6) : '')) ? pos_x.href : ''; } catch (error) { return ''; } };
    if (core.config.site_icon) list.push(safe(core.config.site_icon));
    var link = document.querySelector('link[rel~="icon"][href],link[rel="shortcut icon"][href],link[rel="apple-touch-icon"][href]');
    if (link) list.push(safe(link.getAttribute('href')));
    if (/^https?:$/.test(location.protocol)) list.push(location.origin + '/favicon.ico');
    list = list.filter(function (item, index) { return item && list.indexOf(item) === index; });
    if (!list.length) return;
    box.classList.add('sk'); box.innerHTML = core.icon_svg('spinner', 'spin');
    var next = function () {
      var utterance = list.shift();
      if (!utterance) { box.classList.remove('sk', 'img'); box.innerHTML = core.icon_svg('web'); return; }
      var image = document.createElement('img');
      image.alt = ''; image.decoding = 'async'; image.referrerPolicy = 'no-referrer';
      var timer = core.run_later(function () { image.onload = image.onerror = null; next(); }, 6000);
      image.onload = function () {
        core.cancel_later(timer);
        if (!image.naturalWidth) { next(); return; }
        box.classList.remove('sk'); box.classList.add('img'); box.innerHTML = '';
        if (!core.config.icon_color) { box.appendChild(image); return; }
        // Paint the icon's shape in the chosen icon color, so it matches the button
        var label = document.createElement('span'), mask_url = 'url("' + utterance.replace(/"/g, '%22') + '") center / contain no-repeat';
        label.className = 'lc-mask';
        label.style.setProperty('-webkit-mask', mask_url);
        label.style.setProperty('mask', mask_url);
        box.appendChild(label);
      };
      image.onerror = function () { core.cancel_later(timer); next(); };   // 404 or any other error: try the next one
      image.src = utterance;
    };
    next();
  };
});
