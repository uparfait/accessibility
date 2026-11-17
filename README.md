# Accessibles

Accessibles is an accessibility toolbar for websites. You add one script, and every visitor gets a panel where they can make text bigger, change colors, stop animations, have the page read aloud, navigate by voice and more.

It also repairs common problems in the page itself: images without descriptions, form fields without labels and icon buttons without names. You don't have to change your HTML for any of this.

- Website and docs: https://uparfait.github.io/accessibility/
- Demo on an older-style page: https://uparfait.github.io/accessibility/demo.html

## Quick start

Paste these two lines before the closing `</body>` tag:

```html
<div class="accessibles-widget"></div>
<script src="https://uparfait.github.io/accessibility/accessibles.js" defer></script>
```

Reload the page and a small button appears in the bottom-right corner. Click it, or press `Alt + A`, to open the panel.

A few things to know:

- The `div` is optional. If the script can't find one, it creates it.
- `defer` is optional. The script waits for the page to load either way, so it also works when a tag manager injects it.
- To host it yourself, download `accessibles.js` and change the `src`. It's a single file with no dependencies.

## Configuration

Every option can be set in three places. If the same option is set twice, the later one wins:

1. A `window.AccessiblesConfig` object, defined before the script loads
2. The script URL: `accessibles.js?color=...&position=...`
3. `data-` attributes on the `.accessibles-widget` div

Option names ignore case and dashes, so `site-name`, `siteName` and `sitename` all mean the same thing.

```html
<!-- In the script URL -->
<script src="accessibles.js?color=%237B3F00&position=bottom-left" defer></script>

<!-- As data attributes -->
<div class="accessibles-widget" data-color="#7B3F00" data-position="bottom-left"></div>

<!-- As a config object -->
<script>
  window.AccessiblesConfig = { color: '#7B3F00', position: 'bottom-left' };
</script>
```

In a URL, `#` has to be written as `%23`. If you forget and type `color=#7B3F00`, it still works, because the script reads its own `src` attribute directly.

### Options

| Option | Default | Description |
|---|---|---|
| `color` | `#2F6B5A` | Main color for the button, highlights and active states. Any CSS color works: `#7B3F00`, `7B3F00`, `rgb(123,63,0)`, `chocolate`. |
| `bg` | `#000000` | Panel background. Text, borders and highlights adjust to stay readable, so a light `bg` gives you a light panel. |
| `site-name` | none | Your site's name. It's shown as the panel title, in the button's hover card, in the accessibility statement and in issue reports. |
| `site-icon-url` | none | Your site's icon, shown in the panel header and the hover card. It's scaled to fit a circle without cropping. If it fails to load, the favicon is used instead. |
| `position` | `bottom-right` | `bottom-right`, `bottom-left`, `bottom-center`, `top-right`, `top-left`, `top-center`, `right-center` or `left-center`. Short forms such as `right` and typos such as `rigth` or `botom` are understood. |
| `offset` | `20` | Distance from the edge of the screen, in pixels. Use `offsetx` and `offsety` to set each direction separately. |
| `title` | `Accessibility` | Panel title. When `site-name` is set, this becomes the subtitle. |
| `statement` | none | Link to your accessibility statement. It opens inside the panel. Without it, a built-in statement is shown. |
| `report` | none | Where issue reports go. Use an email address to open the visitor's mail app, or a URL to receive a JSON `POST`. |
| `analytics` | none | URL that receives anonymous feature-usage events through `navigator.sendBeacon`. |
| `size` | none | `large` starts with the bigger version of the panel. |
| `draggable` | `true` | Set to `false` to stop visitors from dragging the button. |
| `lang` | none | Sets `<html lang>` when the page doesn't have one. |
| `readable-font-url`, `dyslexic-font-url` | Google Fonts | Load the easy-to-read and dyslexia fonts from your own server instead. |
| `dictionary` | dictionaryapi.dev | Your own dictionary endpoint, with `{word}` and `{lang}` placeholders. |

## Examples

### Brand color in the bottom-left corner

```html
<div class="accessibles-widget"></div>
<script src="https://uparfait.github.io/accessibility/accessibles.js?color=%237B3F00&position=bottom-left" defer></script>
```

### A light panel with your site's name and icon

```html
<div class="accessibles-widget"
     data-site-name="Green Valley Library"
     data-site-icon-url="/img/logo.svg"
     data-bg="#FBFAF6"></div>
<script src="https://uparfait.github.io/accessibility/accessibles.js?color=%232F7A3A" defer></script>
```

### Your own statement and issue reports

```html
<div class="accessibles-widget"
     data-statement="/accessibility"
     data-report="access@example.org"></div>
<script src="https://uparfait.github.io/accessibility/accessibles.js" defer></script>
```

When `report` is a URL, the form sends JSON like this:

```json
{
  "site": "Green Valley Library",
  "type": "A form does not work for me",
  "message": "The search button does nothing with the keyboard.",
  "email": "reader@example.org",
  "page": "https://example.org/catalog",
  "settings": { "fontSize": 1.3, "focusRing": true },
  "time": "2026-11-17T09:30:00.000Z"
}
```

### Turning features on from your own code

```html
<button onclick="Accessibles.profile('dyslexia')">Dyslexia-friendly view</button>
<button onclick="Accessibles.set('fontSize', 1.3)">Bigger text</button>
<button onclick="Accessibles.open()">Accessibility options</button>
```

### Glossary, image descriptions and summaries

Functions can only be passed through `window.AccessiblesConfig`:

```html
<script>
  window.AccessiblesConfig = {
    // Checked first when a visitor looks up a word
    glossary: { ISBN: 'International Standard Book Number' },

    // Real image descriptions, for example from a vision service
    altText: async (img) => {
      const res = await fetch('/api/describe?src=' + encodeURIComponent(img.src));
      return res.text();
    },

    // Your own summarizer: return a string or an array of points
    summarize: async (text) => {
      const res = await fetch('/api/summary', { method: 'POST', body: text });
      return res.json();
    },

    // ASL videos for parts of the page
    signVideos: { '#intro': '/media/intro-asl.mp4' }
  };
</script>
<script src="https://uparfait.github.io/accessibility/accessibles.js" defer></script>
```

You can also mark any element with `data-acc-sign="video.mp4"` to give it a sign language video.

### Reacting to changes

```js
window.addEventListener('accessibles:ready', (e) => {
  console.log('Accessibles', e.detail.version, 'is ready');
});

window.addEventListener('accessibles:change', (e) => {
  // e.detail.key, e.detail.value and the full e.detail.state
  if (e.detail.key === 'contrast') document.body.dataset.theme = e.detail.value || 'default';
});
```

## Features

Each feature in the panel has a small `?` button. It opens a short guide with steps, a drawing where one helps, and a button that says exactly what it will do. That guide can be translated into about 130 languages from its own language picker.

### Profiles

A profile turns on a group of settings at once. Turning it off puts back exactly what was there before, and you can combine profiles.

| Profile | Turns on |
|---|---|
| Seizure safe | Stop animations, low saturation |
| Vision impaired | Bigger text, easy-to-read font, highlighted titles and links, focus highlight, big black cursor, smart contrast |
| ADHD friendly | Reading mask, stop animations, low saturation |
| Cognitive disability | Highlighted titles and links, stop animations, focus highlight, easy-to-read font, tooltips |
| Dyslexia | Dyslexia font, letter, word and line spacing, left alignment |
| Color blind | Deuteranopia correction, high saturation |
| Motor impaired | Keyboard navigation, focus highlight, bigger targets, big cursor, more time, stop animations, hover highlight |
| Blind users | ARIA fixes, image descriptions, form fixes, keyboard navigation, focus highlight |
| Older adults | Bigger text, easy-to-read font, big cursor, highlighted links, bigger targets, more time, smart contrast |

### Text

- **Content scaling** zooms the whole page, from 110% to 160%.
- **Bigger text** enlarges only the text, up to 175%. The layout stays as it is.
- **Font** offers about 80 fonts, including easy-to-read and dyslexia-friendly ones. Each name is previewed in its own typeface.
- **Line height**, **letter spacing**, **word spacing**, **bolder text** and **text align**
- **Text direction** switches the page to right-to-left and mirrors the layout, the way Arabic, Hebrew and Persian sites are built.
- **Highlight titles**, **highlight links** and a **text magnifier** that shows the text under the pointer in large letters

### Color

- **Dark**, **light** and **high contrast**
- **Smart contrast** fixes only the text that is too close to its background color, and leaves the rest of the design alone.
- **Invert colors**, **monochrome**, **low** and **high saturation**
- **Color blindness** correction for protanopia, deuteranopia and tritanopia
- **Custom colors** for text, titles and background, from preset swatches or a color code
- **Brightness**

### Navigate

- **Keyboard navigation** adds a "Skip to main content" link and `Alt` shortcuts that jump between headings, links, fields, buttons, regions and images.
- **Focus highlight** and **highlight hover**
- **Page structure** lists the headings, regions and links on the page. Choose one to jump to it.
- **Big black** and **big white cursor**
- **On-screen keyboard**, which you can drag anywhere
- **Voice commands** and **Talk & Type** (see below)
- **Bigger targets** and **more time**

### Reading

- **Read aloud**: click text, select text, or play the whole page. You can skip or go back a paragraph and pick the language, voice, speed and pitch.
- **Reading guide** and **reading mask**
- **Stop animations**, **hide images** and **mute sounds**. Each hidden picture is replaced by a small label with its description.
- **Tooltips** show the hidden names of buttons, links and pictures.
- **Reader view** shows the main text alone, in light, sepia or dark.
- **Dictionary**: select a word to see its meaning.
- **Page summary**: the main points, word count and reading time
- **Sign language**: Libras through the free VLibras service, and ASL videos that your site provides
- **Translate** the page and the panel into about 130 languages

### Tools

- **ARIA fixes**, **image descriptions** and **form fixes** are on by default and change nothing you can see.
- **Larger features** makes the panel itself bigger. It's on by default.
- **Feature position** moves the button.
- **Remember settings** keeps choices for the next visit.
- **Page check** scores the page and points to the problems.
- **Report an issue**, **accessibility statement** and **reset all**

### Voice commands

Voice commands and Talk & Type listen in the visitor's own language and keep listening until they are turned off. They don't need exact wording: "scrol down" works, and when a command is unclear the visitor is asked "Did you mean …?" and can answer yes or no.

| Moving around | Reading aloud | Talk & Type |
|---|---|---|
| Scroll down / up, Go to top / bottom | Read page, Read this, Read headings | Period, Comma, Question mark, Colon, Dash |
| Click + a name ("Click Contact") | Pause, Continue | Open quote / Close quote, Open bracket / Close bracket |
| Show numbers, then say a number | Next, Previous, Repeat | New line, New paragraph |
| Next / Previous heading, Next link, Next field | Faster, Slower | Delete that, Delete last word, Clear all |
| Search for + words | Stop reading | Next field, Previous field, Send |
| Zoom in / out, Go back / forward, Reload | | What can I say, Stop typing |
| Open menu, Close menu, What can I say, Stop listening | | |

Talk & Type adds capital letters at the start of sentences and spaces punctuation correctly. In email fields, "anna at mail dot com" becomes `anna@mail.com`.

### Keyboard shortcuts

| Keys | Action |
|---|---|
| `Alt + A` | Open or close the panel |
| `Esc` | Close the open window, view or panel |
| `Alt + R` | Read the page, or pause and continue (read aloud on) |
| `Alt + N` / `Alt + Shift + N` | Next / previous paragraph (read aloud on) |
| `Alt + H`, `L`, `F`, `B`, `M`, `G` | Next heading, link, field, button, region or image (keyboard navigation on). Add `Shift` to go back. |
| `Alt + arrows` | Move the button while it has focus |

## JavaScript API

Once the script has loaded, `window.Accessibles` is available:

```js
Accessibles.open();                   // open the panel
Accessibles.close();
Accessibles.toggle();

Accessibles.set('fontSize', 1.3);     // change one setting
Accessibles.set('contrast', 'dark');
Accessibles.get('contrast');          // 'dark'
Accessibles.get();                    // every setting

Accessibles.profile('dyslexia');      // toggle a profile
Accessibles.reset();                  // back to the defaults

Accessibles.readPage();               // read the main content aloud
Accessibles.audit();                  // { score, checks: [{ id, label, open, fixed, help }] }
```

The settings you can pass to `set()`:

| Setting | Values |
|---|---|
| `contentScale` | `1`, `1.1`, `1.25`, `1.4`, `1.6` |
| `fontSize` | `1`, `1.15`, `1.3`, `1.5`, `1.75` |
| `font` | `''`, `'readable'`, `'dyslexic'` or a font name such as `'Lora'` |
| `lineHeight` | `0`, `1.5`, `1.8`, `2.1` |
| `letterSpacing` | `0`, `0.05`, `0.1`, `0.16` |
| `wordSpacing` | `0`, `0.16`, `0.3`, `0.45` |
| `fontWeight` | `0`, `600`, `700` |
| `textAlign` | `''`, `'left'`, `'center'`, `'right'`, `'justify'` |
| `textDir` | `''`, `'ltr'`, `'rtl'` |
| `contrast` | `''`, `'dark'`, `'light'`, `'high'` |
| `saturation` | `''`, `'mono'`, `'low'`, `'high'` |
| `colorBlind` | `''`, `'protanopia'`, `'deuteranopia'`, `'tritanopia'` |
| `textColor`, `titleColor`, `bgColor` | Any CSS color, or `''` |
| `brightness` | `50` to `150` |
| `cursor` | `''`, `'black'`, `'white'` |
| `ttsRate`, `ttsPitch` | `0.5` to `2` and `0.5` to `1.5` |
| `translateTo` | A language code such as `'fr'`, or `''` |
| On/off settings | `highlightTitles`, `highlightLinks`, `magnifier`, `smartContrast`, `invert`, `keyboardNav`, `focusRing`, `hoverHighlight`, `vkeyboard`, `bigTargets`, `extendedTime`, `tts`, `readingGuide`, `readingMask`, `stopAnimations`, `hideImages`, `mute`, `tooltips`, `dictionary`, `spokenTips`, `ariaFix`, `altText`, `formFix`, `oversized`, `remember` |

## How it works

### One file

`accessibles.js` wraps everything in a single function. The only globals it creates are `window.Accessibles` and a flag that stops it from loading twice. The code is split into numbered sections:

| # | Section | What it does |
|---|---|---|
| 1 | Configuration | Finds its own `<script>` tag and reads the options |
| 2 | Helpers | DOM shortcuts and visibility checks |
| 3 | Colors | Contrast math and the panel palette |
| 4 | Icons | The icon set, as SVG paths |
| 5 | Features | Profiles, features, help texts, default settings |
| 6 | Storage | Saving settings |
| 7 | Page styles | Turning settings into one stylesheet for the page |
| 8 | Text scaling | Real font-size scaling |
| 9 | Recorder | Undo log for every change made to the page |
| 10 | Repairs | ARIA, image descriptions and forms |
| 11 | Keyboard | Focus fixes, skip link, shortcuts |
| 12 | Read aloud | The speech engine |
| 13 | Pointer aids | Reading guide, mask, magnifier |
| 14 | Motion and media | Stop animations, mute, more time |
| 15 | Voice | Voice commands and Talk & Type |
| 16 | Typing | Inserting text into any field |
| 17 | Reading tools | Reader view, summary, dictionary |
| 18 | Translation | Page and panel translation |
| 19 | Sign language | ASL videos and VLibras |
| 20 | Page check | Audit and usage counts |
| 21 | State | `setState`, profiles, reset, `applyAll` |
| 22 | Interface | Panel styles and rendering |
| 23 | Observer | Fixing content that is added later |
| 24 | Start | Mounting the widget and the API |

### Staying out of the page's way

The panel has to recolor, zoom and invert the whole page while staying readable itself, and the site's CSS must never break it. Four things make that work:

- **Shadow DOM.** The panel renders inside a shadow root, so page styles can't reach in and panel styles can't leak out.
- **Outside `<body>`.** The mount element is moved to be a direct child of `<html>`. Zoom, fonts and color overrides target `body`, so they never touch the panel.
- **The top layer.** The mount element becomes a `popover` and is shown with `showPopover()`. Color filters go on `<html>`, and the browser paints the top layer outside that filter. This also keeps `position: fixed` headers on the page working, which a filter on `body` would break.
- **CSP-safe styles.** Both stylesheets are attached with `adoptedStyleSheets`, and dynamic values are set through `element.style`. Strict `style-src` policies allow both.

### Settings

All settings live in one object. Every change goes through `setState(key, value)`, which saves the value, fires `accessibles:change` and schedules `applyAll()`. That function rebuilds the page stylesheet and calls `sync()` on each module. Each module compares the settings with what it last applied and turns itself on, off or updates. Modules that do slow work return a promise, and the pressed control shows a spinner until they finish.

```js
// The pattern every module follows
var Mute = {
  on: false,
  sync: function () {
    if (S.mute && !this.on) this.enable();
    else if (!S.mute && this.on) this.disable();
  }
};
```

Settings are saved in `localStorage` under `accessibles.v1`, with a cookie as a fallback. With "Remember settings" off, they last only for the session. Voice input never comes back on by itself unless the microphone is already allowed.

### Changes that can be undone

The automatic repairs never set an attribute directly. They go through a recorder that saves the old value first:

```js
rec.set(img, 'alt', 'Team photo 2019');   // remembers that img had no alt
rec.revert();                             // puts every attribute back
```

Turning a repair off returns the page to exactly how it was. Repaired elements are tagged with `data-acc-fixed`, so the page check can report them as "fixed automatically".
