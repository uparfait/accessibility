/* dark-mode/dark-mode-3.js: Dark mode, continued: a dark copy of the page's own stylesheets, hover colors included */
accessibles_core.define('dark-mode/dark-mode-3.js', [], function (core) {
  'use strict';
  // Which colors play which part: backgrounds end dark, text ends light, lines and borders in between
  core.dark_mode.roles = {
    'background-color': 'back', 'background-image': 'back', color: 'text', 'caret-color': 'text', 'text-decoration-color': 'text',
    'border-top-color': 'line', 'border-right-color': 'line', 'border-bottom-color': 'line', 'border-left-color': 'line', 'outline-color': 'line', 'column-rule-color': 'line'
  };
  // Builds one stylesheet with every color rule of the page in dark colors, and puts it after the page's own styles
  core.dark_mode.build_sheet = function () {
    var self = this, parts = [];
    Array.prototype.forEach.call(document.styleSheets, function (sheet) {
      if (self.sheet && sheet.ownerNode === self.sheet) return;
      var rules = null;
      try { rules = sheet.cssRules; } catch (error) { rules = null; }   // a stylesheet from another site cannot be read
      if (rules) parts.push(self.dark_rules(rules));
    });
    var base = 'html{background-color:#000!important;color:rgb(232,234,236)!important;color-scheme:dark}' +
      'input,textarea,select,button{background-color:rgb(20,22,24);color:rgb(232,234,236);border-color:rgb(70,74,78)}' +
      '::selection{background-color:rgb(38,79,120)!important;color:rgb(244,246,248)!important}';
    if (!this.sheet) { this.sheet = document.createElement('style'); this.sheet.setAttribute('data-accessibles-dark', ''); }
    this.sheet.textContent = base + parts.join('');
    (document.head || document.documentElement).appendChild(this.sheet);
  };
  // The dark version of a list of rules; rules inside @media and @supports keep their condition
  core.dark_mode.dark_rules = function (rules) {
    var self = this, out = '';
    Array.prototype.forEach.call(rules, function (rule) {
      // Groups of rules: @media, @supports and @container keep their condition; @layer groups are opened up
      if (!rule.selectorText && rule.cssRules) {
        var inner = self.dark_rules(rule.cssRules), kind = rule.media ? '@media ' : 'containerName' in rule ? '@container ' : '@supports ';
        if (inner) out += rule.conditionText !== undefined ? kind + rule.conditionText + '{' + inner + '}' : inner;
        return;
      }
      if (!rule.selectorText || !rule.style) return;
      var changes = '';
      for (var name in self.roles) {
        var value = rule.style.getPropertyValue(name);
        if (!value || (name === 'background-image' && !/gradient/.test(value))) continue;
        var role = self.roles[name] === 'back' && /::selection/.test(rule.selectorText) ? 'select' : self.roles[name];
        var dark = self.map_value(role, value);
        if (dark) changes += name + ':' + dark + '!important;';
      }
      ['fill', 'stroke'].forEach(function (name) {
        var value = rule.style.getPropertyValue(name), color = value && self.read_color(self.resolve_variables(value));
        if (color && self.to_hsl(color)[1] < 0.15) changes += name + ':' + self.map_color('text', color) + '!important;';
      });
      changes += self.dark_shorthands(rule.style, /::selection/.test(rule.selectorText));
      if (changes) out += rule.selectorText + '{' + changes + '}';
    });
    return out;
  };
});
