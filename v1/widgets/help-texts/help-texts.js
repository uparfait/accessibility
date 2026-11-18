/* help-texts/help-texts.js: Help texts for every feature and the voice command list */
accessibles_core.define('help-texts/help-texts.js', ['help-texts-2.js', 'help-texts-3.js', 'help-texts-4.js', 'help-texts-5.js'], function (core) {
  'use strict';
  // Guide lines ("- ...") for a group of commands
  core.command_lines = function (group) {
    var item = core.commands[group];
    return item.items.map(function (item_2) { return '- ' + (item.keys ? item_2[0] : '"' + item_2[0] + '"') + ': ' + item_2[1] + (item_2[2] ? '. Example: "' + item_2[2] + '"' : ''); }).join('\n');
  };
  // Plain sentences for speaking a group of commands out loud
  core.command_speech = function (group) {
    var item = core.commands[group];
    return [item.title + '. ' + item.need + '.'].concat(item.items.map(function (item_2) { return (item.keys ? item_2[0].replace(/\+/g, 'plus') : item_2[0]) + ': ' + item_2[1] + '.' + (item_2[2] ? ' For example: ' + item_2[2] + '.' : ''); }));
  };

  /* Help texts, written as short guides.
   * Format, one item per line:  plain text = paragraph,  "## Title" = small heading,
   * "- text" = bullet,  "1. text" = numbered step,  "@name" = small illustration from ILL. */
  core.descriptions = {
    seizure: 'Makes the page calmer and safer if flashing or movement can trigger seizures.\n## It will\n- Stop animations, slideshows and moving pictures\n- Pause videos that play by themselves\n- Soften strong, bright colors\n## Good for\n- People with photosensitive epilepsy\n- Anyone who finds moving content uncomfortable\n@stopAnimations',
    vision: 'Makes the page easier to see.\n## It will\n- Make text bigger and clearer\n- Outline headings and links so they are easy to find\n- Fix text that is hard to read against its background\n- Show a big black mouse pointer\n- Draw a clear frame around the item you select with the keyboard\n@fontSize',
    adhd: 'Helps you focus on one part of the page at a time.\n## It will\n- Dim the page, except the lines you are reading\n- Stop moving content\n- Make colors calmer\n## Tip\n- Move your mouse or finger down the page to move the reading area\n@readingMask',
    cognitive: 'Makes the page simpler to follow and understand.\n## It will\n- Make headings and links stand out\n- Use a clear, easy-to-read font\n- Stop moving content\n- Show short tips when you point at buttons and pictures\n- Frame the item you select with the keyboard\n@highlightTitles',
    dyslexia: 'Makes text easier to read with dyslexia.\n## It will\n- Use a dyslexia-friendly font\n- Add space between letters, words and lines\n- Line text up on the left\n@letterSpacing',
    colorblind: 'Adjusts colors so they are easier to tell apart if you are color blind.\n## It will\n- Correct colors for green weakness, the most common type\n- Make colors a little stronger\n## Tip\n- For red or blue weakness, open the Color tab and press Color blindness\n@colorBlind',
    motor: 'Makes the page easier to use if a mouse is hard for you.\n## It will\n- Let you use the whole page with the keyboard\n- Make buttons and boxes bigger\n- Show a big mouse pointer\n- Give you more time and keep menus open longer\n- Stop moving content\n- Frame whatever your pointer is over\n@bigTargets',
    blind: 'Prepares the page for screen readers such as NVDA, JAWS, VoiceOver and TalkBack.\n## It will\n- Add missing names to buttons, links and form fields\n- Describe pictures that have no description\n- Mark the main parts of the page\n- Turn on keyboard navigation',
    elderly: 'Makes the page more comfortable to read and use.\n## It will\n- Make text bigger and clearer\n- Make links stand out\n- Fix text that is hard to read\n- Make buttons bigger and show a big mouse pointer\n- Give you more time to read and act\n@fontSize',
    contentScale: 'Makes the whole page bigger: text, pictures and buttons together.\n@contentScale\n## How to use\n1. Press once to make the page bigger\n2. Press again for the next size\n3. Keep pressing to go back to the normal size\n## Sizes\n- 110%, 125%, 140% and 160%',
    fontSize: 'Makes only the text bigger. Pictures and layout stay the same.\n@fontSize\n## How to use\n1. Press once to make text bigger\n2. Press again for the next size, up to 175%\n3. Keep pressing to go back to normal'
  };
  core.descriptions.font = 'Changes the letters used on the whole page.\n## Choices\n- Easy to read: very clear letters, good for low vision\n- Dyslexia friendly: letters that are harder to mix up\n- About 80 other fonts, each shown in its own style\n## How to use\n1. Open the list\n2. Type a name in the search box, or scroll\n3. Choose a font\n4. Choose Original font to undo';
  core.descriptions.lineHeight = 'Adds space between lines of text, so your eyes can follow each line.\n@lineHeight\n## How to use\n1. Press once to add space\n2. Press again for more space\n3. Keep pressing to go back to normal';
  core.descriptions.letterSpacing = 'Adds space between letters, so they do not run together.\n@letterSpacing\n## How to use\n1. Press to choose Light, Medium or Wide\n2. Keep pressing to go back to normal';
  core.descriptions.wordSpacing = 'Adds space between words, so each word stands on its own.\n@wordSpacing\n## How to use\n1. Press to choose Light, Medium or Wide\n2. Keep pressing to go back to normal';
  core.descriptions.fontWeight = 'Makes thin text thicker and darker.\n## How to use\n1. Press once for semibold\n2. Press again for bold\n3. Press again to go back to normal';
  core.descriptions.textAlign = 'Changes how lines of text line up.\n@textAlign\n## Choices\n- Left: easiest to read for most people\n- Center\n- Right\n- Justify: straight edges on both sides\n## How to use\n- Press to go through the choices. Keep pressing to go back to normal';
  core.descriptions.textDir = 'Changes the direction of the whole page.\n@textDir\n## Choices\n- Right to left: mirrors the page like Arabic, Hebrew or Persian websites. Text starts on the right and menus swap sides\n- Left to right: the usual layout for English, French and similar languages\n## Good to know\n- Translating the page into a right-to-left language turns this on by itself';
  core.descriptions.highlightTitles = 'Draws a box around every heading, so you can see how the page is organized at a glance.\n@highlightTitles';
  core.descriptions.highlightLinks = 'Underlines and outlines every link, so you always know what you can click.\n@highlightLinks';
  core.descriptions.magnifier = 'Shows the text under your pointer in large letters next to it.\n@magnifier\n## How to use\n1. Turn it on\n2. Point at any text on the page\n3. Read it in the large box';
  core.descriptions.darkContrast = 'Shows light text on a dark background.\n@darkContrast\n## Good for\n- Less glare and eye strain\n- Reading at night';
  core.descriptions.lightContrast = 'Shows dark text on a plain white background.\n@lightContrast\n## Good for\n- Busy or faded designs\n- Strong, clear reading';
  core.descriptions.highContrast = 'Makes the difference between light and dark parts stronger, so text and edges stand out.\n@highContrast';
  core.descriptions.smartContrast = 'Fixes only the text that is hard to read because its color is too close to the background.\n@smartContrast\n## Good to know\n- The rest of the design stays the same\n- It pauses while dark or light contrast is on';
  core.descriptions.invert = 'Swaps light and dark colors on the page.\n@invert\n## Good to know\n- Photos and videos keep their normal colors';
  core.descriptions.mono = 'Shows the page in black, white and gray, which removes color distractions.\n@mono';
  core.descriptions.lowSat = 'Makes colors softer and calmer.\n@lowSat';
  core.descriptions.highSat = 'Makes colors stronger and brighter. This can help if colors look faded to you.\n@highSat';
  core.descriptions.colorBlind = 'Corrects the page colors for color blindness, so colors that look alike become easier to tell apart.\n@colorBlind\n## Choices\n- Protanopia: red weakness\n- Deuteranopia: green weakness, the most common\n- Tritanopia: blue weakness\n## How to use\n- Press to go through the choices. Keep pressing to turn it off';
  core.descriptions.keyboardNav = 'Lets you use the whole page with the keyboard.\n@keyboardNav\n## Keys\n- Tab: move to the next item\n- Shift + Tab: move back\n- Enter: press the selected item\n- Alt + H: next heading\n- Alt + L: next link\n- Alt + F: next form field\n- Alt + B: next button\n- Add Shift to any Alt shortcut to go back\n## Also\n- Adds a "Skip to main content" link at the top of the page';
  core.descriptions.focusRing = 'Draws a thick outline around the item you selected with the keyboard, so you never lose your place.\n@focusRing';
  core.descriptions.hoverHighlight = 'Draws a frame around whatever your pointer is over, so you can see exactly what you are about to click.\n@hoverHighlight';
  core.descriptions.structure = 'Shows a list of the parts of the page, so you can jump straight to one.\n@structure\n## Lists\n- Headings: the titles of each section\n- Regions: main areas such as the menu and the footer\n- Links: every link on the page\n## How to use\n1. Choose a list at the top\n2. Choose an item to jump to it';
  core.descriptions.cursorBlack = 'Shows a big black mouse pointer. It is easiest to see on light pages.\n@cursorBlack';
  core.descriptions.cursorWhite = 'Shows a big white mouse pointer. It is easiest to see on dark pages.\n@cursorWhite';
  core.descriptions.vkeyboard = 'Shows a keyboard on the screen, so you can type with a mouse, a touch screen or another pointing device.\n@vkeyboard\n## How to use\n1. Click into a text box\n2. Press the keys on the screen keyboard\n3. Drag the top bar to move the keyboard\n## Special keys\n- Shift: one capital letter. Press twice for all capitals\n- 123: numbers and symbols\n- Arrows: move inside the text';
  core.descriptions.voiceNav = 'Control the page with your voice.\n@voiceNav\n## How to use\n1. Turn it on and allow the microphone\n2. Say a command\n## Examples\n- "Scroll down" or "Scroll up"\n- "Click Contact"\n- "Show numbers", then say a number\n- "Go back"\n- "Stop listening"\n## Good to know\n- Works in Chrome, Edge and Safari';
  core.descriptions.dictation = 'Type by speaking.\n## How to use\n1. Click into a text box\n2. Turn this on and allow the microphone\n3. Speak\n## You can say\n- "Period", "comma", "question mark": add punctuation\n- "New line", "new paragraph": start a new line\n- "Delete that": remove the last word';
  core.descriptions.bigTargets = 'Makes buttons, check boxes and form fields bigger, so they are easier to click or tap.\n@bigTargets';
});
