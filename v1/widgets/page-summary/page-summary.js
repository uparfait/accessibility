/* page-summary/page-summary.js: Page summary: the key points of the page */
accessibles_core.define('page-summary/page-summary.js', ['page-summary-2.js'], function (core) {
  'use strict';
  // Picks the sentences that best sum up a text
  core.extractive_summary = function (text) {
    var sentences = (text.replace(/\s+/g, ' ').match(/[^.!?。！？]+[.!?。！？]+["'”’)\]]*|[^.!?。！？]+$/g) || [])
      .map(function (sentence) { return sentence.trim(); }).filter(function (sentence) { return sentence.length >= 40 && sentence.length <= 420; });
    if (!sentences.length) return [];
    var freq = {};
    sentences.forEach(function (sentence) {
      core.words_of(sentence.toLowerCase()).forEach(function (word) { if (word.length > 2 && !core.stop_word_set[word]) freq[word] = (freq[word] || 0) + 1; });
    });
    var max = 1;
    Object.keys(freq).forEach(function (key) { if (freq[key] > max) max = freq[key]; });
    var scored = sentences.map(function (sentence, index) {
      var spoken_words = core.words_of(sentence.toLowerCase());
      var script = 0;
      spoken_words.forEach(function (word) { if (freq[word]) script += freq[word] / max; });
      script = script / Math.sqrt(spoken_words.length || 1);
      if (index < 3) script *= 1.25;
      return { s: sentence, index: index, score: script };
    });
    var value = core.clamp(Math.round(sentences.length / 6), 3, 7);
    var picked = scored.slice().sort(function (first, second) { return second.score - first.score; }).slice(0, value);
    // Drop near-duplicates
    var out = [];
    picked.sort(function (first, second) { return first.index - second.index; }).forEach(function (pick) {
      var duplicate = out.some(function (kept) { return kept.s.slice(0, 50) === pick.s.slice(0, 50); });
      if (!duplicate) out.push(pick);
    });
    return out.map(function (pick) { return pick.s; });
  };
});
