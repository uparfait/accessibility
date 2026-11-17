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
