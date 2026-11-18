/* voice-commands/voice-commands-3.js: Voice commands, continued */
accessibles_core.define('voice-commands/voice-commands-3.js', [], function (core) {
  'use strict';
  // A web address from spoken words ("wikipedia dot org")
  core.voice.site_from = function (rest) {
    var text = rest.replace(/\s+dot\s+/g, '.').replace(/\s+slash\s+/g, '/').trim();
    if (!/\./.test(text)) {
      var parts = text.split(' ');
      if (parts.length < 2 || parts.length > 4 || !this.top_level_domains.test(parts[parts.length - 1])) return '';
      text = parts.join('.');
    }
    text = text.replace(/\s+/g, '');
    return /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/.test(text) ? text : '';
  };
});
