/* keyboard-navigation/keyboard-navigation.js: Keyboard navigation: skip links, focusable controls and shortcuts */
accessibles_core.define('keyboard-navigation/keyboard-navigation.js', [], function (core) {
  'use strict';
  core.keyboard_navigation = {
    on: false, recorder: new core.change_recorder(), skip: null,
    sync: function () {
      if (core.state.keyboardNav && !this.on) { this.on = true; this.fix(document.body); this.add_skip(); document.addEventListener('keydown', this.on_key, true); }
      else if (!core.state.keyboardNav && this.on) { this.on = false; this.recorder.revert(); this.skip = null; document.removeEventListener('keydown', this.on_key, true); if (core.has('aria-fixes') && core.aria_fixes.on) core.aria_fixes.fix(document.body); }
    },
    fix: function (root) {
      if (!this.on || !root || root.nodeType !== 1) return;
      var recorder = this.recorder;
      var selector = '[onclick]:not(a[href]):not(button):not(input):not(select):not(textarea):not(summary):not(label):not(body):not(html):not([tabindex]),' +
        '[role="button"]:not([tabindex]):not(button),[role="link"]:not([tabindex]):not(a[href]),[role="tab"]:not([tabindex]),[role="menuitem"]:not([tabindex]),[role="option"]:not([tabindex]),' +
        'div[class*="btn"]:not([tabindex]),span[class*="btn"]:not([tabindex]),div[class*="button"]:not([tabindex]),span[class*="button"]:not([tabindex])';
      var list = Array.prototype.slice.call(root.querySelectorAll(selector));
      list.forEach(function (item) {
        if (core.is_ours(item) || item.closest('a[href],button') || item.querySelector('a[href],button,input,select,textarea')) return;
        recorder.set(item, 'tabindex', '0');
        recorder.set(item, 'data-acc-kb', '1');
      });
    },
    add_skip: function () {
      if (document.querySelector('a.acc-skip')) return;
      var existing = Array.prototype.some.call(document.querySelectorAll('a[href^="#"]'), function (first) { return /skip/i.test(core.text_of(first)); });
      if (existing) return;
      var main = core.find_main();
      if (!main) return;
      if (!main.id) this.recorder.set(main, 'id', 'acc-main');
      if (!main.hasAttribute('tabindex')) this.recorder.set(main, 'tabindex', '-1');
      var link = document.createElement('a');
      link.className = 'acc-skip'; link.href = '#' + main.id; link.textContent = 'Skip to main content';
      link.addEventListener('click', function (event) { event.preventDefault(); core.focus_element(main); });
      document.body.insertBefore(this.recorder.add(link), document.body.firstChild);
      this.skip = link;
    },
    on_key: function (event) {
      var target = event.target;
      if (core.is_ours(target)) return;
      // Activate injected buttons with Enter / Space
      if ((event.key === 'Enter' || event.key === ' ') && target && target.getAttribute && target.getAttribute('data-acc-kb') === '1' && !core.is_editable(target)) {
        event.preventDefault();
        target.click();
        return;
      }
      if (!event.altKey || event.ctrlKey || event.metaKey) return;
      var map = { KeyH: core.headings, KeyL: 'a[href],[role="link"]', KeyF: 'input:not([type="hidden"]),select,textarea,[contenteditable="true"]', KeyB: 'button,[role="button"],input[type="submit"],input[type="button"]', KeyM: 'main,[role="main"],nav,[role="navigation"],header,[role="banner"],footer,[role="contentinfo"],aside,[role="complementary"],[role="search"],form[aria-label]', KeyG: 'img[alt]:not([alt=""]),figure,[role="img"]' };
      var selector = map[event.code];
      if (!selector) return;
      event.preventDefault();
      core.move_to(selector, event.shiftKey ? -1 : 1);
    }
  };
  core.keyboard_navigation.on_key = core.keyboard_navigation.on_key.bind(core.keyboard_navigation);
  core.register('module', { folder: 'keyboard-navigation', order: 70, module: core.keyboard_navigation });
});
