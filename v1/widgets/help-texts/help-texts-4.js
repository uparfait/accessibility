/* help-texts/help-texts-4.js: Help texts for every feature and the voice command list, continued */
accessibles_core.define('help-texts/help-texts-4.js', [], function (core) {
  'use strict';
  core.commands.pick = { title: 'When it asks you', need: 'Answer the question bar at the top of the screen, by voice or with its buttons', items: [
    ['Yes', 'does it'],
    ['No', 'cancels it'],
    ['Next', 'when several things match, shows the next one'],
    ['Previous', 'shows the one before'],
    ['All', 'does it to every match, for example deletes every copy of a word'],
    ['A number', 'picks that match', 'Two'],
    ['Stop', 'cancels. You can also say "terminate"']
  ] };
  core.commands.dict = { title: 'Talk & type', need: 'Say these while Talk & type is on', items: [
    ['Period', 'adds a full stop. You can also say "full stop"'],
    ['Comma', 'adds a comma'],
    ['Question mark', 'adds ?'],
    ['Exclamation mark', 'adds !'],
    ['Colon', 'adds :'],
    ['Semicolon', 'adds ;'],
    ['Dash', 'adds -'],
    ['Open quote', 'adds " before a quote. Say "close quote" after it'],
    ['Open bracket', 'adds ( . Say "close bracket" after it'],
    ['New line', 'starts a new line'],
    ['New paragraph', 'leaves an empty line'],
    ['Delete that', 'removes what you said last'],
    ['Delete last word', 'removes the last word'],
    ['Delete first word', 'removes the first word'],
    ['Delete last 3 words', 'removes several words. Works with first too', 'Delete first two words'],
    ['Delete', 'then a word, to remove it. If it is there more than once, each one is shown so you can choose', 'Delete Tuesday'],
    ['Clear from start', 'removes everything before the cursor'],
    ['Clear to end', 'removes everything after the cursor'],
    ['Clear all', 'empties the box'],
    ['Next field', 'moves to the next box', 'Go to next input'],
    ['Previous field', 'moves to the box before', 'Go to previous input'],
    ['Press Enter', 'presses Enter in the box'],
    ['Send', 'sends the form. You can also say "submit"'],
    ['Stop', 'stops reading or a question'],
    ['What can I say', 'reads this list out loud'],
    ['Stop typing', 'turns Talk & type off']
  ] };
  // Help guides for the sound features list every command, straight from CMDS
  core.descriptions.tts = 'Reads the page out loud.\n@tts\n## How to use\n- Click any text to hear it\n- Select text to hear only that part\n- Press play on the bar at the bottom of the screen to read the whole page\n- Use the arrows on the bar to go back or skip a paragraph\n## Keys\n' + '%readKeys%' + '\n## Say it\n- Turn on Voice commands in the Navigate tab, then say:\n' + '%read%' + '\n## Change how it sounds\n- Open the Reading tab and scroll to Reading voice\n- Choose the language, the voice, the speed and the pitch';
  core.descriptions.voiceNav = 'Control the page with your voice.\n@voiceNav\n## How to use\n1. Turn it on and allow the microphone\n2. A red dot at the top of the screen shows it is listening\n3. Say a command. The words you said appear next to the dot\n4. If it is not sure, it asks "Did you mean …?". Say yes or no, or press a button\n## Moving around\n' + '%nav%' + '\n## Reading aloud\n' + '%read%' + '\n## When it asks you\n' + '%pick%' + '\n## Good to know\n- Speak in your own language. Commands are understood in the language you chose for this website\n- It keeps listening until you turn it off\n- Works in Chrome, Edge and Safari';
  core.descriptions.dictation = 'Type by speaking.\n@dictation\n## How to use\n1. Click into a text box\n2. Turn this on and allow the microphone\n3. Speak. Your words are typed where the cursor is\n4. The red dot at the top shows which box you are typing in\n## Punctuation and editing\n' + '%dict%' + '\n## When it asks you\n' + '%pick%' + '\n## Good to know\n- Sentences start with a capital letter by themselves\n- In an email box, say "at" and "dot", for example "anna at mail dot com"\n- If a short phrase sounds like a command, it asks first. Say yes, or no to type it as text';
  core.descriptions.spokenTips = 'Short spoken help when you use a sound feature.\n## You will hear\n- How to start, when you turn on Read aloud, Voice commands or Talk & type\n- A question such as "Did you mean scroll down?" when a spoken command was not clear\n## Good to know\n- Saying "What can I say" always reads the commands out loud, even with this off\n- Tips are spoken in the language you chose for this website';
  core.heading_help.shortcuts.desc = 'Keys and spoken commands you can use.\n## Keyboard\n- Alt + A: open or close this menu\n- Esc: close a window or this menu\n## While Read aloud is on\n' + '%readKeys%' + '\n## With Keyboard navigation on\n- Alt + H, L, F, B, M or G: next heading, link, field, button, region or picture\n- Add Shift to go back\n## With Voice commands or Talk & type on\n- Say "What can I say" to hear every command\n- The full lists are on this page';
  ['tts', 'voiceNav', 'dictation'].forEach(function (key) { core.descriptions[key] = core.descriptions[key].replace(/%(\w+)%/g, function (whole_match, group_1) { return core.command_lines(group_1); }); });
  core.heading_help.shortcuts.desc = core.heading_help.shortcuts.desc.replace(/%(\w+)%/g, function (whole_match, group_1) { return core.command_lines(group_1); });
});
