/* panel/panel-13.js: The button, the panel, its tabs, tiles, views, help and messages, continued */
accessibles_core.define('panel/panel-13.js', [], function (core) {
  'use strict';
    // Runs a button's data-act action; when its feature has not arrived yet, it loads first
  core.ui.run_action = function (name, target) {
    var action = core.registered('action').filter(function (item) { return item.names.indexOf(name) > -1; })[0];
    if (action) { action.run(target); return; }
    var feature_id = core.action_features[String(name).split('-')[0]];
    if (feature_id && !core.feature_ready(feature_id)) this.wait_for_feature(feature_id, target.parentNode, function () { core.ui.run_action(name, target); });
  };
    // Shows a loading spinner on a card while a feature's files arrive, then runs the callback
  core.ui.wait_for_feature = function (feature_id, card, then) {
    var owner = 'load:' + feature_id;
    if (card && card.acc_busy === owner) return;
    this.set_busy(card, owner);
    core.load_feature(feature_id, function () { core.ui.done_busy(owner); then(); });
  };
    // A feature tile was clicked
  core.ui.click_feature = function (target) {
    var id = target.getAttribute('data-f'), item = core.features_by_id[id];
    if (!core.feature_ready(id)) { this.wait_for_feature(id, target.parentNode, function () { core.ui.click_feature(target); }); return; }
    if (item && /^(toggle|radio|cycle)$/.test(item.type)) this.set_busy(target.parentNode);
    this.feature(id); this.speak_state(target);
  };
    // A view (a page inside the panel) was asked for
  core.ui.click_view = function (target) {
    var name = target.getAttribute('data-view'), feature_id = core.view_features[name] || name;
    if (!this.views[name] && !core.feature_ready(feature_id)) { this.wait_for_feature(feature_id, target.parentNode, function () { core.ui.click_view(target); }); return; }
    if (!this.open) this.show();
    this.open_view(name);
  };
  // Handles typing and changes in a field
  core.ui.on_input = function (event) {
    var target = event.target;
    this.sync_clears();
    if (target.matches('.search input')) { this.search(target.value); return; }
    if (target.matches('.cs-pop .q input')) {
      var attribute = this.selects[this.select_open && this.select_open.getAttribute('data-sel')];
      if (attribute) { var box = core.find_one('.cs-pop .opts'); box.innerHTML = this.options_html(attribute.options(), attribute.value(), target.value); this.after_list(box); }
      return;
    }
    if (target.hasAttribute('data-filter')) {
      var list = core.find_one('.biglist'), kind = target.getAttribute('data-filter');
      list.innerHTML = this.options_html(kind === 'font' ? this.font_options() : core.language_options(), kind === 'font' ? core.state.font : ((core.has('translate') && core.page_translation.target) || core.state.translateTo), target.value);
      this.after_list(list);
      return;
    }
    if (target.matches('.cp-hex')) {
      var color = core.parse_color(target.value.trim());
      var preview = core.find_one('.cp-pop .prev'); if (preview) preview.style.background = color ? core.to_hex(color) : 'transparent';
    }
  };
});
