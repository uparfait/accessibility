/* panel/panel-15.js: The button, the panel, its tabs, tiles, views, help and messages, continued */
accessibles_core.define('panel/panel-15.js', [], function (core) {
  'use strict';
  // Opens the panel
  core.ui.show = function () {
    var element = core.find_one('.panel');
    this.last_focus = document.activeElement;
    core.raise_widget();
    element.hidden = false;
    this.open = true;
    core.find_one('.launch').setAttribute('aria-expanded', 'true');
    // The small button and its card hide while the panel is open, and come back when it closes
    core.find_one('.launch').classList.add('under');
    this.hide_card(true);
    this.refresh();
    this.place_panel();
    if (this.remember_open) this.remember_open();
  };
  // Opens or closes the panel
  core.ui.toggle = function (by_keyboard) {
    if (this.open) { this.close(); return; }
    this.show();
    // Keyboard users land on the active tab; pointer users get no focus ring
    if (by_keyboard) { var selector = this.view ? core.find_one('.vh .ib') : core.find_one('.tab[aria-selected="true"]'); if (selector) selector.focus(); }
    else { try { core.find_one('.panel').focus({ preventScroll: true }); } catch (error) { /* ignore */ } }
  };
  // Closes the panel
  core.ui.close = function () {
    if (!this.open) return;
    this.close_select(); this.close_color();
    core.find_one('.panel').hidden = true;
    this.open = false;
    this.panel_pos = null;
    if (this.forget_open) this.forget_open();
    core.find_one('.launch').setAttribute('aria-expanded', 'false');
    core.find_one('.launch').classList.remove('under');
    try { core.find_one('.launch').focus({ preventScroll: true }); } catch (error) { core.find_one('.launch').focus(); }
  };
  // Shows the tiles of one tab
  core.ui.render_tab = function (id) {
    this.tab = id; this.view = null;
    this.close_select(); this.close_color();
    core.find_one('.tabs').hidden = false; core.find_one('.search').hidden = false;
    core.find_all('.tab').forEach(function (tab_button) {
      var is_on = tab_button.getAttribute('data-tab') === id;
      tab_button.setAttribute('aria-selected', is_on); tab_button.setAttribute('tabindex', is_on ? 0 : -1);
    });
    var body = core.find_one('.body');
    body.setAttribute('aria-labelledby', 'acc-tab-' + id);
    body.innerHTML = this.tab_html(id);
    body.scrollTop = 0;
    this.sync_head();
    this.after_render();
  };
  // The HTML for a profile row
  core.ui.profile_html = function (profile, suffix) {
    return '<div class="prow-w" data-pw="' + profile.id + '"><button type="button" class="prow" data-p="' + profile.id + '" aria-pressed="false"><span class="pi">' + core.icon_svg(profile.icon) + '</span><span class="pt"><span class="pn">' + profile.label + (suffix || '') + '</span></span><span class="sw" aria-hidden="true"></span></button>' +
      '<button type="button" class="hb" data-help="p:' + profile.id + '" aria-label="About ' + profile.label + '" data-tt="About this profile">' + core.icon_svg('help') + '</button></div>';
  };
});
