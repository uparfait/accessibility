/* panel/panel-12.js: The button, the panel, its tabs, tiles, views, help and messages, continued */
accessibles_core.define('panel/panel-12.js', [], function (core) {
  'use strict';
  // Handles a key press
  core.ui.on_key = function (event) {
    var target = event.target;
    this.by_keyboard = true;
    // Lists (dropdowns and full lists): arrows move, Enter picks
    var in_pop = target.closest && target.closest('.cs-pop');
    var list_box = in_pop ? core.find_one('.opts', in_pop) : (target.closest && target.closest('.qbox') ? core.find_one('.biglist') : null);
    if (list_box && /^(ArrowDown|ArrowUp|Enter|Home|End)$/.test(event.key) && (target.tagName === 'INPUT' || target.classList.contains('opt'))) {
      var opts = core.find_all('.opt', list_box);
      if (opts.length) {
        var current = opts.indexOf(core.find_one('.opt.act', list_box));
        if (event.key === 'Enter') { event.preventDefault(); var pick = opts[current < 0 ? 0 : current]; if (pick) pick.click(); return; }
        event.preventDefault();
        var value = event.key === 'Home' ? 0 : event.key === 'End' ? opts.length - 1 : core.clamp(current + (event.key === 'ArrowDown' ? 1 : -1), 0, opts.length - 1);
        opts.forEach(function (option) { option.classList.remove('act'); });
        opts[value].classList.add('act');
        opts[value].scrollIntoView({ block: 'nearest' });
        return;
      }
    }
    if (event.key === 'Escape') {
      if (!core.find_one('.cs-pop').hidden) { this.close_select(true); event.stopPropagation(); return; }
      if (!core.find_one('.cp-pop').hidden) { this.close_color(true); event.stopPropagation(); return; }
      if (!core.find_one('.help').hidden) { this.help(null); event.stopPropagation(); return; }
      if (core.has('reader-view') && !core.find_one('.reader').hidden) { this.reader(false); event.stopPropagation(); return; }
      if (this.view) { this.close_view(); event.stopPropagation(); return; }
      if (this.open) { this.close(); event.stopPropagation(); }
      return;
    }
    if (target.classList && target.classList.contains('tab') && /^(ArrowLeft|ArrowRight|Home|End)$/.test(event.key)) {
      event.preventDefault();
      var tabs = core.find_all('.tab'), position = tabs.indexOf(target);
      var count = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (position + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[count].focus();
      this.render_tab(tabs[count].getAttribute('data-tab'));
      return;
    }
    if (target.classList && target.classList.contains('sl')) { this.slider_key(target, event); return; }
    if (target.matches && target.matches('.search input') && event.key === 'ArrowDown') { event.preventDefault(); var first = core.find_one('.body button'); if (first) first.focus(); }
  };

    // A click in the panel: the first data attribute it has picks the handler, otherwise its data-act action runs
  core.ui.on_click = function (event) {
    if (event.target.classList && event.target.classList.contains('help')) { this.help(null); return; }
    var handlers = core.registered('click_attribute');
    var selector = handlers.map(function (handler) { return '[' + handler.attribute + ']'; }).concat('[data-act]').join(',');
    var target = event.target.closest(selector);
    if (!target) return;
    var handler = handlers.filter(function (item) { return target.hasAttribute(item.attribute); })[0];
    if (handler) { handler.run(target); return; }
    this.run_action(target.getAttribute('data-act'), target);
  };
});
