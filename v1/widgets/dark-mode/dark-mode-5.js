/* dark-mode/dark-mode-5.js: Dark mode, continued: colors written as shorthands with variables, and colors that appear on hover */
accessibles_core.define('dark-mode/dark-mode-5.js', [], function (core) {
  'use strict';
  // "background: var(--surface)" or "border: 1px solid var(--line)": the browser keeps no separate color for these, so the color is found in the value
  core.dark_mode.dark_shorthands = function (style, selection) {
    var self = this, out = '';
    [['background', 'back'], ['border', 'line'], ['border-color', 'line'], ['border-top', 'line'], ['border-bottom', 'line'], ['outline', 'line']].forEach(function (pair) {
      var value = style.getPropertyValue(pair[0]);
      if (!value || !/var\(/.test(value)) return;
      value = self.resolve_variables(value);
      if (pair[0] === 'background' && /gradient/.test(value)) { out += 'background-image:' + self.map_value('back', value) + '!important;'; return; }
      var color = self.first_color(value);
      if (!color) return;
      var target = pair[0] === 'background' ? 'background-color' : pair[0] === 'outline' ? 'outline-color' : /-(top|bottom)$/.test(pair[0]) ? pair[0] + '-color' : 'border-color';
      out += target + ':' + self.map_color(selection && pair[0] === 'background' ? 'select' : pair[1], color) + '!important;';
    });
    return out;
  };
  // The first color in a value such as "1px solid #dce6e8"
  core.dark_mode.first_color = function (value) {
    var parts = value.match(/#[0-9a-f]{3,8}\b|(?:rgba?|hsla?)\([^)]*\)|\b[a-z]+\b/gi) || [];
    for (var index = 0; index < parts.length; index++) {
      if (/^(solid|dashed|dotted|double|none|auto|inset|outset|groove|ridge|thin|medium|thick|px|em|repeat|no|center|top|left|right|bottom|fixed|scroll)$/i.test(parts[index])) continue;
      var color = this.read_color(parts[index]);
      if (color) return color;
    }
    return null;
  };
  // Pointing at something or giving it focus: a moment later its colors are checked; anything still light gets a dark rule for that state only
  core.dark_mode.watch_states = function (on) {
    var self = this, change = on ? 'addEventListener' : 'removeEventListener';
    if (!this.on_state) this.on_state = function (event) {
      var element = event.target;
      [60, 400].forEach(function (wait) {
        core.run_later(function () {
          for (var node = element, depth = 0; node && node.nodeType === 1 && depth < 3; node = node.parentElement, depth++) self.check_state(node);
        }, wait);
      });
    };
    document[change]('pointerover', this.on_state, true);
    document[change]('focusin', this.on_state, true);
  };
  core.dark_mode.check_state = function (element) {
    if (!this.on || !this.sheet || core.is_ours(element) || /^(IMG|PICTURE|VIDEO|CANVAS|IFRAME|HTML|BODY)$/.test(element.tagName)) return;
    var colors = this.read(element).colors, css = '';
    for (var name in colors) if (colors[name]) css += name + ':' + colors[name] + '!important;';
    if (!css) return;
    var id = element.getAttribute('data-acc-dark-state');
    if (!id) { id = String(++this.state_count); this.recorder.set(element, 'data-acc-dark-state', id); }
    var selector = '[data-acc-dark-state="' + id + '"]';
    this.sheet.textContent += selector + ':hover,' + selector + ':focus,' + selector + ':focus-within,' + selector + ':active{' + css + '}';
  };
});
