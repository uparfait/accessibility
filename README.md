# Accessibles

Accessibles is an accessibility toolbar for websites. You add one script, and every visitor gets a panel where they can make text bigger, change colors, stop animations, have the page read aloud, navigate by voice and more.

It also repairs common problems in the page itself: images without descriptions, form fields without labels and icon buttons without names. You don't have to change your HTML for any of this.

- Website and docs: https://uparfait.github.io/accessibility/
- Demo on an older-style page: https://uparfait.github.io/accessibility/demo.html

## Quick start

Paste these two lines before the closing `</body>` tag:

```html
<div class="accessibles-widget"></div>
<script src="https://uparfait.github.io/accessibility/v1/widgets/accessibles.js" defer></script>
```

Reload the page and a small button appears in the bottom-right corner. Click it, or press `Alt + A`, to open the panel.

A few things to know:

- The `div` is optional. If the script can't find one, it creates it.
- `defer` is optional. The script waits for the page to load either way, so it also works when a tag manager injects it.
- To host it yourself, copy the whole `v1/widgets` folder and change the `src`. There are no dependencies.

## Configuration

Every option can be set in three places. If the same option is set twice, the later one wins:

1. A `window.AccessiblesConfig` object, defined before the script loads
2. The script URL: `v1/widgets/accessibles.js?color=...&position=...`
3. `data-` attributes on the `.accessibles-widget` div

Option names ignore case and dashes, so `site-name`, `siteName` and `sitename` all mean the same thing.

```html
<!-- In the script URL -->
<script src="v1/widgets/accessibles.js?color=%237B3F00&position=bottom-left" defer></script>

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
| `icon-color` | automatic | Color of the icon on the button, such as `#FFFFFF`. When set, your `site-icon-url` is shown in this color on the hover card too. By default it's white or near-black, whichever contrasts more with `color`. |
| `bg` | `#000000` | Panel background. Text, borders and highlights adjust to stay readable, so a light `bg` gives you a light panel. |
| `site-name` | none | Your site's name. It's shown as the panel title, in the button's hover card, in the accessibility statement and in issue reports. |
| `site-icon-url` | none | Your site's icon, shown in the panel header and the hover card. It's scaled to fit a circle without cropping. If it fails to load, the favicon is used instead. |
| `position` | `bottom-right` | `bottom-right`, `bottom-left`, `bottom-center`, `top-right`, `top-left`, `top-center`, `right-center` or `left-center`. Short forms such as `right` and typos such as `rigth` or `botom` are understood. |
| `offset` | `20` | Distance from the edge of the screen, in pixels. Use `offsetx` and `offsety` to set each direction separately. |
| `title` | `Accessibility` | Panel title. When `site-name` is set, this becomes the subtitle. |
| `statement` | none | Link to your accessibility statement. It opens inside the panel. Without it, a built-in statement is shown. |
| `report` | none | Where issue reports go. Use an email address to open the visitor's mail app, or a URL to receive a JSON `POST`. The visitor must give a valid email address so you can reply. With an email address, the form then asks whether the email was sent: "Email sent" clears the form and thanks the visitor, "Failed" offers to copy the report or send it again. |
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
<script src="https://uparfait.github.io/accessibility/v1/widgets/accessibles.js?color=%237B3F00&position=bottom-left" defer></script>
```

### A light panel with your site's name and icon

```html
<div class="accessibles-widget"
     data-site-name="Green Valley Library"
     data-site-icon-url="/img/logo.svg"
     data-bg="#FBFAF6"></div>
<script src="https://uparfait.github.io/accessibility/v1/widgets/accessibles.js?color=%232F7A3A" defer></script>
```

### Your own statement and issue reports

```html
<div class="accessibles-widget"
     data-statement="/accessibility"
     data-report="access@example.org"></div>
<script src="https://uparfait.github.io/accessibility/v1/widgets/accessibles.js" defer></script>
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
<script src="https://uparfait.github.io/accessibility/v1/widgets/accessibles.js" defer></script>
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

Inside a view such as Shortcuts or Translate, the back button and title stay reachable: once they scroll out of sight, the panel's top header shows them in place of the site icon and name, and switches back when you scroll up. Nothing in the panel moves while this happens. Search boxes in views stay at the top while their list scrolls, and every search box shows a clear (×) button while it has text. A long site name is shortened with "…", and hovering it shows the full name.

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

Voice commands and Talk & Type listen in the visitor's own language and keep listening until they are turned off. While commands or tips are being read out, a Stop bar appears at the bottom of the screen, the listening bar shows a stop button, and the button that started the list turns into a Stop reading button. `Esc` stops it too. They don't need exact wording: "scrol down" works, and when a command is unclear the visitor is asked "Did you mean …?" and can answer yes or no.

| Moving around | Reading aloud | Talk & Type |
|---|---|---|
| Scroll down / up, Go to top / bottom | Read page, Read this, Read headings | Period, Comma, Question mark, Colon, Dash |
| Click + a name ("Click Contact") | Pause, Continue | Open quote / Close quote, Open bracket / Close bracket |
| Show numbers, then say a number | Next, Previous, Repeat | New line, New paragraph |
| Type + words ("Type anna at mail dot com") | Faster, Slower | Delete that, Delete first word, Delete last word |
| Next field ("Go to next input"), Previous field, Clear field | Stop | Delete last 3 words, Delete + a word ("Delete Tuesday") |
| Press Enter ("Submit") | | Clear from start, Clear to end, Clear all |
| Turn on / Turn off + a name ("Turn on dark contrast") | | Go to next input, Go to previous input |
| Choose + an option ("Choose Membership") | | Press Enter, Send |
| Search for + words, Go to + a website ("Go to wikipedia dot org") | | Stop, What can I say, Stop typing |
| Next / Previous heading, Next link, Zoom in / out | | |
| Go back / forward, Reload, Open menu, Close menu | | |
| Stop, What can I say, Stop listening | | |

"Search for" uses the page's search box. Without one, it finds the words on the page and highlights them; say it again for the next match. With the menu open, it searches the menu's features.

#### Doing a whole task by voice

With these commands a visitor can log in, search, fill in a form and check out without a mouse. For example:

1. "Click Log in"
2. "Type anna at mail dot com", then "Next field", then "Type" and the password
3. "Turn on remember me", then "Press Enter"
4. "Search for blue shoes", then "Click Add to cart", then "Choose Size 40"
5. "Click Checkout", fill in the form the same way, then "Submit"
6. "Click Log out", then "Reload" or "Go back"

#### When it is not sure

If a command could mean more than one thing, a question bar appears at the top of the screen with buttons, and every answer can also be spoken:

- **Did you mean …?** for a command it didn't catch clearly. Say "Yes" or "No". Opening another website always asks first.
- **Several matches**, such as three "Delete" buttons or a word that is in a text box more than once. All matches are outlined and the current one is highlighted, with a count such as "2 / 3". Say "Yes", "Next", "Previous", a number, "All" (for deleting every copy of a word) or "Stop" / "Terminate".

Everything can be stopped: "Stop" or `Esc` ends reading, a question or a choice, and each bar has its own Stop or close button.

Talk & Type types into the text box you clicked. If you haven't chosen one, it uses the first text box on the page, or the menu's search box when the page has none. It adds capital letters at the start of sentences and spaces punctuation correctly. In email fields, "anna at mail dot com" becomes `anna@mail.com`.

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

### Files

Everything lives in `v1/widgets/`. A site adds only `accessibles.js`, which loads the folders next to it. The widget's own parts have their folders, and every feature has a folder of its own. The only globals are `window.Accessibles`, `window.accessibles_core` (the parts the files share) and a flag that stops the widget from loading twice.

The widget's own parts:

| File | What it does |
|---|---|
| `accessibles.js` | The file a site adds. It loads the folders below, which sit next to it |
| `loader/loader.js` | The order of the widget's folders and the folders each feature needs |
| `loader/loader-2.js` | What features add to the widget (styles, filters, actions), and whether a feature has arrived |
| `loader/loader-3.js` | Loads every folder and tells the widget when it can start |
| `helpers/helpers.js` | Small shared tools: timers, finding elements, text and word helpers. Holds `run_later`, `cancel_later`, `find_one`, `find_all`, `escape_html` and more |
| `helpers/helpers-2.js` | Small shared tools, continued: `is_editable`, `humanize`, `make_regex`, `words_of`, `has_letters` and more |
| `helpers/helpers-3.js` | Small shared tools, continued: `native_set_interval`, `latin_like_letters`, `words_pattern`, `letters_pattern`, `edge_punctuation_pattern` and more |
| `config/config.js` | Reads the options from the script URL, the page and window.AccessiblesConfig. Holds `decode_value`, `normalize_key`, `parse_query`, `is_truthy`, `to_number` and more |
| `config/config-2.js` | Reads the options from the script URL, the page and window.AccessiblesConfig, continued: `read_config`, `script_src`, `script_base`, `host` |
| `colors/colors.js` | Color math and the palette made from your brand color. Holds `parse_color`, `luminance`, `contrast_ratio`, `mix_colors`, `to_hex` and more |
| `colors/colors-2.js` | Color math and the palette made from your brand color, continued: `build_palette`, `effective_background`, `color_canvas` |
| `icons/icons.js` | The SVG icons used in the panel. Holds `clear_button_html`, `icon_svg`, `dot_stroke`, `icons` |
| `icons/icons-2.js` | The SVG icons used in the panel, continued |
| `icons/icons-3.js` | The SVG icons used in the panel, continued |
| `catalogue/catalogue.js` | The list of profiles, features and panel tabs. Holds `percent`, `profiles` |
| `catalogue/catalogue-2.js` | The list of profiles, features and panel tabs, continued: `features` |
| `catalogue/catalogue-3.js` | The list of profiles, features and panel tabs, continued: `features_by_id`, `tabs` |
| `help-texts/help-texts.js` | Help texts for every feature and the voice command list. Holds `command_lines`, `command_speech`, `descriptions` |
| `help-texts/help-texts-2.js` | Help texts for every feature and the voice command list, continued: `heading_help`, `view_help`, `commands` |
| `help-texts/help-texts-3.js` | Help texts for every feature and the voice command list, continued |
| `help-texts/help-texts-4.js` | Help texts for every feature and the voice command list, continued |
| `help-texts/help-texts-5.js` | Help texts for every feature and the voice command list, continued: `check_help` |
| `illustrations/illustrations.js` | Small pictures and steps shown in the help window. Holds `guide_lines`, `guide_html`, `guide_words` |
| `illustrations/illustrations-2.js` | Small pictures and steps shown in the help window, continued: `illustrations` |
| `settings/settings.js` | Default settings, saving them and loading them again. Holds `save_settings`, `track_usage`, `defaults`, `visual_keys`, `storage_key` |
| `settings/settings-2.js` | Default settings, saving them and loading them again, continued: `store`, `state`, `drag_position`, `usage`, `voice_was_on` |
| `page-styles/page-styles.js` | Builds the one stylesheet the page gets from every loaded feature. Holds `set_page_css`, `svg_cursor`, `filter_value` |
| `page-styles/page-styles-2.js` | Builds the one stylesheet the page gets from every loaded feature, continued: `build_page_css`, `palette`, `use_top_layer`, `can_adopt_sheets`, `page_sheet` and more |
| `page-fixes/page-fixes.js` | Shared tools for fixing page markup and naming elements. Holds `change_recorder`, `has_own_text`, `collect_text_elements`, `mark_fixed`, `accessible_name` |
| `page-fixes/page-fixes-2.js` | Shared tools for fixing page markup and naming elements, continued: `guess_name`, `accessible_name_attribute`, `find_main` |
| `page-fixes/page-fixes-3.js` | Shared tools for fixing page markup and naming elements, continued: `move_to`, `icon_words` |
| `page-text/page-text.js` | Finds the main text of the page and makes a clean copy of it. Holds `clean_copy` |
| `page-text/page-text-2.js` | Finds the main text of the page and makes a clean copy of it, continued: `main_text`, `reader_keep_tags`, `reader_drop_tags`, `clutter_pattern` |
| `speech/speech.js` | Speaks text aloud for read aloud, voice commands and tips. Holds `british_male_voice`, `male_voice_names`, `female_voice_names`, `voices`, `read_lang` and more |
| `speech/speech-2.js` | Speaks text aloud for read aloud, voice commands and tips, continued: `sync`, `chunks`, `say`, `guide`, `play` |
| `speech/speech-3.js` | Speaks text aloud for read aloud, voice commands and tips, continued: `skip`, `speed`, `read_this`, `read_headings` |
| `speech/speech-4.js` | Speaks text aloud for read aloud, voice commands and tips, continued: `next`, `utter` |
| `speech/speech-5.js` | Speaks text aloud for read aloud, voice commands and tips, continued: `mark`, `pause`, `stop`, `read_page`, `on_click` and more |
| `speech/speech-6.js` | Speaks text aloud for read aloud, voice commands and tips, continued: `on_click`, `on_focus`, `on_select`, `speech_recognition` |
| `pointer/pointer.js` | Follows the mouse or finger for the reading guide, mask and magnifier. Holds `pointer` |
| `typing/typing.js` | Types into page fields for the on-screen keyboard and voice typing. Holds `value_setter`, `current_value`, `set_value`, `insert_text`, `backspace` and more |
| `typing/typing-2.js` | Types into page fields for the on-screen keyboard and voice typing, continued: `clear_side`, `delete_word`, `move_caret`, `press_enter`, `focus_next_field` and more |
| `translation/translation.js` | Translates the panel into the visitor's language. Holds `language_options`, `language_name`, `google_translate_text`, `translate_ui`, `languages` and more |
| `translation/translation-2.js` | Translates the panel into the visitor's language, continued: `pending`, `busy`, `nodes`, `attrs`, `failed` and more |
| `translation/translation-3.js` | Translates the panel into the visitor's language, continued: `flush`, `skip` |
| `translation/translation-4.js` | Translates the panel into the visitor's language, continued: `apply` |
| `changes/changes.js` | Changes a setting and brings the page in line with all settings. Holds `set_state`, `feature_for`, `emit_change`, `schedule_apply`, `step_cycle` |
| `changes/changes-2.js` | Changes a setting and brings the page in line with all settings, continued: `toggle_profile`, `reset_all`, `apply_all` |
| `changes/changes-3.js` | Changes a setting and brings the page in line with all settings, continued: `apply_queued`, `last_page_css` |
| `panel-styles/panel-styles.js` | The stylesheet of the widget itself. Holds `widget_css`, `css_variables` |
| `panel-styles/panel-styles-2.js` | The stylesheet of the widget itself, continued: `widget_css_rules` |
| `panel-styles/panel-styles-3.js` | The stylesheet of the widget itself, continued |
| `panel-styles/panel-styles-4.js` | The stylesheet of the widget itself, continued |
| `panel-styles/panel-styles-5.js` | The stylesheet of the widget itself, continued |
| `panel-styles/panel-styles-6.js` | The stylesheet of the widget itself, continued |
| `panel-styles/panel-styles-7.js` | The stylesheet of the widget itself, continued |
| `panel-styles/panel-styles-8.js` | The stylesheet of the widget itself, continued |
| `panel-styles/panel-styles-9.js` | The stylesheet of the widget itself, continued |
| `panel-styles/panel-styles-10.js` | The stylesheet of the widget itself, continued |
| `panel-styles/panel-styles-11.js` | The stylesheet of the widget itself, continued |
| `panel/panel.js` | The button, the panel, its tabs, tiles, views, help and messages. Holds `toast`, `announce`, `tooltip_bubble` |
| `panel/panel-2.js` | The button, the panel, its tabs, tiles, views, help and messages, continued: `build`, `panel_html` |
| `panel/panel-3.js` | The button, the panel, its tabs, tiles, views, help and messages, continued: `overlays_html`, `show_site_icon`, `scale` |
| `panel/panel-4.js` | The button, the panel, its tabs, tiles, views, help and messages, continued: `launcher_size`, `place_launcher` |
| `panel/panel-5.js` | The button, the panel, its tabs, tiles, views, help and messages, continued: `place_panel` |
| `panel/panel-6.js` | The button, the panel, its tabs, tiles, views, help and messages, continued: `card_icon` |
| `panel/panel-7.js` | The button, the panel, its tabs, tiles, views, help and messages, continued: `show_card`, `hide_card`, `bind`, `bind_launcher_card` |
| `panel/panel-8.js` | The button, the panel, its tabs, tiles, views, help and messages, continued: `bind_launcher_drag`, `bind_launcher_keys` |
| `panel/panel-9.js` | The button, the panel, its tabs, tiles, views, help and messages, continued: `bind_panel_drag`, `bind_panel_events`, `bind_tooltips` |
| `panel/panel-10.js` | The button, the panel, its tabs, tiles, views, help and messages, continued: `bind_help_scroll`, `bind_sliders`, `bind_focus` |
| `panel/panel-11.js` | The button, the panel, its tabs, tiles, views, help and messages, continued: `bind_page_keys`, `bind_resize` |
| `panel/panel-12.js` | The button, the panel, its tabs, tiles, views, help and messages, continued: `on_key`, `on_click` |
| `panel/panel-13.js` | The button, the panel, its tabs, tiles, views, help and messages, continued: `run_action`, `wait_for_feature`, `click_feature`, `click_view`, `on_input` |
| `panel/panel-14.js` | The button, the panel, its tabs, tiles, views, help and messages, continued: `speak_state`, `feature`, `commands`, `say_cmds` |
| `panel/panel-15.js` | The button, the panel, its tabs, tiles, views, help and messages, continued: `show`, `toggle`, `close`, `render_tab`, `profile_html` |
| `panel/panel-16.js` | The button, the panel, its tabs, tiles, views, help and messages, continued: `tab_html`, `tile_html`, `section_heading_html`, `color_row` |
| `panel/panel-17.js` | The button, the panel, its tabs, tiles, views, help and messages, continued: `slider_html`, `format_slider`, `paint_slider`, `set_slider`, `slider_from_pointer` and more |
| `panel/panel-18.js` | The button, the panel, its tabs, tiles, views, help and messages, continued: `selects` |
| `panel/panel-19.js` | The button, the panel, its tabs, tiles, views, help and messages, continued: `select_html`, `options_html`, `after_list`, `open_select`, `close_select` |
| `panel/panel-20.js` | The button, the panel, its tabs, tiles, views, help and messages, continued: `pick_option`, `mark_list`, `palette_colors`, `open_color`, `close_color` |
| `panel/panel-21.js` | The button, the panel, its tabs, tiles, views, help and messages, continued: `pick_color`, `apply_hex`, `sync_clears`, `after_render`, `search` |
| `panel/panel-22.js` | The button, the panel, its tabs, tiles, views, help and messages, continued: `refresh` |
| `panel/panel-23.js` | The button, the panel, its tabs, tiles, views, help and messages, continued: `open_view`, `sync_head`, `tooltip_wanted`, `close_view`, `views` |
| `panel/panel-24.js` | The button, the panel, its tabs, tiles, views, help and messages, continued: `feature_label`, `copy` |
| `panel/panel-25.js` | The button, the panel, its tabs, tiles, views, help and messages, continued: `wrap_buttons`, `translate_wait`, `translate_note`, `busy_list`, `busy_at` and more |
| `panel/panel-26.js` | The button, the panel, its tabs, tiles, views, help and messages, continued: `done_busy`, `help_item`, `feature_on`, `help_words` |
| `panel/panel-27.js` | The button, the panel, its tabs, tiles, views, help and messages, continued: `help_shell`, `open_shell`, `help`, `help_cache`, `help_source` |
| `panel/panel-28.js` | The button, the panel, its tabs, tiles, views, help and messages, continued: `help_translate`, `help_action`, `speech_bar` |
| `panel/panel-29.js` | The button, the panel, its tabs, tiles, views, help and messages, continued: `speech_state` |
| `panel/panel-30.js` | The button, the panel, its tabs, tiles, views, help and messages, continued: `action_features` |
| `panel/panel-31.js` | The button, the panel, its tabs, tiles, views, help and messages, continued: `view_features`, `toast_timer` |
| `page-watch/page-watch.js` | Watches the page for new content and keeps the widget on top. Holds `top_box`, `raise_widget`, `rehome`, `is_modal`, `settle_home` |
| `page-watch/page-watch-2.js` | Watches the page for new content and keeps the widget on top, continued: `watch_top_layer`, `observe_page`, `pending_roots`, `process_roots` |
| `page-watch/page-watch-3.js` | Watches the page for new content and keeps the widget on top, continued: `raising`, `top_box_element`, `host_home` |
| `start/start.js` | Starts the widget once the page is ready. Holds `start`, `add_widget_styles`, `resume_voice` |
| `start/start-2.js` | Starts the widget once the page is ready, continued: `expose_api`, `started` |

The features:

| File | What it does |
|---|---|
| `content-scaling/content-scaling.js` | Content scaling: zooms the whole page |
| `bigger-text/bigger-text.js` | Bigger text: makes the page text larger. Holds `bigger_text`, `sync`, `apply_async`, `run`, `apply` and more |
| `bigger-text/bigger-text-2.js` | Bigger text, continued: `apply_list`, `restore` |
| `fonts/fonts.js` | Font: swaps the page font for an easy-to-read or dyslexia-friendly one. Holds `font_info`, `font_name`, `google_font_url`, `load_font`, `load_font_previews` and more |
| `fonts/fonts-2.js` | Font, continued: `fonts_loaded`, `font_ready`, `previews_loaded`, `font_options` |
| `line-height/line-height.js` | Line height: more space between lines |
| `letter-spacing/letter-spacing.js` | Letter spacing: more space between letters |
| `word-spacing/word-spacing.js` | Word spacing: more space between words |
| `bolder-text/bolder-text.js` | Bolder text: makes the page text heavier |
| `text-align/text-align.js` | Text align: aligns the page text left, center, right or justified |
| `text-direction/text-direction.js` | Text direction: left to right or right to left. Holds `page_direction` |
| `text-direction/text-direction-2.js` | Text direction, continued: `text_direction` |
| `highlight-titles/highlight-titles.js` | Highlight titles: outlines every heading |
| `highlight-links/highlight-links.js` | Highlight links: underlines and outlines every link |
| `magnifier/magnifier.js` | Text magnifier: shows the text under the pointer in large letters |
| `dark-contrast/dark-contrast.js` | Dark contrast: light text on a dark page |
| `light-contrast/light-contrast.js` | Light contrast: dark text on a light page |
| `high-contrast/high-contrast.js` | High contrast: stronger contrast for the whole page |
| `smart-contrast/smart-contrast.js` | Smart contrast: fixes only the text that is hard to read. Holds `smart_contrast` |
| `invert-colors/invert-colors.js` | Invert colors: reverses the page colors |
| `monochrome/monochrome.js` | Monochrome: shows the page in grays |
| `low-saturation/low-saturation.js` | Low saturation: softer, muted colors |
| `high-saturation/high-saturation.js` | High saturation: stronger, vivid colors |
| `color-blindness/color-blindness.js` | Color blindness: color filters for protanopia, deuteranopia and tritanopia. Holds `build_color_blind_svg`, `color_blind_svg` |
| `custom-colors/custom-colors.js` | Custom colors: your own background, text and title colors |
| `brightness/brightness.js` | Brightness: makes the page lighter or darker |
| `keyboard-navigation/keyboard-navigation.js` | Keyboard navigation: skip links, focusable controls and shortcuts. Holds `keyboard_navigation` |
| `focus-highlight/focus-highlight.js` | Focus highlight: a strong outline on the focused element |
| `hover-highlight/hover-highlight.js` | Highlight hover: a frame around what is under the pointer. Holds `hover_highlight` |
| `page-structure/page-structure.js` | Page structure: headings, landmarks and links to jump to. Holds `go_struct` |
| `big-black-cursor/big-black-cursor.js` | Big black cursor: a large black mouse pointer |
| `big-white-cursor/big-white-cursor.js` | Big white cursor: a large white mouse pointer |
| `on-screen-keyboard/on-screen-keyboard.js` | On-screen keyboard: type with clicks or taps. Holds `on_screen_keyboard`, `rows`, `render`, `press` |
| `on-screen-keyboard/on-screen-keyboard-2.js` | On-screen keyboard, continued: `bind`, `bind_resize`, `sync`, `vkb_target` |
| `voice/voice.js` | Voice: listens to the microphone and answers questions for voice commands and talk & type. Holds `normalize_words`, `edit_ratio`, `word_match`, `sure_score`, `maybe_score` and more |
| `voice/voice-2.js` | Voice, continued: `sync`, `start` |
| `voice/voice-3.js` | Voice, continued: `listen`, `halt` |
| `voice/voice-4.js` | Voice, continued: `stop`, `hearing_self`, `heard_speech`, `local`, `prepare` and more |
| `voice/voice-5.js` | Voice, continued: `best`, `heard`, `act`, `confirm`, `answer` |
| `voice/voice-6.js` | Voice, continued: `reply`, `next_words`, `previous_words`, `stop_words_list`, `all_words` and more |
| `voice/voice-7.js` | Voice, continued: `end_pick`, `pick_answer`, `stop_all` |
| `voice/voice-8.js` | Voice, continued: `pill`, `ask` |
| `voice-commands/voice-commands.js` | Voice commands: control the page by speaking. Holds `search_page`, `find_on_page` |
| `voice-commands/voice-commands-2.js` | Voice commands, continued: `nav_cmds`, `slots`, `top_level_domains` |
| `voice-commands/voice-commands-3.js` | Voice commands, continued: `site_from` |
| `voice-commands/voice-commands-4.js` | Voice commands, continued: `guess_nav` |
| `voice-commands/voice-commands-5.js` | Voice commands, continued: `guess_click` |
| `voice-commands/voice-commands-6.js` | Voice commands, continued: `guess_toggle`, `enter`, `clear_field`, `clickables` |
| `voice-commands/voice-commands-7.js` | Voice commands, continued: `show_numbers`, `hide_numbers`, `last_find` |
| `talk-and-type/talk-and-type.js` | Talk & type: type into fields by speaking. Holds `dict_cmds`, `type` |
| `talk-and-type/talk-and-type-2.js` | Talk & type, continued: `delete_ask`, `pick_field`, `write` |
| `talk-and-type/talk-and-type-3.js` | Talk & type, continued: `punctuate`, `undo`, `field`, `send`, `spoken_punctuation` |
| `bigger-targets/bigger-targets.js` | Bigger targets: larger buttons, links and checkboxes |
| `more-time/more-time.js` | More time: stretches page timers. Holds `more_time` |
| `read-aloud/read-aloud.js` | Read aloud: reads the page, a selection or what you click |
| `reading-guide/reading-guide.js` | Reading guide: a line that follows the pointer |
| `reading-mask/reading-mask.js` | Reading mask: darkens all but a band around the pointer |
| `stop-animations/stop-animations.js` | Stop animations: pauses motion, videos and GIFs |
| `stop-animations/stop-animations-2.js` | Stop animations, continued: `stop_animations` |
| `hide-images/hide-images.js` | Hide images: hides pictures and shows their descriptions. Holds `hide_images` |
| `mute-sounds/mute-sounds.js` | Mute sounds: silences audio and video. Holds `mute_sounds` |
| `tooltips/tooltips.js` | Tooltips: shows titles and image descriptions on hover. Holds `tooltips` |
| `spoken-tips/spoken-tips.js` | Spoken tips: short spoken help when a feature turns on. Holds `say_tip` |
| `reader-view/reader-view.js` | Reader view: the page text in a clean, simple layout. Holds `reader`, `reader_theme`, `reader_size`, `reader_font` |
| `dictionary/dictionary.js` | Dictionary: double-click a word to see its meaning. Holds `dictionary`, `cache`, `sync`, `word`, `on_double_click` and more |
| `dictionary/dictionary-2.js` | Dictionary, continued: `glossary`, `lookup`, `on_double_click`, `on_up`, `on_key_up` |
| `dictionary/dictionary-3.js` | Dictionary, continued: `dict` |
| `page-summary/page-summary.js` | Page summary: the key points of the page. Holds `extractive_summary` |
| `page-summary/page-summary-2.js` | Page summary, continued: `summarize`, `stop_words`, `stop_word_set` |
| `sign-language/sign-language.js` | Sign language: ASL videos and the Libras avatar. Holds `sign_language`, `statuses`, `report`, `sync`, `asl` and more |
| `sign-language/sign-language-2.js` | Sign language, continued: `on_click`, `provide`, `native_libras` |
| `sign-language/sign-language-3.js` | Sign language, continued: `load_libras` |
| `sign-language/sign-language-4.js` | Sign language, continued: `remove_libras`, `on_click`, `sign_row`, `sign_status`, `sign_player` |
| `sign-language/sign-language-5.js` | Sign language, continued |
| `translate/translate.js` | Translate: translates the page into another language. Holds `page_translation`, `page_lang`, `is_translated`, `run` |
| `translate/translate-2.js` | Translate, continued: `measure`, `wait_done` |
| `translate/translate-3.js` | Translate, continued: `load`, `google` |
| `translate/translate-4.js` | Translate, continued: `ensure_box`, `restore` |
| `aria-fixes/aria-fixes.js` | ARIA fixes: adds missing roles, names and landmarks. Holds `aria_fixes`, `sync`, `fix`, `fix_landmarks`, `fix_controls` |
| `aria-fixes/aria-fixes-2.js` | ARIA fixes, continued: `fix_frames_and_tables`, `fix_links_and_messages` |
| `image-descriptions/image-descriptions.js` | Image descriptions: adds missing image descriptions. Holds `image_descriptions` |
| `form-fixes/form-fixes.js` | Form fixes: labels fields and announces errors. Holds `form_fixes`, `sync`, `nearby_text` |
| `form-fixes/form-fixes-2.js` | Form fixes, continued: `fix` |
| `feature-position/feature-position.js` | Feature position: moves the button to another corner |
| `page-check/page-check.js` | Page check: an accessibility check of the page with a score. Holds `audit_steps`, `run_audit`, `run_audit_async` |
| `page-check/page-check-2.js` | Page check, continued: `audit_checks` |
| `page-check/page-check-3.js` | Page check, continued: `mark_check` |
| `report-issue/report-issue.js` | Report an issue: sends a problem report by email or to your server. Holds `report_text`, `report_state` |
| `report-issue/report-issue-2.js` | Report an issue, continued: `send_report` |
| `accessibility-statement/accessibility-statement.js` | Accessibility statement: the statement window or your own page. Holds `statement` |

### Staying out of the page's way

The panel has to recolor, zoom and invert the whole page while staying readable itself, and the site's CSS must never break it. Four things make that work:

- **Shadow DOM.** The panel renders inside a shadow root, so page styles can't reach in and panel styles can't leak out.
- **Outside `<body>`.** The mount element is moved to be a direct child of `<html>`. Zoom, fonts and color overrides target `body`, so they never touch the panel.
- **The top layer.** The mount element becomes a `popover` and is shown with `showPopover()`. Color filters go on `<html>`, and the browser paints the top layer outside that filter. This also keeps `position: fixed` headers on the page working, which a filter on `body` would break.
- **Always on top.** The mount element has the highest possible `z-index` (larger values set by a site are capped to the same number, and the widget comes last in the page), and the top layer is above any `z-index` anyway. If the page or an extension later puts its own popup or a full-screen element in the top layer, the widget moves back above it. While a page shows a modal dialog, which makes everything outside it unclickable, the widget moves inside the dialog and returns when it closes. Inside the widget, layers are stacked by importance, from bottom to top: the reader view, the reading mask (it darkens content, never the panel), the panel, page aids and popups (reading guide, hover frame, magnifier, voice numbers, dictionary, sign video), the help window, the control bars (keyboard, read aloud and Stop bars, listening bar, question bar, so you can always stop or answer), pickers, short messages, tooltips, and the button. The reader view counts as page content, so the dictionary, magnifier, hover frame, reading mask and read aloud all work inside it. The Libras interpreter, which the widget adds to the page, lives in a second top-layer box with the same rules, so it is never covered either. The "Skip to main content" link stays at the start of the page, so it is the first thing Tab reaches, and uses the highest `z-index`.
- **CSP-safe styles.** Both stylesheets are attached with `adoptedStyleSheets`, and dynamic values are set through `element.style`. Strict `style-src` policies allow both.

### Settings

All settings live in one object. Every change goes through `set_state(key, value)`, which saves the value, fires `accessibles:change` and schedules `apply_all()`. That function rebuilds the page stylesheet and calls `sync()` on each feature. Each feature compares the settings with what it last applied and turns itself on, off or updates. Features that do slow work return a promise, and the pressed control shows a spinner until they finish.

```js
// The pattern every feature follows
core.mute_sounds = {
  on: false,
  sync: function () {
    if (core.state.mute && !this.on) this.enable();
    else if (!core.state.mute && this.on) this.disable();
  }
};
```

Settings are saved in `localStorage` under `accessibles.v1`, with a cookie as a fallback. With "Remember settings" off, they last only for the session. Voice input never comes back on by itself unless the microphone is already allowed.

### Changes that can be undone

The automatic repairs never set an attribute directly. They go through a recorder that saves the old value first:

```js
recorder.set(image, 'alt', 'Team photo 2019');   // remembers that the image had no alt
recorder.revert();                                // puts every attribute back
```

Turning a repair off returns the page to exactly how it was. Repaired elements are tagged with `data-acc-fixed`, so the page check can report them as "fixed automatically".

### Bigger text

CSS can't reliably scale every font size, because sites mix `px`, `em`, `rem` and inline styles. So Bigger text measures the computed size of every element that holds text, then writes the scaled size inline. It measures everything before writing anything, keeps the original values in a `WeakMap`, and works in batches on large pages.

### Colors

The panel's colors all come from two inputs, `color` and `bg`. Text, borders and highlights are mixed from them and then nudged toward black or white until they meet WCAG contrast ratios: 12:1 for text and 4.6:1 for highlights. A pale brand color on a white panel still produces readable controls.

### New content

A `MutationObserver` watches the page. New elements are collected, and after a short pause every active feature fixes just those parts. Single-page apps and infinite scrolling work without extra setup.

## External services

Nothing external loads until a visitor turns on the feature that needs it.

| Feature | Uses | If it's unavailable |
|---|---|---|
| Panel font | Figtree from Google Fonts | System font |
| Translate | Google's website translator and translation endpoint | A message explains why |
| Voice commands, Talk & Type | Web Speech API | A message. Firefox has no speech recognition. |
| Read aloud | `speechSynthesis` | A message. Voices depend on the device. |
| Dictionary | Your glossary, `<abbr>` on the page, dictionaryapi.dev, Wikipedia | "No definition found" |
| Page summary | Your hook, the browser's Summarizer, or an on-device summary | Always works offline |
| Sign language | VLibras for Libras, your videos for ASL | The status line explains what failed |
| Fonts | Google Fonts | Similar system fonts |

## Browser support

Current Chrome, Edge, Firefox and Safari, on desktop and mobile. In a browser without Shadow DOM, the script does nothing.

A toolbar helps visitors adapt a page, but it doesn't make an inaccessible site compliant by itself. Run the page check, then fix what it finds in your own code.

## Project files

| File | Purpose |
|---|---|
| `v1/widgets/` | The widget. `accessibles.js` is the only file a site adds; the folders next to it hold the rest (see Files above). |
| `index.html`, `favicon.svg`, `assets/`, `site.webmanifest`, `sitemap.xml` | The project website, its icons and share image |
| `demo.html`, `demo.css` | A demo page with old-style markup and placeholder text, to show the widget needs no changes to the page |

To work on it locally, serve the folder with any static server and open `demo.html`:

```bash
npx serve .
```

### Things to check after a change

- Open the panel at 300, 360, 768, 1280 and 1440 pixels wide.
- Turn every feature on and off. The panel must stay readable, and every spinner must stop.
- Turn every profile on and off. `Accessibles.get()` should return the original settings afterwards.
- With invert, dark contrast and 125% scaling on, the panel should look unchanged.
- Translate the page, reload, then choose "Original language".
- Try voice commands in Chrome with a slightly wrong command, such as "scrol down".
- Test on a page with a strict Content Security Policy, a page without the mount `div`, and with the script injected asynchronously.
