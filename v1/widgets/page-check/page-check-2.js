/* page-check/page-check-2.js: Page check, continued */
accessibles_core.define('page-check/page-check-2.js', [], function (core) {
  'use strict';
  // The checks of the page check, each adds its results with check()
  core.audit_checks = [
      function (check, all) { var imgs = all('img'); check('alt', 'Images have text alternatives', 3, imgs.filter(function (image) { return !image.hasAttribute('alt'); }), imgs.filter(function (image) { return fixed(image, 'alt'); }).length, 'Add alt text to every meaningful image, alt="" for decorative ones.'); },
      function (check, all) { var fields = all('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="image"]):not([type="reset"]),select,textarea'); check('labels', 'Form fields have labels', 3, fields.filter(function (field) { return !core.accessible_name(field) && !(field.getAttribute('placeholder') || '').trim(); }), fields.filter(function (field) { return fixed(field, 'form'); }).length, 'Connect a label to every input.'); },
      function (check, all) { var ctrls = all('a[href],button,[role="button"]'); check('names', 'Links and buttons have names', 3, ctrls.filter(function (control) { return core.is_visible(control) && !core.accessible_name(control); }), ctrls.filter(function (control) { return fixed(control, 'aria'); }).length, 'Give icon-only links and buttons a text label.'); },
      function (check, all) {
        var head_score = all('h1,h2,h3,h4,h5,h6').filter(core.is_visible);
        var skips = [], last = 0;
        head_score.forEach(function (heading) { var item = +heading.tagName.charAt(1); if (last && item > last + 1) skips.push(heading); last = item; });
        check('headings', 'Heading levels are in order', 1, skips, 0, 'Do not skip heading levels, for example from H2 to H4.');
        check('emptyHeadings', 'Headings are not empty', 1, head_score.filter(function (heading) { return !core.text_of(heading); }), 0, 'Remove empty headings or give them text.');
        var main_headings = head_score.filter(function (heading) { return heading.tagName === 'H1'; });
        check('h1', 'Page has one main heading', 1, main_headings.length === 1 ? [] : main_headings.length ? main_headings.slice(1) : [document.body], 0, 'Use exactly one H1 that describes the page.');
      },
      function (check, all) {
        check('lang', 'Page language is set', 2, document.documentElement.getAttribute('lang') ? [] : [document.documentElement], 0, 'Add a lang attribute to the html element.');
        check('title', 'Page has a title', 1, (document.title || '').trim() ? [] : [document.documentElement], 0, 'Add a descriptive page title.');
        var frames = all('iframe');
        check('frames', 'Frames have titles', 1, frames.filter(function (field) { return !field.getAttribute('title') && !field.getAttribute('aria-label'); }), frames.filter(function (field) { return fixed(field, 'aria'); }).length, 'Add a title attribute to every iframe.');
        check('landmark', 'Page has a main landmark', 1, document.querySelector('main,[role="main"]') ? [] : [document.body], document.querySelector('[role="main"][data-acc-fixed]') ? 1 : 0, 'Wrap the main content in a main element.');
      },
      function (check, all) {
        var ids = {}, dups = [];
        all('[id]').forEach(function (element) { if (ids[element.id]) dups.push(element); else ids[element.id] = 1; });
        check('ids', 'IDs are unique', 1, dups, 0, 'Each id value should appear only once.');
        check('tabindex', 'No positive tabindex', 1, all('[tabindex]').filter(function (element) { return parseInt(element.getAttribute('tabindex'), 10) > 0; }), 0, 'Use tabindex 0 or -1 only.');
        var viewport_meta = document.querySelector('meta[name="viewport"]'), viewport_content = viewport_meta ? (viewport_meta.getAttribute('content') || '') : '';
        var no_zoom = /user-scalable\s*=\s*(no|0)/i.test(viewport_content) || (/maximum-scale\s*=\s*([\d.]+)/i.test(viewport_content) && parseFloat(/maximum-scale\s*=\s*([\d.]+)/i.exec(viewport_content)[1]) < 2);
        check('zoom', 'Pinch zoom is allowed', 2, no_zoom ? [viewport_meta] : [], 0, 'Remove user-scalable=no and maximum-scale from the viewport meta tag.');
      },
      function (check, all) {
        var low_contrast = [], seen = 0, text_node, checked = new Set();
        var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
        while ((text_node = walker.nextNode()) && seen < 500) {
          var part = text_node.parentElement;
          if (!part || checked.has(part) || core.is_ours(part) || !/\S/.test(text_node.nodeValue) || core.skip_tags[part.tagName]) continue;
          checked.add(part);
          if (!core.is_visible(part)) continue;
          seen++;
          var style = getComputedStyle(part), foreground = core.parse_color(style.color), background = core.effective_background(part);
          if (!foreground || !background) continue;
          var size = parseFloat(style.fontSize), bold = parseInt(style.fontWeight, 10) >= 700;
          if (core.contrast_ratio(foreground, background) < ((size >= 24 || (bold && size >= 18.66)) ? 3 : 4.5)) low_contrast.push(part);
        }
        check('contrast', 'Text has enough contrast', 3, low_contrast, 0, 'Text needs 4.5:1 contrast, or 3:1 for large text.');
      }
  ];
});
