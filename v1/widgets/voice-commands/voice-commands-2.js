/* voice-commands/voice-commands-2.js: Voice commands, continued */
accessibles_core.define('voice-commands/voice-commands-2.js', [], function (core) {
  'use strict';
    // Spoken commands for moving around and reading. "reading" ones still work while the page is speaking.
  core.voice.nav_cmds = function () {
    if (this._nav) return this._nav;
    var script = function (detail) { return function () { window.scrollBy({ top: detail * core.view_height() * 0.8, behavior: core.state.stopAnimations ? 'auto' : 'smooth' }); }; };
    var list = [
      ['Scroll down', ['scroll down', 'page down', 'go down', 'down'], script(1)],
      ['Scroll up', ['scroll up', 'page up', 'go up', 'up'], script(-1)],
      ['Go to top', ['go to top', 'scroll to top', 'top of the page', 'top'], function () { window.scrollTo({ top: 0, behavior: 'smooth' }); }],
      ['Go to bottom', ['go to bottom', 'scroll to bottom', 'end of the page', 'bottom'], function () { window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' }); }],
      ['Go back', ['go back', 'back', 'previous page'], function () { history.back(); }],
      ['Go forward', ['go forward', 'forward'], function () { history.forward(); }],
      ['Reload', ['reload', 'refresh', 'reload page', 'refresh page'], function () { location.reload(); }],
      ['Next heading', ['next heading', 'next title'], function () { core.move_to(core.headings, 1); }],
      ['Previous heading', ['previous heading', 'heading before'], function () { core.move_to(core.headings, -1); }],
      ['Next link', ['next link'], function () { core.move_to('a[href]', 1); }],
      ['Next field', ['next field', 'next box', 'next input', 'go to next input', 'go to next field'], function () { core.move_to(core.field_selector, 1); }],
      ['Previous field', ['previous field', 'previous box', 'previous input', 'go to previous input', 'go to previous field'], function () { core.move_to(core.field_selector, -1); }],
      ['Press Enter', ['press enter', 'enter', 'submit', 'submit form', 'send', 'send form'], function () { core.voice.enter(); }],
      ['Clear field', ['clear field', 'clear this field', 'clear the box', 'empty field'], function () { core.voice.clear_field(); }],
      ['Show numbers', ['show numbers', 'show labels', 'numbers'], function () { core.voice.show_numbers(); }],
      ['Hide numbers', ['hide numbers', 'hide labels'], function () { core.voice.hide_numbers(); }],
      ['Zoom in', ['zoom in', 'bigger', 'make it bigger'], function () { core.step_cycle('contentScale', 1); }],
      ['Zoom out', ['zoom out', 'smaller', 'make it smaller'], function () { core.step_cycle('contentScale', -1); }],
      ['Open menu', ['open menu', 'open accessibility', 'show menu', 'open options'], function () { core.ui.show(); }],
      ['Close menu', ['close menu', 'close accessibility', 'hide menu', 'close'], function () { core.ui.close(); }],
      ['What can I say', ['what can i say', 'help', 'show commands', 'list commands', 'commands'], function () { core.ui.commands('nav'); }],
      ['Stop listening', ['stop listening', 'turn off voice', 'stop voice commands'], function () { core.set_state('voiceNav', false); core.speech.guide('Voice commands are off'); }],
      ['Read page', ['read page', 'read the page', 'read all', 'read everything'], function () { if (!core.state.tts) core.set_state('tts', true); core.speech.read_page(); }],
      ['Read this', ['read this', 'read selection', 'read that'], function () { if (!core.state.tts) core.set_state('tts', true); core.speech.read_this(); }],
      ['Read headings', ['read headings', 'read the headings', 'read titles'], function () { if (!core.state.tts) core.set_state('tts', true); core.speech.read_headings(); }],
      ['Pause', ['pause', 'pause reading', 'wait'], function () { if (core.speech.active && !core.speech.paused) core.speech.pause(); }, 1],
      ['Continue', ['continue', 'resume', 'continue reading', 'go on'], function () { if (core.speech.paused) core.speech.pause(); }, 1],
      ['Next', ['next', 'skip', 'next paragraph'], function () { if (!core.speech.skip(1)) core.move_to(core.headings, 1); }, 1],
      ['Previous', ['previous', 'previous paragraph', 'go back one'], function () { if (!core.speech.skip(-1)) core.move_to(core.headings, -1); }, 1],
      ['Repeat', ['repeat', 'say again', 'again'], function () { core.speech.skip(0); }, 1],
      ['Faster', ['faster', 'read faster', 'speed up'], function () { core.speech.speed(0.2); }, 1],
      ['Slower', ['slower', 'read slower', 'slow down'], function () { core.speech.speed(-0.2); }, 1],
      ['Stop', ['stop', 'stop reading', 'cancel', 'be quiet', 'silence', 'quiet'], function () { core.voice.stop_all(); }, 1]
    ];
    this._nav = list.map(function (command) { return { label: command[0], say: command[1], run: command[2], reading: !!command[3] }; });
    return this._nav;
  };
    // Commands that take words after them: "click Contact", "search for opening hours"
  core.voice.slots = [
    { id: 'click', say: ['click', 'press', 'open', 'select', 'tap', 'go to', 'follow', 'choose'] },
    { id: 'search', say: ['search for', 'search', 'find', 'look for'] },
    { id: 'on', say: ['check', 'tick', 'turn on', 'switch on', 'enable', 'activate'] },
    { id: 'off', say: ['uncheck', 'untick', 'turn off', 'switch off', 'disable', 'deactivate'] },
    { id: 'toggle', say: ['toggle', 'flip'] },
    { id: 'type', say: ['type', 'write', 'fill in', 'enter'] }
  ];
    // "google dot com", "wikipedia.org" → an address to open
  core.voice.top_level_domains = /^(com|org|net|io|gov|edu|co|uk|rw|de|fr|es|it|nl|info|app|dev|ai|me|tv|us|ca|au|in|jp|ke|ug|tz|za|ng|be|ch|se|no|pl|pt|br|mx|ru|cn)$/;
});
