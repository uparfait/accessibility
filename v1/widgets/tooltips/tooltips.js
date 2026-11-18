/* tooltips/tooltips.js: Tooltips: shows titles and image descriptions on hover */
accessibles_core.define('tooltips/tooltips.js', [], function (core) {
  'use strict';
  core.tooltips = {
    on: false, current: null,
    sync: function () {
      var event_names = [['pointerover', this.on_over], ['focusin', this.on_over], ['pointerout', this.on_out], ['focusout', this.on_out]];
      if (core.state.tooltips && !this.on) { this.on = true; event_names.forEach(function (event) { document.addEventListener(event[0], event[1], true); }); window.addEventListener('scroll', this.on_out, true); }
      else if (!core.state.tooltips && this.on) { this.on = false; event_names.forEach(function (event) { document.removeEventListener(event[0], event[1], true); }); window.removeEventListener('scroll', this.on_out, true); this.hide(); }
    },
    text: function (element) {
      var attribute = element.getAttribute('data-tooltip') || element.getAttribute('title') || element.getAttribute('aria-label') || (element.tagName === 'IMG' ? element.getAttribute('alt') : '') || '';
      if (!attribute && element.matches('a[href],button,[role="button"]') && !core.text_of(element)) attribute = core.accessible_name(element);
      return String(attribute).trim();
    },
    on_over: function (event) {
      var target = event.target;
      if (!target || target.nodeType !== 1 || core.is_ours(target)) return;
      var element = target.closest('[data-tooltip],[title],[aria-label],img[alt],a[href],button,[role="button"]');
      if (!element || core.is_ours(element)) return;
      var rect = element.getBoundingClientRect();
      if (rect.width > core.view_width() * 0.9 && rect.height > core.view_height() * 0.6) return;   // whole sections are not "things" to describe
      var spoken_text = core.tooltips.text(element);
      if (!spoken_text || spoken_text === core.text_of(element)) { core.tooltips.hide(); return; }
      if (core.tooltips.current === element) return;
      core.tooltips.current = element;
      core.tooltip_bubble.show(element, spoken_text, event.type === 'focusin' ? 0 : 350);
    },
    on_out: function (event) { if (!core.tooltips.current || !event || event.type === 'scroll' || !core.tooltips.current.contains(event.relatedTarget)) core.tooltips.hide(); },
    hide: function () { this.current = null; core.tooltip_bubble.hide(); }
  };
  core.register('module', { folder: 'tooltips', order: 170, module: core.tooltips });
});
