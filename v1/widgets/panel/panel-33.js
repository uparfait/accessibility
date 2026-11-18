/* panel/panel-33.js: The button, the panel, its tabs, tiles, views, help and messages, continued: the "For more" menu in the footer */
accessibles_core.define('panel/panel-33.js', [], function (core) {
  'use strict';
  // Opens or closes the "For more" menu: Statement, Report an issue and Shortcuts
  core.ui.toggle_more = function (open) {
    var button = core.find_one('.more-btn'), list = core.find_one('.more-list');
    if (!button || !list) return;
    if (open === undefined) open = list.hidden;
    list.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    if (open) { var first = list.querySelector('button'); if (first && this.by_keyboard) first.focus(); }
  };
  core.register('click_attribute', { folder: 'panel', attribute: 'data-more', order: 5, run: function () {
    core.ui.toggle_more();
  } });
  // A choice in the menu, a click anywhere else, or Escape closes it; arrow keys move between its items
  core.run_later(function wait_for_panel() {
    if (!core.root) { core.run_later(wait_for_panel, 300); return; }
    core.root.addEventListener('click', function (event) {
      var list = core.find_one('.more-list');
      if (list && !list.hidden && !event.target.closest('.more-btn')) core.ui.toggle_more(false);
    }, true);
    core.root.addEventListener('keydown', function (event) {
      var list = core.find_one('.more-list');
      if (!list || list.hidden) return;
      if (event.key === 'Escape') { event.stopPropagation(); core.ui.toggle_more(false); core.find_one('.more-btn').focus(); return; }
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      var items = core.find_all('button', list), index = items.indexOf(core.shadow.activeElement);
      event.preventDefault();
      items[(index + (event.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length].focus();
    }, true);
  }, 0);
});
