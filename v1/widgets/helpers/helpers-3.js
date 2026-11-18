/* helpers/helpers-3.js: Small shared tools, continued */
accessibles_core.define('helpers/helpers-3.js', [], function (core) {
  'use strict';
  core.native_set_interval = window.setInterval;
  core.latin_like_letters = 'A-Za-z0-9\\u00C0-\\u024F\\u0370-\\u03FF\\u0400-\\u04FF\\u0590-\\u06FF\\u0900-\\u0DFF\\u0E00-\\u0E7F\\u1200-\\u137F\\u3040-\\u30FF\\u3400-\\u9FFF\\uAC00-\\uD7AF';
  core.words_pattern = core.make_regex("[\\p{L}\\p{N}']+", 'gu', new RegExp('[' + core.latin_like_letters + "']+", 'g'));
  core.letters_pattern = core.make_regex('\\p{L}{2,}', 'u', new RegExp('[' + core.latin_like_letters.replace('0-9', '') + ']{2,}'));
  core.edge_punctuation_pattern = core.make_regex('^[^\\p{L}\\p{N}]+|[^\\p{L}\\p{N}]+$', 'gu', new RegExp('^[^' + core.latin_like_letters + ']+|[^' + core.latin_like_letters + ']+$', 'g'));
  core.skip_tags = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEMPLATE: 1, IFRAME: 1, CANVAS: 1, VIDEO: 1, AUDIO: 1, IMG: 1, OBJECT: 1, EMBED: 1, svg: 1, SVG: 1, MATH: 1, HEAD: 1, LINK: 1, META: 1 };
});
