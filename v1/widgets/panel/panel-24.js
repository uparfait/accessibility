/* panel/panel-24.js: The button, the panel, its tabs, tiles, views, help and messages, continued */
accessibles_core.define('panel/panel-24.js', [], function (core) {
  'use strict';
  core.ui.views.shortcuts = {
      title: 'Shortcuts',
      render: function (box) {
        var handler = function (label, keys_html) { return '<div class="kl"><span>' + label + '</span><span>' + keys_html + '</span></div>'; };
        var keys = function (shortcut_text) { return shortcut_text.split(' + ').map(function (key_name) { return '<kbd>' + core.escape_html(key_name) + '</kbd>'; }).join(' '); };
        var group = function (group) {
          var item = core.commands[group];
          return '<div class="sec" data-g="' + group + '"><div class="cmd-h"><h3 class="sh">' + item.title + '</h3>' +
            (core.speech.ok ? '<button type="button" class="ib" data-act="say-cmds" data-cg="' + group + '" aria-label="Read the ' + item.title + ' commands out loud" data-tt="Read these out loud">' + core.icon_svg('speak') + '</button>' : '') + '</div>' +
            '<p class="cmd-need">' + item.need + '</p>' +
            item.items.map(function (item_2) { return item.keys ? handler(item_2[1].charAt(0).toUpperCase() + item_2[1].slice(1), keys(item_2[0])) : '<div class="kl cmd"><span class="cn"><b>"' + core.escape_html(item_2[0]) + '"</b></span><span class="cd">' + core.escape_html(item_2[1]) + '</span>' + (item_2[2] ? '<span class="cx">' + core.escape_html(core.translate_ui('Example') + ': "' + item_2[2] + '"') + '</span>' : '') + '</div>'; }).join('') + '</div>';
        };
        box.innerHTML = '<h3 class="sh">Keyboard</h3>' +
          handler('Open or close this panel', '<kbd>Alt</kbd> <kbd>A</kbd>') +
          handler('Close panel or view', '<kbd>Esc</kbd>') +
          group('readKeys') +
          '<div class="sec">' + this.section_heading_html('With keyboard navigation on', 'shortcuts') + '</div>' +
          handler('Next heading', '<kbd>Alt</kbd> <kbd>H</kbd>') + handler('Next link', '<kbd>Alt</kbd> <kbd>L</kbd>') + handler('Next form field', '<kbd>Alt</kbd> <kbd>F</kbd>') +
          handler('Next button', '<kbd>Alt</kbd> <kbd>B</kbd>') + handler('Next region', '<kbd>Alt</kbd> <kbd>M</kbd>') + handler('Next image', '<kbd>Alt</kbd> <kbd>G</kbd>') +
          handler('Move the feature button', '<kbd>Alt</kbd> + arrows') +
          group('nav') + group('pick') + group('read') + group('dict');
      }
    };
  // The name of a feature or profile by its key
  core.ui.feature_label = function (key) {
    if (key.indexOf('profile:') === 0) { var list = core.profiles.filter(function (entry) { return 'profile:' + entry.id === key; })[0]; return list ? list.label + ' profile' : key; }
    var list_2 = core.features.filter(function (entry) { return entry.key === key || entry.id === key; })[0];
    if (key === 'contrast' || key === 'saturation' || key === 'cursor') return { contrast: 'Contrast modes', saturation: 'Saturation', cursor: 'Big cursor' }[key];
    return list_2 ? list_2.label : core.humanize(key);
  };
  // Copies text to the clipboard and shows that it worked
  core.ui.copy = function (text, button) {
    var self = this;
    var done = function (is_ok) {
      if (!button) { core.announce(core.translate_ui(is_ok ? 'Copied' : 'Copy is not available')); return; }
      if (!button.__acc) button.__acc = button.innerHTML;
      button.innerHTML = core.icon_svg(is_ok ? 'check' : 'close') + '<span class="bl">' + core.escape_html(core.translate_ui(is_ok ? 'Copied' : 'Copy is not available')) + '</span>';
      button.classList.add('done');
      core.announce(core.translate_ui(is_ok ? 'Copied' : 'Copy is not available'));
      core.cancel_later(button.__acc_timer);
      button.__acc_timer = core.run_later(function () { if (button.__acc) { button.innerHTML = button.__acc; button.__acc = null; button.classList.remove('done'); self.wrap_buttons(button.parentNode || button); } }, 1800);
    };
    var fallback = function () {
      var text_area = document.createElement('textarea'); text_area.value = text; text_area.setAttribute('readonly', ''); text_area.style.position = 'fixed'; text_area.style.opacity = '0';
      core.shadow.appendChild(text_area); text_area.select();
      var is_ok = false;
      try { is_ok = document.execCommand('copy'); } catch (error) { is_ok = false; }
      core.shadow.removeChild(text_area);
      done(is_ok);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback); else fallback();
  };
});
