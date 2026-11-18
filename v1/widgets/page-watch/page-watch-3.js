/* page-watch/page-watch-3.js: Watches the page for new content and keeps the widget on top, continued */
accessibles_core.define('page-watch/page-watch-3.js', [], function (core) {
  'use strict';
  // The widget lives in the browser's top layer, above any z-index. Things the page or an extension
  // opens there later (popovers, modal dialogs, full screen) would cover it, so it moves back on top.
  core.raising = false;
  // Parts the widget adds outside its own layer (the Libras interpreter) live in a second top-layer box.
  // It is transparent and lets clicks through, and it never moves or resizes what is inside it.
  core.top_box_element = null;
  // A modal dialog makes the rest of the page unclickable, so while one is open the widget lives inside it
  core.host_home = null;
});
