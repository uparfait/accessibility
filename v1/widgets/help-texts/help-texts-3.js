/* help-texts/help-texts-3.js: Help texts for every feature and the voice command list, continued */
accessibles_core.define('help-texts/help-texts-3.js', [], function (core) {
  'use strict';
  core.commands.read = { title: 'Reading aloud', need: 'Say these with Voice commands on', items: [
    ['Read page', 'reads the whole page from the top'],
    ['Read this', 'reads the selected text, or the item you are on'],
    ['Read headings', 'reads only the headings, to get an overview'],
    ['Pause', 'pauses reading'],
    ['Continue', 'carries on from where it paused'],
    ['Next', 'skips to the next paragraph'],
    ['Previous', 'goes back one paragraph'],
    ['Repeat', 'reads the current paragraph again'],
    ['Faster', 'reads faster'],
    ['Slower', 'reads slower'],
    ['Stop reading', 'stops reading']
  ] };
  core.commands.readKeys = { title: 'Reading keys', need: 'Work when Read aloud is on', keys: true, items: [
    ['Alt + R', 'read the page, or pause and continue'],
    ['Alt + N', 'next paragraph'],
    ['Alt + Shift + N', 'previous paragraph'],
    ['Esc', 'stop reading']
  ] };
  core.commands.nav = { title: 'Moving around', need: 'Say these with Voice commands on', items: [
    ['Scroll down', 'moves the page down'],
    ['Scroll up', 'moves the page up'],
    ['Go to top', 'jumps to the top of the page'],
    ['Go to bottom', 'jumps to the end of the page'],
    ['Click', 'then the name of a link or button. If several match, you choose one', 'Click Contact'],
    ['Show numbers', 'puts a number on everything you can press. Then say the number', 'Show numbers, then 4'],
    ['Hide numbers', 'removes the numbers'],
    ['Type', 'then your words, to type into the selected box', 'Type anna at mail dot com'],
    ['Previous field', 'moves to the box before'],
    ['Clear field', 'empties the selected box'],
    ['Press Enter', 'presses Enter, or sends the form', 'Submit'],
    ['Turn on', 'then a name, to tick a box or switch something on', 'Turn on dark contrast'],
    ['Turn off', 'then a name, to untick a box or switch something off', 'Turn off remember me'],
    ['Choose', 'then an option from a drop-down list', 'Choose Membership'],
    ['Go to', 'then a website address. You are asked first', 'Go to wikipedia dot org'],
    ['Next heading', 'moves to the next heading'],
    ['Previous heading', 'moves to the heading before'],
    ['Next link', 'moves to the next link'],
    ['Next field', 'moves to the next box you can type in', 'Go to next input'],
    ['Search for', 'then your words. Uses the page search box, or finds the words on the page', 'Search for opening hours'],
    ['Zoom in', 'makes the page bigger'],
    ['Zoom out', 'makes the page smaller'],
    ['Go back', 'opens the page before'],
    ['Go forward', 'opens the next page'],
    ['Reload', 'loads the page again'],
    ['Open menu', 'opens the accessibility menu'],
    ['Close menu', 'closes the accessibility menu'],
    ['Stop', 'stops reading, a question or a choice'],
    ['What can I say', 'reads this list out loud'],
    ['Stop listening', 'turns voice commands off']
  ] };
});
