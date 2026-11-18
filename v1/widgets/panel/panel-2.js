/* panel/panel-2.js: The button, the panel, its tabs, tiles, views, help and messages, continued */
accessibles_core.define('panel/panel-2.js', [], function (core) {
  'use strict';
  // Builds the widget: panel, button and every overlay
  core.ui.build = function () {
    var element = document.createElement('div');
    element.className = 'r';
    element.setAttribute('dir', core.state.translateTo && core.rtl_languages.test(core.state.translateTo) ? 'rtl' : document.documentElement.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr');
    element.innerHTML = this.panel_html() + this.overlays_html();
    core.shadow.appendChild(element);
    core.root = element;
    this.show_site_icon();
    this.bind();
    this.scale();
    this.place_launcher();
    this.render_tab('profiles');
  };
    // The panel: header, search box, category tabs, the list and the footer
  core.ui.panel_html = function () {
    var tab_buttons = core.tabs.map(function (tab, index) {
      return '<button type="button" class="tab" role="tab" id="acc-tab-' + tab.id + '" data-tab="' + tab.id + '" aria-controls="acc-body" aria-selected="' + (index === 0) + '" tabindex="' + (index === 0 ? 0 : -1) + '">' + tab.label + '</button>';
    }).join('');
    return '<div class="mask-t" hidden></div><div class="mask-b" hidden></div>' +
      '<div class="reader" hidden role="dialog" aria-modal="true" aria-label="Reader view"></div>' +
      '<section class="panel" id="acc-panel" hidden role="dialog" aria-modal="false" aria-label="' + core.escape_html(core.config.site_name ? core.config.site_name + ' ' + core.config.title : core.config.title) + '">' +
      '<div class="head"><div class="hslot"><div class="hmain"><span class="brandmark">' + core.icon_svg('logo') + '</span><div class="htxt"><h2 class="title" id="acc-title"><button type="button" class="tb" data-help="i:panel" data-tt="' + core.escape_html(core.config.site_name || core.config.title) + '" data-tt-full aria-label="' + core.escape_html(core.config.site_name || core.config.title) + ', more information"><span class="tbl">' + core.escape_html(core.config.site_name || core.config.title) + '</span>' + core.icon_svg('help') + '</button></h2>' +
      (core.config.site_name ? '<span class="subtitle">' + core.escape_html(core.config.title) + '</span>' : '') + '</div></div>' +
      // A copy of the open view's back button and title, shown here once the view's own header scrolls away
      '<div class="hview"><button type="button" class="ib" data-act="back" aria-label="Back" data-tt="Back">' + core.icon_svg('back') + '</button><div class="title hv-t"></div></div></div>' +
      '<button type="button" class="ib" data-act="close" aria-label="Close" data-tt="Close">' + core.icon_svg('close') + '</button></div>' +
      '<div class="search">' + core.icon_svg('search') + '<input type="search" placeholder="Search features" aria-label="Search accessibility features" autocomplete="off" spellcheck="false">' + core.clear_button_html() + '</div>' +
      '<div class="tabs" role="tablist" aria-label="Categories">' + tab_buttons + '</div>' +
      '<div class="body" id="acc-body" role="tabpanel" tabindex="-1" aria-labelledby="acc-tab-profiles"></div>' +
      '<div class="foot"><div class="links">' +
      '<button type="button" data-act="statement">Statement</button>' +
      '<button type="button" data-view="report">Report an issue</button><button type="button" data-view="shortcuts">Shortcuts</button></div>' +
      '<button type="button" class="rst" data-act="reset" hidden>' + core.icon_svg('reset') + 'Reset all settings</button></div>' +
      '</section>';
  };
});
