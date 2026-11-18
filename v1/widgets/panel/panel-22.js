/* panel/panel-22.js: The button, the panel, its tabs, tiles, views, help and messages, continued */
accessibles_core.define('panel/panel-22.js', [], function (core) {
  'use strict';
  // Updates every tile to the current settings
  core.ui.refresh = function () {
    if (!core.root) return;
    core.find_all('.tm[data-f]').forEach(function (element) {
      var attribute = core.features_by_id[element.getAttribute('data-f')];
      if (!attribute) return;
      var is_on = false, tile = element.parentNode;
      if (attribute.type === 'toggle') { is_on = !!core.state[attribute.key]; element.setAttribute('aria-pressed', is_on); }
      else if (attribute.type === 'radio') { is_on = core.state[attribute.key] === attribute.value; element.setAttribute('aria-pressed', is_on); }
      else if (attribute.type === 'cycle') {
        var position = Math.max(0, attribute.options.indexOf(core.state[attribute.key]));
        is_on = position > 0;
        var value_label = core.find_one('.tv', element); if (value_label) value_label.textContent = attribute.format(attribute.options[position]);
        core.find_all('.pip', element).forEach(function (item, index) { item.classList.toggle('f', index < position); });
        element.setAttribute('aria-label', attribute.label + ', ' + attribute.format(attribute.options[position]));
      } else if (attribute.value) {
        var tile_value_label = core.find_one('.tv', element); if (tile_value_label) tile_value_label.textContent = attribute.value();
        is_on = !!core.state[attribute.key];
      }
      if (attribute.id === 'translate') {
        is_on = !!core.state.translateTo;
        var translate_label = core.find_one('.tv', element);
        var translating = core.has('translate') && core.page_translation.busy;
        if (!translate_label && (core.state.translateTo || translating)) { translate_label = document.createElement('span'); translate_label.className = 'tv'; translate_label.setAttribute('translate', 'no'); core.find_one('.tl', element).after(translate_label); }
        if (translate_label) translate_label.textContent = translating ? core.translate_ui('Waiting…') + (core.page_translation.progress > 0 ? ' ' + Math.round(core.page_translation.progress * 100) + '%' : '') : (core.state.translateTo ? core.language_name(core.state.translateTo) : '');
        if (translate_label && !core.state.translateTo && !translating) translate_label.remove();
      }
      if (attribute.id === 'sign') is_on = !!core.state.sign;
      tile.classList.toggle('on', is_on);
    });
    core.find_all('.prow').forEach(function (element) {
      var is_on = core.state.profiles.indexOf(element.getAttribute('data-p')) > -1;
      element.parentNode.classList.toggle('on', is_on); element.setAttribute('aria-pressed', is_on);
    });
    core.find_all('.swb').forEach(function (button) {
      var is_on = (core.state[button.getAttribute('data-c')] || '').toLowerCase() === button.getAttribute('data-v').toLowerCase();
      button.classList.toggle('on', is_on); button.setAttribute('aria-pressed', is_on);
    });
    core.find_all('.pick').forEach(function (item) {
      var index = item.getAttribute('data-pick'), value = core.state[index];
      var preset = core.find_all('.swb[data-c="' + index + '"]').some(function (button) { return button.getAttribute('data-v').toLowerCase() === (value || '').toLowerCase(); });
      item.classList.toggle('on', !!value && !preset);
      item.style.background = (value && !preset) ? value : '';
    });
    var self = this;
    core.find_all('.sl').forEach(function (slider) { self.paint_slider(slider); });
    // Accessibility settings that also apply to this panel
    core.root.classList.toggle('cur-black', core.state.cursor === 'black');
    core.root.classList.toggle('cur-white', core.state.cursor === 'white');
    core.root.classList.toggle('focus-strong', !!(core.state.focusRing || core.state.keyboardNav));
    this.scale();
    this.speech_state();
    core.panel_translation.apply(core.root);
  };
});
