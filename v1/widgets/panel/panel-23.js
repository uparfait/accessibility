/* panel/panel-23.js: The button, the panel, its tabs, tiles, views, help and messages, continued */
accessibles_core.define('panel/panel-23.js', [], function (core) {
  'use strict';
    /* --- views --- */
  core.ui.open_view = function (name) {
    var view = this.views[name];
    if (!view) return;
    this.close_select(); this.close_color();
    this.view = name;
    core.find_one('.tabs').hidden = true; core.find_one('.search').hidden = true;
    var body = core.find_one('.body');
    var vhelp = core.view_help[name];
    body.innerHTML = '<div class="vh"><button type="button" class="ib" data-act="back" aria-label="Back" data-tt="Back">' + core.icon_svg('back') + '</button><h2 tabindex="-1">' +
      (vhelp ? '<button type="button" class="tb" data-help="' + vhelp + '" aria-label="' + view.title + ', more information"><span class="tbl">' + view.title + '</span>' + core.icon_svg('help') + '</button>' : '<span class="tbl">' + view.title + '</span>') + '</h2></div><div class="vbody"></div>';
    body.scrollTop = 0;
    this.sync_head();
    view.render.call(this, core.find_one('.vbody'));
    this.after_render();
    // Searchable views focus their search box right away (except on touch screens, where it would pop up the keyboard)
    var fine = !window.matchMedia || window.matchMedia('(pointer: fine)').matches;
    if (this.open) { var target = core.find_one('.vbody .qbox .inp') && (this.by_keyboard || fine) ? core.find_one('.vbody .qbox .inp') : this.by_keyboard ? core.find_one('.vh .ib') : core.find_one('.vh h2'); if (target) target.focus({ preventScroll: true }); }
  };
    // In a view, once its own header (back and title) scrolls away, the top header shows a copy of it
  core.ui.sync_head = function () {
    var head = core.find_one('.head'), view_header = this.view && core.find_one('.vh'), body = core.find_one('.body');
    if (!head) return;
    var is_on = !!(view_header && body && view_header.getBoundingClientRect().bottom <= body.getBoundingClientRect().top + 2);
    if (is_on === head.classList.contains('compact')) return;
    if (is_on) { var head_view = core.find_one('.hv-t'), view_heading = core.find_one('h2', view_header); head_view.innerHTML = view_heading ? view_heading.innerHTML : ''; core.panel_translation.apply(head_view); }
    // Keep keyboard focus on a visible back button when the two swap
    var first = core.shadow.activeElement, from = is_on ? view_header : core.find_one('.hview'), target = is_on ? core.find_one('.hview') : view_header;
    head.classList.toggle('compact', is_on);
    if (first && from && target && first.matches('[data-act="back"]') && from.contains(first)) { var element = core.find_one('[data-act="back"]', target); if (element) { try { element.focus({ preventScroll: true }); } catch (error) { /* ignore */ } } }
  };
    // Names marked data-tt-full only get a tooltip when they are cut off with an ellipsis
  core.ui.tooltip_wanted = function (anchor) {
    if (!anchor.hasAttribute('data-tt-full')) return true;
    var element = core.find_one('.tbl', anchor) || anchor;
    return element.scrollWidth > element.clientWidth + 1;
  };
  // Goes back from a view to the tabs
  core.ui.close_view = function () {
    var element = core.find_one('.search input').value;
    this.view = null;
    if (element) { core.find_one('.search').hidden = false; this.search(element); } else this.render_tab(this.tab);
    if (this.by_keyboard) { var element_2 = core.find_one('.tab[aria-selected="true"]'); if (element_2) element_2.focus(); }
  };
  core.ui.views = {};
});
