/* illustrations/illustrations.js: Small pictures and steps shown in the help window */
accessibles_core.define('illustrations/illustrations.js', ['illustrations-2.js'], function (core) {
  'use strict';
  // The non-empty lines of a help text
  core.guide_lines = function (text) { return String(text || '').split('\n').map(function (item) { return item.trim(); }).filter(Boolean); };
  // Turns a short help text (headings, lists, paragraphs) into HTML
  core.guide_html = function (text) {
    var out = '', list = null;
    var close = function () { if (list) { out += '</' + list + '>'; list = null; } };
    core.guide_lines(text).forEach(function (item, index) {
      var match;
      if (item.charAt(0) === '@') { close(); if (core.illustrations[item.slice(1)]) out += '<figure class="ill" aria-hidden="true"><svg viewBox="0 0 240 88" focusable="false">' + core.illustrations[item.slice(1)] + '</svg></figure>'; return; }
      if ((match = /^##\s*(.*)$/.exec(item))) { close(); out += '<h3 class="gh" data-l="' + index + '">' + core.escape_html(match[1]) + '</h3>'; return; }
      if ((match = /^-\s+(.*)$/.exec(item))) { if (list !== 'ul') { close(); out += '<ul class="gl">'; list = 'ul'; } out += '<li data-l="' + index + '">' + core.escape_html(match[1]) + '</li>'; return; }
      if ((match = /^\d+\.\s+(.*)$/.exec(item))) { if (list !== 'ol') { close(); out += '<ol class="gs">'; list = 'ol'; } out += '<li data-l="' + index + '">' + core.escape_html(match[1]) + '</li>'; return; }
      close(); out += '<p data-l="' + index + '">' + core.escape_html(item) + '</p>';
    });
    close();
    return out;
  };
  // The words of a guide (without markers), so they can be translated and put back in place
  core.guide_words = function (text) { return core.guide_lines(text).map(function (item) { return item.charAt(0) === '@' ? '' : item.replace(/^##\s*|^-\s+|^\d+\.\s+/, ''); }); };
});
