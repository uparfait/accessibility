/* panel/panel-25.js: The button, the panel, its tabs, tiles, views, help and messages, continued */
accessibles_core.define('panel/panel-25.js', [], function (core) {
  'use strict';
    // Wrap button text so long labels can shorten with an ellipsis instead of wrapping
  core.ui.wrap_buttons = function (root_2) {
    core.find_all('.btn', root_2 || core.root).forEach(function (button) {
      Array.prototype.slice.call(button.childNodes).forEach(function (node) {
        if (node.nodeType === 3 && node.nodeValue.trim()) { var scratch = document.createElement('span'); scratch.className = 'bl'; node.parentNode.replaceChild(scratch, node); scratch.appendChild(node); }
      });
    });
  };
    // Translation progress is shown on the language row that was pressed; done is true or false when it ends
  core.ui.translate_wait = function (done) {
    var page = core.has('translate') ? core.page_translation : { progress: 1, busy: false, target: '', error: '' };
    var value = Math.min(page.progress, core.panel_translation.panel_progress);
    if (page.busy) this.progress(Math.max(0.01, value), 'translate');
    else if (!core.panel_translation.busy || done === false) {
      this.done_busy('translate');
      var big = core.find_one('.biglist[data-list="lang"]');
      if (big) this.mark_list(big, page.target || '');
    }
    if (done === false && this.view === 'translate') this.translate_note(page.error);
    if (done === true && this.view === 'translate') this.translate_note('');
    this.refresh();
  };
  // Shows or hides the note under the language list
  core.ui.translate_note = function (message) {
    var element = core.find_one('.vbody .tr-note');
    if (!element) return;
    element.hidden = !message;
    core.find_one('span', element).textContent = message ? core.translate_ui(message) : '';
  };

    /* --- loading states: shown on the pressed control until the change has been applied --- */
  core.ui.busy_list = [];
  core.ui.busy_at = 0;
    // owner: a long task (translation, help translation) that ends the loading state itself
  core.ui.set_busy = function (element, owner) {
    if (!element || element.classList.contains('busy')) return;
    element.acc_busy = owner || '';
    element.classList.add('busy');
    element.setAttribute('aria-busy', 'true');
    var label = document.createElement('span');
    label.className = 'bz'; label.setAttribute('translate', 'no'); label.setAttribute('aria-hidden', 'true');
    label.innerHTML = core.icon_svg('spinner', 'spin') + '<span class="pc"></span>';
    element.appendChild(label);
    this.busy_list.push(element);
    this.busy_at = Date.now();
  };
  // Shows a percentage on the loading spinners
  core.ui.progress = function (fraction, owner) {
    var value = fraction > 0 && fraction < 1 ? Math.round(fraction * 100) + '%' : '';
    this.busy_list.forEach(function (element) { if (owner === undefined || element.acc_busy === owner) { var percent_label = element.querySelector('.pc'); if (percent_label) percent_label.textContent = value; } });
  };
});
