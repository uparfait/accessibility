/* dictionary/dictionary-3.js: Dictionary, continued */
accessibles_core.define('dictionary/dictionary-3.js', [], function (core) {
  'use strict';
  // Shows or hides the definition box
  core.ui.dict = function (result, rect) {
    var box = core.find_one('.dict');
    if (!result) { box.hidden = true; return; }
    var html = '<div class="dw"><strong>' + core.escape_html(result.word) + '</strong>' +
      (core.speech.ok ? '<button type="button" class="ib" data-act="dict-say" data-word="' + core.escape_html(result.word) + '" aria-label="Pronounce">' + core.icon_svg('speak') + '</button>' : '') +
      '<button type="button" class="ib" data-act="dict-close" aria-label="Close definition">' + core.icon_svg('close') + '</button></div>';
    if (result.phonetic) html += '<div class="ph">' + core.escape_html(result.phonetic) + '</div>';
    if (result.loading) html += '<div class="dd">' + core.icon_svg('spinner', 'spin') + 'Looking up…</div>';
    else if (result.none || !result.defs.length) html += '<div class="dd">No definition found.</div>';
    else result.defs.forEach(function (detail) { html += (detail.pos ? '<div class="dp">' + core.escape_html(detail.pos) + '</div>' : '') + '<div class="dd">' + core.escape_html(detail.text) + '</div>' + (detail.example ? '<div class="dx">' + core.escape_html(detail.example) + '</div>' : ''); });
    box.innerHTML = html;
    box.hidden = false;
    if (rect) {
      var width = box.offsetWidth, height = box.offsetHeight;
      var value = core.clamp(rect.left + rect.width / 2 - width / 2, 8, core.view_width() - width - 8);
      var value_2 = rect.bottom + 10 + height < core.view_height() - 8 ? rect.bottom + 10 : Math.max(8, rect.top - height - 10);
      box.style.transform = 'translate(' + Math.round(value) + 'px,' + Math.round(value_2) + 'px)';
    }
  };
  core.register('action', { folder: 'dictionary', names: ['dict-close'], run: function (target) {
    core.ui.dict(null);
  } });
  core.register('action', { folder: 'dictionary', names: ['dict-say'], run: function (target) {
    if (core.speech.ok) core.speech.say(target.getAttribute('data-word') || '', null);
  } });
  // The screen changed size: the definition box would no longer sit next to its word, so it closes
  core.dictionary.on_resize = function () { if (!core.find_one('.dict').hidden) core.ui.dict(null); };
});
