/* panel-styles/panel-styles-2.js: The stylesheet of the widget itself, continued */
accessibles_core.define('panel-styles/panel-styles-2.js', [], function (core) {
  'use strict';
  // Every rule of the widget's stylesheet, in order
  core.widget_css_rules = [
    function (palette) { return '.r{' + core.css_variables(palette.vars) + ';--font:"Figtree",ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif;--r:.85em;position:absolute;inset:0;pointer-events:none;font-family:var(--font);font-size:15px;line-height:1.45;font-weight:400;color:var(--text);text-align:left;letter-spacing:normal;word-spacing:normal;-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;text-size-adjust:100%;cursor:auto}' },
    '.r *,.r *::before,.r *::after{box-sizing:border-box;margin:0;padding:0;border:0;font:inherit;color:inherit;letter-spacing:inherit;text-transform:none;text-decoration:none;text-shadow:none;max-width:none;float:none;animation:none!important;transition:none!important;scroll-behavior:auto!important}',
    '[hidden]{display:none!important}',
      // Fixed stacking order inside the widget: mask, reader, panel, help, page aids and bars, pickers, then the button
      // Bottom to top: reader view (replaces the page), reading mask (darkens content, never the panel), panel,
      // page aids and popups, help window, control bars (always reachable to stop or answer), pickers, messages, tooltips, button
    '.reader{z-index:1}.mask-t,.mask-b{z-index:2}.panel{z-index:3}',
    '.guide,.hl,.lens,.nums,.dict,.signp{z-index:4}.help{z-index:5}.vkb,.bar-bottom,.pill,.ask{z-index:6}',
    '.cs-pop,.cp-pop{z-index:7}.toast{z-index:8}.tip{z-index:9}.lcard{z-index:10}.launch{z-index:11}',
    '.ib,.hb,.clr,.pick,.swb,.grip,.brandmark,.pi,.help-ico,.st,.ck,.prev{flex:none!important;aspect-ratio:1/1;border-radius:50%!important}',
    '.cp-grid button{aspect-ratio:1/1;border-radius:50%!important}',
    '.r ::selection{background:var(--accent);color:var(--accent-ink)}',
    '.r .rbody ::selection{background:var(--p);color:var(--p-ink)}',
    '.sl,.vkb,.cp-row .inp{direction:ltr}',
    '[dir="rtl"] .hb{right:auto;left:.35em}',
    '[dir="rtl"] .tile .ck,[dir="rtl"] .tile .go,[dir="rtl"] .bz{right:auto;left:.6em}',
    '[dir="rtl"] .prow{padding-right:.75em;padding-left:5.4em}',
    '[dir="rtl"] .prow-w .hb{right:auto;left:3.45em}',
    '[dir="rtl"] .prow-w .sw{right:auto;left:.75em}',
    '[dir="rtl"] .prow-w .bz{right:auto;left:.95em}',
    '[dir="rtl"] .sw::after{left:auto;right:.18em}',
    '[dir="rtl"] .prow-w.on .sw::after{transform:translateX(-.95em)}',
    '[dir="rtl"] .search .i,[dir="rtl"] .qbox .i{left:auto;right:.8em}',
    '[dir="rtl"] .cs-pop .q .i{left:auto;right:1.25em}',
    '[dir="rtl"] .search input,[dir="rtl"] .qbox .inp,[dir="rtl"] .cs-pop .q input{padding-left:.75em;padding-right:2.3em}',
    '[dir="rtl"] .go .i,[dir="rtl"] .vh .ib .i,[dir="rtl"] .linkrow .i:last-child{transform:scaleX(-1)}',
    '[dir="rtl"] .tb,[dir="rtl"] .shb,[dir="rtl"] .opt,[dir="rtl"] .cs-btn{text-align:right}',
    'button{appearance:none;-webkit-appearance:none;background:none;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;text-align:inherit}',
    '.r button,.r a,.r label,.r [role="option"],.r [role="slider"],.r [role="switch"],.r .swb,.r .pick,.r .key,.r .cs-btn{cursor:pointer}',
    '.r input[type="text"],.r input[type="search"],.r input[type="email"],.r textarea{cursor:text}',
    '.r.cur-black,.r.cur-black *{cursor:' + core.svg_cursor('#000', '#fff', 'arrow') + ',auto!important}',
    '.r.cur-black :is(button,a,label,[role="option"],[role="slider"],.swb,.pick,.key,.cs-btn,.launch){cursor:' + core.svg_cursor('#000', '#fff', 'hand') + ',pointer!important}',
    '.r.cur-white,.r.cur-white *{cursor:' + core.svg_cursor('#fff', '#000', 'arrow') + ',auto!important}',
    '.r.cur-white :is(button,a,label,[role="option"],[role="slider"],.swb,.pick,.key,.cs-btn,.launch){cursor:' + core.svg_cursor('#fff', '#000', 'hand') + ',pointer!important}',
    '.r.focus-strong :focus-visible:not([tabindex="-1"]):not(.panel){outline:3px solid var(--accent)!important;outline-offset:2px!important}',
    '.r.focus-strong :is(.tab,.opt,.tm,.prow,.seg button):focus-visible{outline-offset:-3px!important}',
    '.panel:focus,.vh h2:focus,.body:focus,.help:focus,.help h2:focus{outline:none}',
    'button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,a:focus-visible,[tabindex]:focus-visible{outline:2px solid var(--accent);outline-offset:2px}',
    '.i{display:block;width:1.3em;height:1.3em;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;flex:none}',
      // launcher
    '.launch{position:absolute;left:0;top:0;width:2.9em;height:2.9em;border-radius:.8em;background:var(--p);color:var(--p-ink);display:grid;place-items:center;pointer-events:auto;box-shadow:0 .35em 1.1em var(--p-shadow),0 0 0 1px var(--p-edge);touch-action:none;user-select:none;-webkit-user-select:none}',
    '.launch .i{width:1.75em;height:1.75em;stroke-width:1.6}',
      // Hover card: opens beside the small button and names the site
      // It grows out from under the button: it starts clipped to the button's square and opens to full width
    '.lcard{position:absolute;left:0;top:0;display:flex;align-items:center;gap:.6em;height:2.9em;max-width:min(20em,calc(100vw - 16px));border-radius:.8em;background:var(--p);color:var(--p-ink);box-shadow:0 .35em 1.1em var(--p-shadow),0 0 0 1px var(--p-edge);text-align:start;visibility:hidden;opacity:0;pointer-events:none;transition:clip-path .32s cubic-bezier(.2,.8,.2,1),opacity .2s ease,visibility 0s linear .32s!important}',
    '.lcard.tl{padding:0 3.6em 0 .4em;clip-path:inset(0 0 0 calc(100% - 2.9em) round .8em)}',
    '.lcard.tr{padding:0 1em 0 3.35em;clip-path:inset(0 calc(100% - 2.9em) 0 0 round .8em)}',
    '.lcard.show{visibility:visible;opacity:1;pointer-events:auto;clip-path:inset(0 0 0 0 round .8em);transition:clip-path .32s cubic-bezier(.2,.8,.2,1),opacity .14s ease,visibility 0s!important}',
    '.launch.carded,.launch.carded:hover{filter:none;box-shadow:none}',
    '@media (prefers-reduced-motion:reduce){.lcard,.lcard.show{transition:none!important}}',
    '.r.still .lcard,.r.still .lcard.show{transition:none!important}',
    '.lc-ico{width:2.15em;height:2.15em;border-radius:50%;flex:none;display:grid;place-items:center;overflow:hidden;background:none;color:var(--p-ink)}'
  ];
});
