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
    '@media (forced-colors:active){.tile.on,.prow.on{outline:2px solid Highlight}.launch{border:2px solid ButtonText}}'
  );
});
