/* panel-styles/panel-styles-12.js: The stylesheet of the widget itself, continued */
accessibles_core.define('panel-styles/panel-styles-12.js', [], function (core) {
  'use strict';
  core.widget_css_rules.push(
      // The For more menu opens above the footer
    '.more-wrap{position:relative}.foot .more-btn{display:inline-flex;align-items:center;gap:.4em}.more-btn .i{width:1.1em;height:1.1em}.more-btn .more-arrow{transform:rotate(-90deg)}.more-btn[aria-expanded=true] .more-arrow{transform:rotate(90deg)}' +
    '.more-list{position:absolute;left:-.6em;bottom:calc(100% + .7em);z-index:5;display:flex;flex-direction:column;min-width:15em;padding:.35em;background:var(--bg);border:1px solid var(--line-2);border-radius:.8em;box-shadow:var(--shadow)}.more-list[hidden]{display:none}' +
    '.foot .more-list button{display:flex;align-items:center;gap:.65em;margin:0;padding:.6em .7em;border-radius:.55em;font-size:1.15em;color:var(--text);text-align:left}.more-list button .i{width:1.15em;height:1.15em;color:var(--muted)}'
  );
});
