/* speech/speech.js: Speaks text aloud for read aloud, voice commands and tips */
accessibles_core.define('speech/speech.js', ['speech-2.js', 'speech-3.js', 'speech-4.js', 'speech-5.js', 'speech-6.js'], function (core) {
  'use strict';
  // A British English male voice, when the browser has one
  core.british_male_voice = function (voices) {
    var british_voices = voices.filter(function (voice) { return /^en[-_]gb$/i.test(voice.lang || ''); });
    var pick = function (list) { return list.filter(function (item) { return core.male_voice_names.test(item.name) && !core.female_voice_names.test(item.name); })[0]; };
    return pick(british_voices.filter(function (voice) { return voice.localService; })) || pick(british_voices) || british_voices.filter(function (voice) { return !core.female_voice_names.test(voice.name); })[0] || british_voices[0] ||
      pick(voices.filter(function (voice) { return /^en/i.test(voice.lang || ''); })) || null;
  };

  // Voices do not report gender, so British male voices are recognised by the names browsers and systems give them
  core.male_voice_names = /\b(male|man|george|ryan|daniel|arthur|oliver|thomas|james|brian|alfie|harry|william|noah|elliot|ethan|guy|reed|rocko|eddy|grandpa)\b/i;
  core.female_voice_names = /\b(female|woman|hazel|susan|libby|sonia|kate|serena|martha|stephanie|fiona|maisie|abbi|bella|hollie|olivia|amy|emma|mia|sandy|shelley|flo|grandma|karen|moira|tessa)\b/i;
  core.speech = {
    ok: 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function',
    on: false,
    run_id: 0,
    active: false,
    paused: false,
    items: [],
    item_index: -1,
    current: null,
    current_element: null,
    current_lang: '',
    said: []
  };
  // Every voice the browser has
  core.speech.voices = function () { try { return window.speechSynthesis.getVoices() || []; } catch (error) { return []; } };
    // The language text is read in: the visitor's choice, else the translation, else the page language
  core.speech.read_lang = function () { return this.current_lang || core.state.ttsLang || core.state.translateTo || core.page_lang(); };
  // The best voice for a language
  core.speech.voice = function () {
    var voices = this.voices();
    var lang = this.read_lang().toLowerCase();
    var preformatted = lang.split('-')[0];
    if (core.state.ttsVoice) { for (var count = 0; count < voices.length; count++) if ((voices[count].voiceURI === core.state.ttsVoice || voices[count].name === core.state.ttsVoice) && ((!core.state.ttsLang && !this.current_lang) || (voices[count].lang || '').toLowerCase().split(/[-_]/)[0] === preformatted)) return voices[count]; }
    if (preformatted === 'en') { var british_voice = core.british_male_voice(voices); if (british_voice) return british_voice; }
    return voices.filter(function (voice) { return voice.lang && voice.lang.toLowerCase() === lang; })[0] ||
      voices.filter(function (voice) { return voice.lang && voice.lang.toLowerCase().split(/[-_]/)[0] === preformatted && voice.localService; })[0] ||
      voices.filter(function (voice) { return voice.lang && voice.lang.toLowerCase().split(/[-_]/)[0] === preformatted; })[0] || null;
  };
});
