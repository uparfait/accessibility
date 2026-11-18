/* aria-fixes/aria-fixes.js: ARIA fixes: adds missing roles, names and landmarks */
accessibles_core.define('aria-fixes/aria-fixes.js', ['aria-fixes-2.js'], function (core) {
  'use strict';
  core.aria_fixes = {
    on: false,
    recorder: new core.change_recorder(),
    new_tab_description: null
  };
  // Brings this part of the page in line with the settings
  core.aria_fixes.sync = function () { if (core.state.ariaFix && !this.on) { this.on = true; this.fix(document.body); } else if (!core.state.ariaFix && this.on) { this.on = false; this.recorder.revert(); this.new_tab_description = null; if (core.has('keyboard-navigation') && core.keyboard_navigation.on) core.keyboard_navigation.fix(document.body); } };
  // Applies the same changes to new content added to the page
  core.aria_fixes.fix = function (root) {
    if (!this.on || !root || root.nodeType !== 1) return;
    var elements = function (selector) { var elements = Array.prototype.slice.call(root.querySelectorAll(selector)); if (root.matches && root.matches(selector)) elements.unshift(root); return elements.filter(function (node) { return !core.is_ours(node); }); };
    if (root === document.body) this.fix_landmarks(this.recorder);
    this.fix_controls(elements, this.recorder);
    this.fix_frames_and_tables(elements, this.recorder);
    this.fix_links_and_messages(elements, this.recorder);
  };
    // Landmarks: header, footer, main, named navigation and the page language
  core.aria_fixes.fix_landmarks = function (record) {
    var landmark_parents = 'article,aside,main,nav,section,[role]';
    var header = Array.prototype.filter.call(document.querySelectorAll('header'), function (heading) { return !heading.parentElement.closest(landmark_parents); })[0];
    if (header && !header.getAttribute('role') && !document.querySelector('[role="banner"]')) { record.set(header, 'role', 'banner'); core.mark_fixed(record, header, 'aria'); }
    var footer = Array.prototype.filter.call(document.querySelectorAll('footer'), function (heading) { return !heading.parentElement.closest(landmark_parents); })[0];
    if (footer && !footer.getAttribute('role') && !document.querySelector('[role="contentinfo"]')) { record.set(footer, 'role', 'contentinfo'); core.mark_fixed(record, footer, 'aria'); }
    if (!document.querySelector('main,[role="main"]')) {
      var media = core.find_main(true);
      if (media && media !== document.body) { record.set(media, 'role', 'main'); core.mark_fixed(record, media, 'aria'); }
    }
    var navs = document.querySelectorAll('nav,[role="navigation"]');
    if (navs.length > 1) Array.prototype.forEach.call(navs, function (nav, index) {
      if (!core.accessible_name_attribute(nav)) { var heading = nav.querySelector('h1,h2,h3,h4,h5,h6'); record.set(nav, 'aria-label', heading ? core.text_of(heading) : 'Navigation ' + (index + 1)); core.mark_fixed(record, nav, 'aria'); }
    });
    if (core.config.lang && !document.documentElement.getAttribute('lang')) record.set(document.documentElement, 'lang', core.config.lang);
  };
    // Clickable elements become buttons, and buttons, links and icons get names
  core.aria_fixes.fix_controls = function (elements, record) {
    // Clickable non-interactive elements → buttons
    elements('[onclick]:not(a[href]):not(button):not(input):not(select):not(textarea):not(summary):not(label):not(body):not(html), a:not([href])[onclick]').forEach(function (element) {
      if (element.querySelector('a[href],button,input,select,textarea,[role="button"]')) return;
      if (!element.getAttribute('role')) { record.set(element, 'role', 'button'); core.mark_fixed(record, element, 'aria'); }
      if (!element.hasAttribute('tabindex')) record.set(element, 'tabindex', '0');
    });
    // Buttons and links without a name
    elements('a[href],button,[role="button"],[role="link"],input[type="button"],input[type="submit"]').forEach(function (element) {
      if (core.accessible_name(element)) return;
      var nav = core.guess_name(element) || (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button' ? 'Button' : 'Link');
      record.set(element, 'aria-label', nav); core.mark_fixed(record, element, 'aria');
    });
    // Decorative SVGs inside named controls
    elements('a svg:not([aria-hidden]):not([role]), button svg:not([aria-hidden]):not([role])').forEach(function (svg) {
      if (!svg.querySelector('title')) { record.set(svg, 'aria-hidden', 'true'); record.set(svg, 'focusable', 'false'); }
    });
  };
});
