/* voice/voice.js: Voice: listens to the microphone and answers questions for voice commands and talk & type */
accessibles_core.define('voice/voice.js', ['voice-2.js', 'voice-3.js', 'voice-4.js', 'voice-5.js', 'voice-6.js', 'voice-7.js', 'voice-8.js'], function (core) {
  'use strict';
  /* Word matching for spoken input. Cheap on purpose: short strings, simple edit distance, no libraries. */
  core.normalize_words = function (text) {
    text = String(text || '').toLowerCase();
    try { text = text.normalize('NFD').replace(/[̀-ͯ]/g, ''); } catch (error) { /* old browser */ }
    return text.replace(/[.,!?;:"“”'’«»()\[\]¿¡。、，！？،؟]/g, ' ').replace(/\s+/g, ' ').trim();
  };
  // How alike two words are, from 0 to 1
  core.edit_ratio = function (word_one, word_two) {
    if (word_one === word_two) return 1;
    var rank_first = word_one.length, labelled_by = word_two.length;
    if (!rank_first || !labelled_by) return 0;
    if (Math.abs(rank_first - labelled_by) > Math.max(rank_first, labelled_by) * 0.6) return 0;
    var previous_value = [], current = [], row, column;
    for (column = 0; column <= labelled_by; column++) previous_value[column] = column;
    for (row = 1; row <= rank_first; row++) {
      current = [row];
      for (column = 1; column <= labelled_by; column++) current[column] = Math.min(previous_value[column] + 1, current[column - 1] + 1, previous_value[column - 1] + (word_one.charCodeAt(row - 1) === word_two.charCodeAt(column - 1) ? 0 : 1));
      previous_value = current;
    }
    return 1 - previous_value[labelled_by] / Math.max(rank_first, labelled_by);
  };
  // 1 = same words. Compares the whole phrase and word by word, and takes the better of the two.
  core.word_match = function (said, phrase) {
    var said_text = core.normalize_words(said), phrase_text = core.normalize_words(phrase);
    if (!said_text || !phrase_text) return 0;
    if (said_text === phrase_text) return 1;
    var whole = core.edit_ratio(said_text, phrase_text);
    var said_words = said_text.split(' '), phrase_words_list = phrase_text.split(' '), total = 0;
    phrase_words_list.forEach(function (phrase_word) { var best = 0; said_words.forEach(function (said_word) { var rect = core.edit_ratio(said_word, phrase_word); if (rect > best) best = rect; }); total += best; });
    var words = total / Math.max(said_words.length, phrase_words_list.length);
    return Math.max(whole, words);
  };
  core.voice = {
    recognition: null,
    mode: '',
    lang: '',
    want: false,
    running: false,
    fails: 0,
    numbers: [],
    pending: null,
    quiet_until: 0,
    watchdog: 0,
    last_insert: null
  };
  core.voice.sure_score = 0.86;
  core.voice.maybe_score = 0.6;
  core.voice.yes_words = ['yes', 'yeah', 'yep', 'yes please', 'correct', 'right', 'okay', 'ok', 'sure', 'do it'];
  core.voice.no_words = ['no', 'nope', 'cancel', 'wrong', 'no thanks', 'not that'];
});
