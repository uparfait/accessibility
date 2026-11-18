/* voice-commands/voice-commands-4.js: Voice commands, continued */
accessibles_core.define('voice-commands/voice-commands-4.js', [], function (core) {
  'use strict';
  // Guesses which voice command was said
  core.voice.guess_nav = function (said) {
    var words = core.normalize_words(said);
    if (!words) return null;
    var self = this;
    // Numbers shown on screen
    if (this.numbers.length) {
      var white = { one: 1, two: 2, to: 2, too: 2, three: 3, four: 4, for: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20 };
      var match = words.match(/^(?:click |press |number |select |open )?(\d+|[a-z]+)$/);
      var value = match ? (/^\d+$/.test(match[1]) ? parseInt(match[1], 10) : white[match[1]]) : 0;
      if (value && this.numbers[value - 1]) { var element = this.numbers[value - 1]; return { score: 1, label: String(value), run: function () { self.hide_numbers(); try { element.focus(); } catch (error) { /* ignore */ } element.click(); } }; }
    }
    var second = this.best(words, this.nav_cmds());
    var guess = second.command ? { score: second.score, label: second.command.label, run: second.command.run } : null;
    if (guess && guess.score === 1) return guess;
    // "click …", "search for …"
    var words_2 = words.split(' ');
    this.slots.forEach(function (slider) {
      slider.say.forEach(function (phrase) {
        self.variants(phrase).forEach(function (variant) {
          var phrase_words = core.normalize_words(variant).split(' '), phrase_length = phrase_words.length;
          if (words_2.length <= phrase_length) return;
          var head = words_2.slice(0, phrase_length).join(' '), rest = words_2.slice(phrase_length).join(' ').replace(/^(on|the|on the) /, '');
          var head_score = core.edit_ratio(head, phrase_words.join(' '));
          if (head_score < 0.75) return;
          var guess_2;
          if (slider.id === 'click') {
            // "go to wikipedia dot org" opens the website, after asking first
            var site = self.site_from(rest);
            guess_2 = site ? { score: Math.min(head_score, 0.84), label: 'Open ' + site, run: function () { location.href = 'https://' + site; } } : self.guess_click(rest, head_score);
          } else if (slider.id === 'search') guess_2 = { score: head_score, label: 'Search for ' + rest, run: function () { core.search_page(rest); } };
          else if (slider.id === 'type') {
            // Keep the words as spoken (accents, capitals), only drop the command words
            var raw = String(said).trim().split(/\s+/).slice(phrase_length).join(' ');
            guess_2 = { score: head_score, label: 'Type ' + raw, run: function () { core.voice.write(raw); } };
          } else guess_2 = self.guess_toggle(rest, head_score, slider.id);
          if (guess_2 && (!guess || guess_2.score > guess.score)) guess = guess_2;
        });
      });
    });
    // A link or button name said on its own
    if (!guess || guess.score < this.sure_score) {
      var item = this.guess_click(words, 1);
      if (item && item.score >= 0.9 && (!guess || item.score > guess.score)) guess = item;
    }
    return guess;
  };
});
