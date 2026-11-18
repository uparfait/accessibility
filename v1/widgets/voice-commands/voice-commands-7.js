/* voice-commands/voice-commands-7.js: Voice commands, continued */
accessibles_core.define('voice-commands/voice-commands-7.js', [], function (core) {
  'use strict';
  // Shows a number on every clickable thing, so it can be clicked by saying its number
  core.voice.show_numbers = function () {
    this.hide_numbers();
    var layer = core.find_one('.nums'), list = this.clickables().slice(0, 99), html = '';
    this.numbers = list;
    list.forEach(function (item, index) {
      var session = item.getBoundingClientRect();
      html += '<span class="num" data-x="' + Math.round(core.clamp(session.left, 2, core.view_width() - 30)) + '" data-y="' + Math.round(core.clamp(session.top, 2, core.view_height() - 24)) + '">' + (index + 1) + '</span>';
    });
    layer.innerHTML = html;
    core.find_all('.num', layer).forEach(function (badge) { badge.style.transform = 'translate(' + badge.getAttribute('data-x') + 'px,' + badge.getAttribute('data-y') + 'px)'; });
    layer.hidden = false;
    var self = this;
    var off = function () { self.hide_numbers(); window.removeEventListener('scroll', off, true); };
    window.addEventListener('scroll', off, true);
  };
  // Hides the numbers
  core.voice.hide_numbers = function () { this.numbers = []; var element = core.find_one('.nums'); if (element) { element.innerHTML = ''; element.hidden = true; } };

  // Finds words in the page text, selects them and scrolls there. Saying the same words again moves to the next match.
  core.last_find = { words: '', node: null, at: -1 };
});
