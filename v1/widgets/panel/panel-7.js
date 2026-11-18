/* panel/panel-7.js: The button, the panel, its tabs, tiles, views, help and messages, continued */
accessibles_core.define('panel/panel-7.js', [], function (core) {
  'use strict';
  // Shows the card beside the button that names the site
  core.ui.show_card = function () {
    var element = core.find_one('.lcard'), element_2 = core.find_one('.launch');
    if (!element || this.open || element_2.classList.contains('dragging') || element_2.classList.contains('under')) return;
    core.cancel_later(this.card_timer);
    var site_name = core.config.site_name || location.hostname.replace(/^www\./, '') || core.translate_ui('This website');
    core.find_one('.lc-n', element).textContent = site_name;
    element.title = site_name;   // the card cuts long names; hovering shows the whole name
    core.panel_translation.apply(element);
    this.card_icon();
    // Opens towards the middle of the screen, sharing the button's edge
    var rect = element_2.getBoundingClientRect(), white = core.view_width();
    var to_left = rect.left + rect.width / 2 > white / 2;
    if (!element.classList.contains('show')) { element.classList.toggle('tl', to_left); element.classList.toggle('tr', !to_left); }
    to_left = element.classList.contains('tl');
    var width = element.offsetWidth;
    element.style.left = Math.round(to_left ? rect.right - width : rect.left) + 'px';
    element.style.top = Math.round(rect.top) + 'px';
    element_2.classList.add('carded');
    element.classList.add('show');
  };
  // Hides that card
  core.ui.hide_card = function (now) {
    var self = this;
    core.cancel_later(this.card_timer);
    var run_next = function () { var element = core.find_one('.lcard'); if (element) element.classList.remove('show'); core.find_one('.launch').classList.remove('carded'); };
    if (now) run_next(); else this.card_timer = core.run_later(function () { if (!self.card_hover) run_next(); }, 160);
  };

    // Every listener the panel needs, group by group
  core.ui.bind = function () {
    this.bind_launcher_card();
    this.bind_launcher_drag();
    this.bind_launcher_keys();
    this.bind_panel_drag();
    this.bind_panel_events();
    this.bind_tooltips();
    this.bind_help_scroll();
    this.bind_sliders();
    this.bind_focus();
    this.bind_page_keys();
    this.bind_resize();
  };
    // The hover card beside the small button
  core.ui.bind_launcher_card = function () {
    var self = this;
    var launch = core.find_one('.launch'), card = core.find_one('.lcard');
    launch.addEventListener('pointerenter', function (event) { if (event.pointerType !== 'touch') self.show_card(); });
    launch.addEventListener('pointerleave', function () { self.hide_card(); });
    launch.addEventListener('focus', function () { if (self.by_keyboard) self.show_card(); });
    launch.addEventListener('blur', function () { self.hide_card(true); });
    card.addEventListener('pointerenter', function () { self.card_hover = true; core.cancel_later(self.card_timer); });
    card.addEventListener('pointerleave', function () { self.card_hover = false; self.hide_card(); });
    card.addEventListener('click', function () { self.hide_card(true); self.card_hover = false; self.toggle(); });
  };
});
