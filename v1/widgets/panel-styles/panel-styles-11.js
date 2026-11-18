/* panel-styles/panel-styles-11.js: The stylesheet of the widget itself, continued */
accessibles_core.define('panel-styles/panel-styles-11.js', [], function (core) {
  'use strict';
  core.widget_css_rules.push(
    '.ask .ap{color:var(--muted);font-variant-numeric:tabular-nums}',
    '@media (max-width:560px){.ask{flex-wrap:wrap;justify-content:center;border-radius:1em}.ask .aq{white-space:normal;text-align:center}}',
    '.btn.sm{height:2.2em;padding:0 1em;font-size:.9em}',
    '.cmd-h{display:flex;align-items:center;justify-content:space-between;gap:.5em}.cmd-h .sh{margin:0}',
    '.cmd-need{font-size:.8em;color:var(--muted);margin:.15em 0 .5em}',
    '.kl.cmd{flex-direction:column;align-items:flex-start;gap:.15em}.kl.cmd .cn{white-space:nowrap}.kl.cmd .cd{color:var(--muted);text-align:start;font-size:.9em}.kl.cmd .cx{color:var(--accent);font-size:.86em}',
      // No sideways scrolling anywhere in the widget
    '.r .body,.r .help-main,.r .opts,.r .dict,.r .reader,.r .cs-pop,.r .signp{overflow-x:hidden!important}',
      // Long words, addresses and links wrap onto the next line instead of widening their box
    '.r p,.r li,.r dd,.r dt,.r .empty,.r .hint,.r .prose,.r .help-text,.r .dict .dd,.r .dict strong,.r .lens,.r .tip,.r .toast,.r .status,.r .cmd-need,.r .kl.cmd .cd,.r .kl.cmd .cx,.r .chk .cb,.r .tr-note span,.r .field,.r .wait span,.r .sgs span,.r .help h2,.r .rbody{overflow-wrap:anywhere;word-break:break-word}',
      // Tables and code in the reader view fit its width
    '.r .rbody table{display:table;table-layout:fixed;width:100%;overflow:visible}.r .rbody td,.r .rbody th{overflow-wrap:anywhere}.r .rbody pre,.r .rbody code{white-space:pre-wrap;overflow-wrap:anywhere}',
      // Category tabs wrap to a second row if they ever do not fit (long translations, larger features)
    '.tabs{flex-wrap:wrap;overflow:visible}',
      // Rows of two or more buttons split their width equally; a single button keeps its own size
    '.btns:not([hidden]){display:grid!important;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);gap:.5em}.btns>.btn{min-width:0;width:100%}',
    '.btns>.btn:only-child{justify-self:start;width:auto}.btns.center>.btn:only-child{justify-self:center}',
      // The question bar: Yes / No (and Previous / Next / All) the same width, sized to the longest
    '.ask .ab{display:grid;grid-auto-flow:column;grid-auto-columns:1fr}.ask .ab>.btn{min-width:0}',
    '@media (forced-colors:active){.tile.on,.prow.on{outline:2px solid Highlight}.launch{border:2px solid ButtonText}}',
      // Text boxes and drop-down lists: no border at rest, a clear border on hover, the accent color while in use. Never a ring outside
    '.r :is(input:not([type="checkbox"]):not([type="radio"]),textarea,.cs-btn):not([aria-invalid="true"]){border-color:transparent!important;box-shadow:none!important;outline:none!important;caret-color:var(--accent)}',
    '.r :is(input:not([type="checkbox"]):not([type="radio"]),textarea,.cs-btn):not([aria-invalid="true"]):hover{border-color:var(--muted)!important}',
    '.r :is(input:not([type="checkbox"]):not([type="radio"]),textarea,.cs-btn):not([aria-invalid="true"]):is(:focus,[aria-expanded="true"]){border-color:var(--accent)!important;box-shadow:inset 0 0 0 1px var(--accent)!important}',
    '.r input:-webkit-autofill:focus{-webkit-box-shadow:inset 0 0 0 1px var(--accent),0 0 0 1000px var(--field) inset!important;box-shadow:inset 0 0 0 1px var(--accent),0 0 0 1000px var(--field) inset!important}',
      // Text boxes and drop-down lists are fully rounded; text areas keep their soft corners
    '.r :is(input:not([type="checkbox"]):not([type="radio"]),.cs-btn){border-radius:999px!important}.r :is(.inp,.field input,.cs-btn):not(.qbox .inp){padding-left:1.1em;padding-right:1.1em}',
      // Small screens: larger text in fields and lists, and more room around the panel's content
    '@media (max-width:599px){.head{padding:.95em .95em .65em 1.25em}.search{margin:.25em 1.25em .85em}.tabs{flex-wrap:nowrap;overflow-x:auto;justify-content:space-between;padding:0 .7em}.tab{padding:.55em .45em;font-size:.84em}.body{padding:1.15em 1.25em 1.5em}.foot{padding:.8em 1.25em;font-size:.84em}}',
    '@media (max-width:599px){.r :is(.search input,.inp,.cs-pop .q input,.field input,.field textarea){font-size:16px}.r .cs-btn{font-size:15px;height:2.8em}.r .opt{font-size:.95em;padding:.7em .75em}.r .biglist .opt{padding:.8em .8em}}',
    '@media (max-width:599px){.btns>.btn{height:auto;min-height:2.6em;padding:.55em .9em;line-height:1.25}.btns>.btn .bl{white-space:normal;overflow:visible;text-align:center}}',
      // The spoked spinner next to loading text
    '.dict .dd .spin,.signp .sh2 .spin{width:1.15em;height:1.15em;flex:none;vertical-align:-.2em;margin-right:.45em}',
      // Everything stays on screen on every device: sizes come from the visible screen (not 100vw/100vh, which count scrollbars and browser bars)
    '.panel{width:min(27em,calc(100% - 16px))}.lcard{max-width:min(20em,calc(100% - 16px))}.guide{width:min(34em,calc(100% - 24px))}.mask-t{height:40%}.mask-b{top:60%}',
    '.lens{max-width:min(30em,calc(100% - 16px));max-height:calc(100% - 16px);overflow:hidden}.tip{max-width:min(18em,calc(100% - 24px))}',
    '.bar-bottom{max-width:calc(100% - 16px)}.pill,.ask{max-width:calc(100% - 24px)}.toast{max-width:min(26em,calc(100% - 24px))}',
    '.vkb{width:min(46em,calc(100% - 16px));max-height:calc(100% - 16px);overflow:auto}.dict{width:min(21em,calc(100% - 16px));max-height:min(24em,60%)}',
    '.signp{width:min(19em,calc(100% - 24px));max-height:calc(100% - 24px);overflow:auto}.cs-pop,.cp-pop{max-width:calc(100% - 16px);max-height:calc(100% - 16px)}',
      // The help window is as tall as its content, between a smallest height and its largest; the bottom space never grows
    '.help-win{width:80%;height:auto;min-height:min(18em,calc(100% - 16px));max-width:calc(100% - 16px);max-height:80%}.help-main{padding-bottom:1.4em}',
    '@media (max-width:1023px){.help-win{width:90%;max-height:85%}}@media (max-width:640px){.help-win{width:calc(100% - 16px);max-height:calc(100% - 16px)}}',
    '.help-win:has(.help-frame){height:100%}',
      // Header titles stay on one line, centered with their icon, and get a little smaller on narrow screens instead of breaking
    '.head,.vh,.help-head{container-type:inline-size;align-items:center}.htxt,.help-ht{display:flex;flex-direction:column;justify-content:center}',
    '.title{font-size:clamp(.92em,5.4cqi,1.06em)}.vh h2{font-size:clamp(.9em,5cqi,1em)}.help h2{font-size:clamp(1em,5.6cqi,1.25em)}',
    '.title,.vh h2,.help h2,.help-kind,.subtitle{white-space:nowrap!important;overflow:hidden;text-overflow:ellipsis;word-break:normal!important;overflow-wrap:normal!important}',
    '@media (max-width:599px){.panel{width:calc(100% - 24px)!important}}',
      // Placeholder text stays quiet, so it never competes with what was typed
    '.r ::placeholder{color:var(--muted)!important;opacity:.55!important}'
  );
});
