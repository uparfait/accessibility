/* talk-and-type/talk-and-type.js: Talk & type: type into fields by speaking */
accessibles_core.define('talk-and-type/talk-and-type.js', ['talk-and-type-2.js', 'talk-and-type-3.js'], function (core) {
  'use strict';
    /* --- Talk & type --- */
  core.voice.dict_cmds = function () {
    if (this._dict) return this._dict;
    var self = this;
    var list = [
      ['Delete that', ['delete that', 'undo', 'undo that', 'scratch that', 'remove that'], function () { self.undo(); }],
      ['Delete last word', ['delete last word', 'delete word', 'remove last word', 'delete the last word', 'clear last word'], function () { core.delete_words(core.last_editable, 1, false); }],
      ['Delete first word', ['delete first word', 'remove first word', 'delete the first word', 'clear first word'], function () { core.delete_words(core.last_editable, 1, true); }],
      ['Clear from start', ['clear from start', 'delete from start', 'clear from the start', 'delete from the start', 'clear from the beginning', 'clear before'], function () {
        if (!core.clear_side(core.last_editable, true)) core.ui.pill('', false, core.translate_ui('Nothing before the cursor'));
      }],
      ['Clear to end', ['clear to end', 'clear to the end', 'clear from end', 'delete to end', 'delete from end', 'clear after'], function () {
        if (!core.clear_side(core.last_editable, false)) core.ui.pill('', false, core.translate_ui('Nothing after the cursor'));
      }],
      ['Clear all', ['clear all', 'delete all', 'clear everything', 'erase all', 'clear the box'], function () { self.clear_field(); }],
      ['Next field', ['next field', 'next box', 'next input', 'go to next input', 'go to next field'], function () { self.field(1); }],
      ['Previous field', ['previous field', 'previous box', 'previous input', 'go to previous input', 'go to previous field'], function () { self.field(-1); }],
      ['Press Enter', ['press enter', 'enter'], function () { if (core.last_editable) core.press_enter(core.last_editable); }],
      ['Send', ['send', 'submit', 'send message', 'submit form', 'send form'], function () { self.send(); }],
      ['Stop', ['stop', 'cancel', 'stop reading', 'be quiet'], function () { self.stop_all(); }],
      ['What can I say', ['what can i say', 'help', 'show commands', 'commands'], function () { core.ui.commands('dict'); }],
      ['Stop typing', ['stop typing', 'stop listening', 'stop dictation', 'stop talk and type'], function () { core.set_state('dictation', false); core.speech.guide('Talk and type is off'); }]
    ];
    this._dict = list.map(function (command) { return { label: command[0], say: command[1], run: command[2] }; });
    return this._dict;
  };
  // Types what was said into the field
  core.voice.type = function (raw, alts) {
    var self = this, text = raw.trim(), normalized = core.normalize_words(text), words = normalized.split(' ').length;
    // A short phrase may be a command; long phrases are always text
    if (words <= 5) {
      var second = this.best(text, this.dict_cmds());
      if (second.command && second.score >= this.sure_score) { second.command.run(); return; }
      // "delete the last 3 words", "clear first two words"
      var match = normalized.match(/^(?:delete|clear|remove|erase) (?:the )?(first|last) (\w+) words?$/);
      if (match && this.number_of(match[2])) { core.delete_words(core.last_editable, this.number_of(match[2]), match[1] === 'first'); return; }
      // "delete Tuesday": find the word in the box and ask which one
      var match_2 = normalized.match(/^(?:delete|remove|erase) (?:the word )?(.+)$/);
      if (match_2 && !/^(that|this|all|everything|word|last word|first word|the last word|the first word)$/.test(match_2[1])) {
        this.delete_ask(text.replace(/^\s*\S+\s+(?:the word\s+)?/i, ''));
        return;
      }
      if (second.command && second.score >= 0.7 && words <= 3) { var item = second.command; this.confirm(item.label, item.run, function () { self.write(text); }); return; }
    }
    this.write(text);
  };
});
