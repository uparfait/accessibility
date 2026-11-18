/* panel-styles/panel-styles-3.js: The stylesheet of the widget itself, continued */
accessibles_core.define('panel-styles/panel-styles-3.js', [], function (core) {
  'use strict';
  core.widget_css_rules.push(
    '.lc-ico .i{width:1.75em;height:1.75em}',
    '.lc-ico.sk .spin{width:1.4em;height:1.4em;color:var(--p-ink)}',
    '.lc-t{display:flex;flex-direction:column;min-width:0;line-height:1.2}',
    '.lc-n{font-size:.86em;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.lc-s{font-size:.72em;font-weight:500;opacity:.88;white-space:nowrap}',
    '.launch:hover{filter:brightness(1.08)}',
    '.launch.under{visibility:hidden}',
    '.launch:focus-visible{outline:3px solid var(--accent);outline-offset:3px}',
    '.launch.dragging{cursor:grabbing!important;box-shadow:0 .6em 1.6em var(--p-shadow)}',
    '.launch .dot{position:absolute;top:.22em;right:.22em;width:.72em;height:.72em;border-radius:50%;background:var(--p-ink);box-shadow:0 0 0 .18em var(--p)}',
      // panel
    '.panel{position:absolute;left:0;top:0;width:min(27em,calc(100vw - 16px));display:flex;flex-direction:column;background:var(--bg);color:var(--text);border:1px solid var(--line);border-radius:1.1em;box-shadow:var(--shadow);pointer-events:auto;overflow:hidden}',
    '.head,.search,.tabs,.foot{flex:0 0 auto}',
    '.head{display:flex;align-items:center;gap:.4em;padding:.8em .8em .55em 1.1em;user-select:none;-webkit-user-select:none}',
    '.head.grab{cursor:grab}',
    '.brandmark{width:2.2em;height:2.2em;border-radius:50%;background:var(--soft);color:var(--accent);display:grid;place-items:center;flex:none;overflow:hidden}',
    '.brandmark .i{width:1.4em;height:1.4em}',
      // A site icon is shown as it is: no background behind it, scaled to fit its round space so no part is cut off
    '.brandmark img,.lc-ico img{width:100%;height:100%;object-fit:contain;display:block;background:none!important;border-radius:0}',
      // With icon-color set, the site icon on the card is drawn in that color through a mask
    '.lc-mask{display:block;width:100%;height:100%;background:currentColor}',
    '.bm-mask{display:block;width:100%;height:100%;background:var(--mark)}',
    '.brandmark.img,.lc-ico.img{background:none!important;box-shadow:none!important;overflow:visible}',
    '.htxt{flex:1;min-width:0;padding-left:.4em}',
    '.hslot{position:relative;flex:1;min-width:0;display:flex;align-items:center;align-self:stretch}',
    '.hmain{display:flex;align-items:center;gap:.4em;flex:1;min-width:0}',
    '.hview{position:absolute;inset:0;display:flex;align-items:center;gap:.3em;margin-left:-.35em;min-width:0;visibility:hidden;opacity:0}',
    '.hview .title{flex:1;min-width:0}.hview .tb{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:inline-flex}',
    '.head.compact .hview{visibility:visible;opacity:1}.head.compact .hmain{visibility:hidden;opacity:0}',
      // A short cross-fade, the same length both ways; none for reduced motion or with animations stopped
    '.hmain,.hview{transition:opacity .16s ease,visibility 0s linear .16s!important}',
    '.head.compact .hview,.head:not(.compact) .hmain{transition:opacity .16s ease,visibility 0s!important}',
    '@media (prefers-reduced-motion:reduce){.hmain,.hview,.head.compact .hview,.head:not(.compact) .hmain{transition:none!important}}',
    '.r.still .hmain,.r.still .hview{transition:none!important}',
    '.title{display:block;font-weight:650;font-size:1.06em;letter-spacing:-.005em;line-height:1.25;min-width:0}',
    '.tb,.shb{display:inline-flex;align-items:center;gap:.35em;max-width:100%;padding:.15em .5em;margin:-.15em -.5em;border-radius:999px;color:inherit;font:inherit;text-align:left}',
    '.tb:hover,.shb:hover{background:var(--hover)}',
    '.tb .i,.shb .i{width:.95em;height:.95em;color:var(--muted);flex:none}',
    '.title .tb{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:inline-flex}',
    '.subtitle{display:block;font-size:.76em;color:var(--muted);line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.ib{width:2.3em;height:2.3em;border-radius:50%;display:grid;place-items:center;color:var(--muted);flex:none}',
    '.ib:hover{background:var(--hover);color:var(--text)}',
    '.ib .i{width:1.2em;height:1.2em}',
    '.search{position:relative;margin:.15em 1.1em .7em}',
    '.search .i{position:absolute;left:.75em;top:50%;transform:translateY(-50%);width:1.05em;height:1.05em;color:var(--muted);pointer-events:none}',
    '.search input{width:100%;height:2.5em;border:1px solid var(--line-2);border-radius:.7em;background:var(--field);padding:0 .8em 0 2.3em;font-size:.93em;color:var(--text);outline:none;-webkit-appearance:none;appearance:none}',
    '.search input::placeholder{color:var(--muted);opacity:1}',
    '.sclr{position:absolute;right:.45em;top:50%;transform:translateY(-50%);width:1.75em;height:1.75em;border-radius:50%;display:grid;place-items:center;color:var(--muted);z-index:1}',
    '.sclr:hover{background:var(--hover);color:var(--text)}',
      // The search icon rules place every icon in the box at the left; the × stays centred in its button
    '.sclr .i{position:static!important;transform:none!important;width:.9em!important;height:.9em!important;margin:0!important;stroke-width:2.2}'
  );
});
