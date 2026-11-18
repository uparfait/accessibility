/* panel/panel-3.js: The button, the panel, its tabs, tiles, views, help and messages, continued */
accessibles_core.define('panel/panel-3.js', [], function (core) {
  'use strict';
    // Everything shown over the page: help, on-screen keyboard, reading bars, voice pill, popups and the button
  core.ui.overlays_html = function () {
    return '<div class="help" hidden role="dialog" aria-modal="true" aria-labelledby="acc-help-title" tabindex="-1"></div>' +
      '<div class="vkb" hidden role="group" aria-label="On-screen keyboard"><div class="vkb-head" data-tt="Drag to move"><span class="grip" aria-hidden="true">' + core.icon_svg('move') + '</span><span class="vkb-target">No field selected</span><button type="button" class="ib" data-act="vkb-close" aria-label="Close keyboard">' + core.icon_svg('close') + '</button></div><div class="vkb-keys"></div></div>' +
      '<div class="bar-bottom tts-bar" hidden role="toolbar" aria-label="Read aloud controls">' + core.icon_svg('speak', 'talk') + '<span class="bl">Select or click any text to hear it</span>' +
      '<button type="button" class="ib" data-act="tts-prev" aria-label="Previous paragraph" data-tt="Previous paragraph">' + core.icon_svg('back') + '</button>' +
      '<button type="button" class="ib pri" data-act="tts-page" aria-label="Read the page">' + core.icon_svg('play') + '</button>' +
      '<button type="button" class="ib" data-act="tts-next" aria-label="Next paragraph" data-tt="Next paragraph">' + core.icon_svg('next') + '</button>' +
      '<button type="button" class="ib" data-act="tts-pause" aria-label="Pause" hidden>' + core.icon_svg('pauseSm') + '</button>' +
      '<button type="button" class="ib" data-act="tts-stop" aria-label="Stop reading">' + core.icon_svg('stop') + '</button>' +
      '<button type="button" class="ib" data-act="tts-off" aria-label="Turn off read aloud">' + core.icon_svg('close') + '</button></div>' +
      '<div class="bar-bottom hush-bar" hidden role="status">' + core.icon_svg('speak', 'talk') + '<span class="bl">Reading aloud</span>' +
      '<button type="button" class="btn sm" data-act="voice-hush">' + core.icon_svg('stop') + '<span class="bl">Stop</span></button></div>' +
      '<div class="pill" hidden translate="no"><i class="live"></i><span class="vt"></span><span class="vr"></span><span class="vn"></span>' +
      '<button type="button" class="ib" data-act="voice-hush" aria-label="Stop reading" data-tt="Stop reading" hidden>' + core.icon_svg('stop') + '</button>' +
      '<button type="button" class="ib" data-act="voice-help" aria-label="What can I say" data-tt="What can I say">' + core.icon_svg('help') + '</button><button type="button" class="ib" data-act="voice-off" aria-label="Stop listening" data-tt="Stop listening">' + core.icon_svg('close') + '</button></div>' +
      '<div class="ask" hidden role="alertdialog" aria-live="assertive" aria-label="Did you mean"><span class="aq"><span class="aw">Did you mean</span> <b translate="no"></b> <span class="ap"></span></span><span class="ab"><button type="button" class="btn sm" data-act="ask-yes">Yes</button><button type="button" class="btn sm ghost" data-act="ask-prev" hidden>Previous</button><button type="button" class="btn sm ghost" data-act="ask-next" hidden>Next</button><button type="button" class="btn sm ghost" data-act="ask-all" hidden>All</button><button type="button" class="btn sm ghost" data-act="ask-no">No</button></span></div>' +
      '<div class="toast" hidden></div>' +
      '<div class="guide" hidden></div><div class="hl" hidden aria-hidden="true"></div><div class="lens" hidden aria-hidden="true"></div><div class="tip" hidden aria-hidden="true"></div><div class="nums" hidden aria-hidden="true"></div>' +
      '<div class="signp" hidden role="dialog" aria-label="Sign language video"></div>' +
      '<div class="dict" hidden role="dialog" aria-label="Definition"></div>' +
      '<div class="cs-pop" hidden role="dialog" aria-label="Choose an option"></div><div class="cp-pop" hidden role="dialog" aria-label="Choose a color"></div>' +
      '<button type="button" class="lcard tl" tabindex="-1" aria-hidden="true"><span class="lc-ico">' + core.icon_svg('web') + '</span><span class="lc-t"><span class="lc-n" translate="no"></span><span class="lc-s">Accessibility</span></span></button>' +
      '<button type="button" class="launch" aria-label="' + core.escape_html(core.config.site_name ? 'Accessibility options for ' + core.config.site_name : 'Accessibility options') + '" aria-expanded="false" aria-controls="acc-panel">' + core.icon_svg('logo') + '<span class="dot" hidden></span></button>' +
      '<div class="srl" role="status" aria-live="polite"></div>';
  };
    // The site's own icon in the panel header, when one is set
  core.ui.show_site_icon = function () {
    if (core.config.site_icon && !/^(javascript|vbscript):/i.test(core.config.site_icon)) {
      var brand_mark = core.find_one('.brandmark'), image = document.createElement('img');
      image.alt = ''; image.decoding = 'async';
      image.onload = function () {
        if (!image.naturalWidth) return;
        brand_mark.classList.add('img'); brand_mark.innerHTML = '';
        if (!core.config.icon_color) { brand_mark.appendChild(image); return; }
        // Same as the hover card: draw the icon's shape in one color
        var label = document.createElement('span'), mask_url = 'url("' + image.src.replace(/"/g, '%22') + '") center / contain no-repeat';
        label.className = 'bm-mask';
        label.style.setProperty('-webkit-mask', mask_url);
        label.style.setProperty('mask', mask_url);
        brand_mark.appendChild(label);
      };
      image.onerror = function () { brand_mark.classList.remove('img'); };
      image.src = core.config.site_icon;
    }
  };

    /* --- sizing: identical look at every width, clamped between 360px and 1200px layouts --- */
  core.ui.scale = function () {
    if (!core.root) return;
    var width = core.view_width();
    var value = width < 360 ? 13 * width / 360 : 13 + 2 * Math.min(1, (width - 360) / 840);
    if (core.state.oversized) value *= width >= 600 ? 1.2 : 1.08;
    core.root.style.fontSize = value.toFixed(3) + 'px';
    core.root.classList.toggle('still', !!core.state.stopAnimations);
  };
});
