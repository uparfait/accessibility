/* page-fixes/page-fixes-2.js: Shared tools for fixing page markup and naming elements, continued */
accessibles_core.define('page-fixes/page-fixes-2.js', [], function (core) {
  'use strict';
  // Guesses a name for an unnamed button or link from its classes, icon or address
  core.guess_name = function (element) {
    var bits = [element.className && element.className.baseVal !== undefined ? element.className.baseVal : element.className, element.id, element.getAttribute('data-icon'), element.getAttribute('name')];
    var kids = element.querySelectorAll('i,span,svg,use,img');
    for (var count = 0; count < kids.length && count < 6; count++) {
      var key = kids[count];
      bits.push(typeof key.className === 'string' ? key.className : (key.className && key.className.baseVal));
      bits.push(key.getAttribute('href') || key.getAttribute('xlink:href') || key.getAttribute('src') || '');
    }
    if (element.tagName === 'A' && element.hostname && element.hostname !== location.hostname) bits.push(element.hostname);
    var list = bits.filter(Boolean).join(' ').toLowerCase();
    for (var count_2 = 0; count_2 < core.icon_words.length; count_2++) if (core.icon_words[count_2][0].test(list)) return core.icon_words[count_2][1];
    if (element.tagName === 'A' && element.hostname && element.hostname !== location.hostname) return core.humanize(element.hostname.replace(/^www\./, '').split('.')[0]);
    if (element.tagName === 'A' && element.getAttribute('href')) {
      var parts = (element.pathname || '').split('/').filter(Boolean).pop();
      if (parts) return core.humanize(parts);
      return 'Home';
    }
    return '';
  };
  // An element's aria-label or aria-labelledby, if it has one
  core.accessible_name_attribute = function (element) { return (element.getAttribute('aria-label') || element.getAttribute('aria-labelledby') || '').trim(); };
  // The element holding the main content of the page
  core.find_main = function (heuristic_only) {
    if (!heuristic_only) {
      var element = document.querySelector('main,[role="main"]');
      if (element && core.text_of(element).length > 80) return element;
    }
    var cands = document.querySelectorAll('article,#main,#content,#primary,.main,.main-content,.content,.post,.post-content,.entry-content,.article-body,.article,.page-content,[itemprop="articleBody"]');
    var best = null, best_len = 0;
    Array.prototype.forEach.call(cands, function (candidate) {
      if (core.is_ours(candidate)) return;
      var text_length = core.text_of(candidate).length;
      if (text_length > best_len * 1.15) { best = candidate; best_len = text_length; }
    });
    if (best && best_len > 200) return best;
    // Density scoring on paragraphs
    var scores = new Map();
    Array.prototype.forEach.call(document.querySelectorAll('p'), function (paragraph) {
      var count = core.text_of(paragraph).length;
      if (count < 40) return;
      var first = paragraph.parentElement, second = first && first.parentElement;
      if (first) scores.set(first, (scores.get(first) || 0) + count);
      if (second) scores.set(second, (scores.get(second) || 0) + count / 2);
    });
    var top = null, top_score = 0;
    scores.forEach(function (score, element) { if (score > top_score && !core.is_ours(element)) { top = element; top_score = score; } });
    return top || document.body;
  };
});
