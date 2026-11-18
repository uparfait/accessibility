/* panel/panel-16.js: The button, the panel, its tabs, tiles, views, help and messages, continued */
accessibles_core.define('panel/panel-16.js', [], function (core) {
  'use strict';
  // The HTML for every tile of a tab
  core.ui.tab_html = function (id) {
    var self = this;
    var tiles = function (tab) { return '<div class="grid">' + core.features.filter(function (feature) { return feature.tab === tab; }).map(core.ui.tile_html).join('') + '</div>'; };
    if (id === 'profiles') {
      return '<div class="plist">' + core.profiles.map(function (profile) { return self.profile_html(profile); }).join('') + '</div>';
    }
    if (id === 'text') return tiles('text');
    if (id === 'color') {
      return tiles('color') +
        '<div class="sec">' + this.section_heading_html('Custom colors', 'customColors') + '<div class="card">' +
        this.color_row('textColor', 'Text', 'textColor', ['#111111', '#ffffff', '#0b3d91', '#7a1f1f', '#14532d']) +
        this.color_row('titleColor', 'Titles', 'titleColor', ['#000000', '#ffffff', '#0b57d0', '#b3261e', '#6b3fa0']) +
        this.color_row('bgColor', 'Background', 'bgColor', ['#ffffff', '#fdf6e3', '#eef3f7', '#121212', '#1b2733']) +
        '</div></div>' +
        '<div class="sec">' + this.section_heading_html('Display', 'display') + '<div class="card">' + this.slider_html('brightness', 'Brightness', 50, 150, 5) + '</div></div>';
    }
    if (id === 'nav') {
      return tiles('nav') + '<button type="button" class="linkrow" data-view="shortcuts">' + core.icon_svg('keyboard') + '<span>Keyboard and voice shortcuts</span>' + core.icon_svg('next') + '</button>';
    }
    if (id === 'reading') {
      return tiles('reading') +
        '<div class="sec">' + this.section_heading_html('Reading voice', 'readingVoice') + '<div class="card">' +
        '<div class="slide"><div class="top"><span>Language</span></div>' + this.select_html('ttslang') + '</div>' +
        '<div class="slide"><div class="top"><span>Voice</span></div>' + this.select_html('voice') + '</div>' +
        this.slider_html('ttsRate', 'Speed', 0.5, 2, 0.1) + this.slider_html('ttsPitch', 'Pitch', 0.5, 1.5, 0.1) +
        '</div><div class="btns"><button type="button" class="btn ghost" data-act="tts-test">' + core.icon_svg('speak', 'talk') + 'Test the reading voice</button></div></div>';
    }
    if (id === 'tools') return tiles('tools');
    return '';
  };
  // The HTML for one feature tile
  core.ui.tile_html = function (feature) {
    var pips = feature.type === 'cycle' ? '<span class="pips">' + feature.options.slice(1).map(function () { return '<i class="pip"></i>'; }).join('') + '</span>' : '';
    var mark = feature.type === 'view' ? '<span class="go">' + core.icon_svg('next') + '</span>' : (feature.type === 'action' ? '' : '<span class="ck">' + core.icon_svg('check') + '</span>');
    var aria = (feature.type === 'toggle' || feature.type === 'radio') ? ' aria-pressed="false"' : '';
    return '<div class="tile' + (feature.type === 'cycle' ? ' cycle' : '') + '" data-tile="' + feature.id + '"><button type="button" class="tm" data-f="' + feature.id + '"' + aria + '><span class="ti">' + core.icon_svg(feature.icon) + '</span><span class="tl">' + feature.label + '</span>' +
      ((feature.type === 'cycle' || feature.value) ? '<span class="tv"></span>' : '') + pips + mark + '</button>' +
      '<button type="button" class="hb" data-help="' + feature.id + '" aria-label="About ' + feature.label + '" data-tt="About this feature">' + core.icon_svg('help') + '</button></div>';
  };
  // The HTML for a section heading in a tab
  core.ui.section_heading_html = function (label, info) {
    return '<h3 class="sh"><button type="button" class="shb" data-help="i:' + info + '" aria-label="' + label + ', more information"><span class="tbl">' + label + '</span>' + core.icon_svg('help') + '</button></h3>';
  };
  // The HTML for a row of color swatches
  core.ui.color_row = function (key, label, icon, colors) {
    var switch_box = colors.map(function (color) { return '<button type="button" class="swb" data-c="' + key + '" data-v="' + color + '" data-bg="' + color + '" aria-label="' + label + ' ' + color + '"></button>'; }).join('');
    return '<div class="row"><span class="rl">' + core.icon_svg(icon) + label + '</span><span class="swatches">' + switch_box +
      '<button type="button" class="pick" data-cpick="' + key + '" data-pick="' + key + '" aria-label="More ' + label.toLowerCase() + ' colors" data-tt="More colors">' + core.icon_svg('plus') + '</button>' +
      '<button type="button" class="clr" data-c="' + key + '" data-v="" aria-label="Clear ' + label.toLowerCase() + ' color" data-tt="Clear">' + core.icon_svg('close') + '</button></span></div>';
  };
});
