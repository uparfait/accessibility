/* panel/panel-17.js: The button, the panel, its tabs, tiles, views, help and messages, continued */
accessibles_core.define('panel/panel-17.js', [], function (core) {
  'use strict';
    /* --- custom slider (no native range input) --- */
  core.ui.slider_html = function (key, label, min, max, step) {
    return '<div class="slide"><div class="top"><span id="acc-sl-' + key + '">' + label + '</span><span class="val"></span></div>' +
      '<div class="sl" role="slider" tabindex="0" data-s="' + key + '" data-min="' + min + '" data-max="' + max + '" data-step="' + step + '" aria-labelledby="acc-sl-' + key + '" aria-valuemin="' + min + '" aria-valuemax="' + max + '"><div class="tr"><div class="fi"></div></div><div class="th"></div></div></div>';
  };
  // A slider value as text (percent or ×)
  core.ui.format_slider = function (key, value) { return key === 'brightness' ? Math.round(value) + '%' : (Math.round(value * 10) / 10).toFixed(1) + '×'; };
  // Draws a slider at its current value
  core.ui.paint_slider = function (slider) {
    var attribute = slider.getAttribute('data-s'), min = +slider.getAttribute('data-min'), max = +slider.getAttribute('data-max'), value = core.state[attribute];
    var value_2 = core.clamp((value - min) / (max - min), 0, 1);
    core.find_one('.fi', slider).style.width = (value_2 * 100) + '%';
    core.find_one('.th', slider).style.left = 'calc(.6em + (100% - 1.2em) * ' + value_2.toFixed(4) + ')';
    slider.setAttribute('aria-valuenow', value);
    slider.setAttribute('aria-valuetext', this.format_slider(attribute, value));
    var out = slider.parentNode.querySelector('.val'); if (out) out.textContent = this.format_slider(attribute, value);
  };
  // Sets a slider's setting
  core.ui.set_slider = function (slider, value, silent) {
    var min = +slider.getAttribute('data-min'), max = +slider.getAttribute('data-max'), step = +slider.getAttribute('data-step');
    value = core.clamp(Math.round((value - min) / step) * step + min, min, max);
    value = Math.round(value * 1000) / 1000;
    core.set_state(slider.getAttribute('data-s'), value, silent);
    this.paint_slider(slider);
  };
  // Sets a slider from where the pointer is on it
  core.ui.slider_from_pointer = function (slider, pointer_x, silent) {
    var track_rect = core.find_one('.tr', slider).getBoundingClientRect();
    var min = +slider.getAttribute('data-min'), max = +slider.getAttribute('data-max');
    this.set_slider(slider, min + core.clamp((pointer_x - track_rect.left) / track_rect.width, 0, 1) * (max - min), silent);
  };
  // Moves a slider with the arrow and page keys
  core.ui.slider_key = function (slider, event) {
    var attribute = slider.getAttribute('data-s'), step = +slider.getAttribute('data-step'), value = core.state[attribute];
    var map = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step, PageUp: step * 5, PageDown: -step * 5 };
    if (event.key === 'Home') value = +slider.getAttribute('data-min'); else if (event.key === 'End') value = +slider.getAttribute('data-max'); else if (map[event.key] !== undefined) value += map[event.key]; else return;
    event.preventDefault();
    this.set_slider(slider, value);
  };
});
