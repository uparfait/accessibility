/* page-structure/page-structure.js: Page structure: headings, landmarks and links to jump to */
accessibles_core.define('page-structure/page-structure.js', [], function (core) {
  'use strict';
  core.ui.views.structure = {
      title: 'Page structure',
      render: function (box) {
        var mode = this.structure_mode, items = [];
        if (mode === 'headings') {
          items = Array.prototype.filter.call(document.querySelectorAll(core.headings), function (heading) { return !core.is_ours(heading) && core.is_visible(heading) && core.text_of(heading); })
            .map(function (heading) { var lower_value = heading.getAttribute('aria-level') || (heading.tagName.match(/\d/) || ['2'])[0]; return { element: heading, tag: 'H' + lower_value, text: core.text_of(heading), level: +lower_value }; });
        } else if (mode === 'landmarks') {
          var names = { HEADER: 'Header', NAV: 'Navigation', MAIN: 'Main', ASIDE: 'Aside', FOOTER: 'Footer', FORM: 'Form', SECTION: 'Section' };
          var roles = { banner: 'Header', navigation: 'Navigation', main: 'Main', complementary: 'Aside', contentinfo: 'Footer', search: 'Search', form: 'Form', region: 'Region' };
          items = Array.prototype.filter.call(document.querySelectorAll('header,nav,main,aside,footer,form[aria-label],form[aria-labelledby],section[aria-label],section[aria-labelledby],[role="banner"],[role="navigation"],[role="main"],[role="complementary"],[role="contentinfo"],[role="search"],[role="region"]'), function (element) { return !core.is_ours(element) && core.is_visible(element); })
            .map(function (element) { var attribute = element.getAttribute('role'); var kind = (attribute && roles[attribute]) || names[element.tagName] || 'Region'; var node = core.accessible_name_attribute(element) ? core.accessible_name(element) : ''; var heading = element.querySelector('h1,h2,h3'); return { element: element, tag: kind, text: node || (heading ? core.text_of(heading) : kind) }; });
        } else {
          items = Array.prototype.filter.call(document.querySelectorAll('a[href]'), function (link) { return !core.is_ours(link) && core.is_visible(link) && core.accessible_name(link); })
            .slice(0, 200).map(function (link) { return { element: link, tag: 'Link', text: core.accessible_name(link) }; });
        }
        this.structure_items = items;
        var counts = {
          headings: Array.prototype.filter.call(document.querySelectorAll(core.headings), function (heading) { return !core.is_ours(heading) && core.is_visible(heading) && core.text_of(heading); }).length,
          landmarks: Array.prototype.filter.call(document.querySelectorAll('header,nav,main,aside,footer,[role="banner"],[role="navigation"],[role="main"],[role="complementary"],[role="contentinfo"],[role="search"],[role="region"],section[aria-label],form[aria-label]'), function (element) { return !core.is_ours(element) && core.is_visible(element); }).length,
          links: Math.min(200, Array.prototype.filter.call(document.querySelectorAll('a[href]'), function (link) { return !core.is_ours(link) && core.is_visible(link) && core.accessible_name(link); }).length)
        };
        var segment = '<div class="seg" role="group" aria-label="Show">' + [['headings', 'Headings'], ['landmarks', 'Regions'], ['links', 'Links']].map(function (segment) { return '<button type="button" data-seg="' + segment[0] + '" aria-pressed="' + (mode === segment[0]) + '"><span>' + segment[1] + '</span><span class="n">' + counts[segment[0]] + '</span></button>'; }).join('') + '</div>';
        var list = items.length ? '<div class="list">' + items.map(function (item, index) {
          var pad = item.level ? ' style-pad="' + (item.level - 1) + '"' : '';
          return '<button type="button" class="li" data-go="' + index + '"' + pad + '><span class="lv">' + core.escape_html(item.tag) + '</span><span class="lt">' + core.escape_html(item.text.slice(0, 140)) + '</span></button>';
        }).join('') + '</div>' : '<p class="empty">Nothing found on this page.</p>';
        box.innerHTML = segment + list;
        core.find_all('[style-pad]', box).forEach(function (button) { button.style.paddingLeft = (0.6 + 0.9 * +button.getAttribute('style-pad')) + 'em'; button.removeAttribute('style-pad'); });
      }
    };
  // Jumps to a heading, landmark or link from the page structure
  core.ui.go_struct = function (index) {
    var item = this.structure_items[index];
    if (!item) return;
    if (core.view_width() < 700) this.close();
    core.focus_element(item.element);
  };
  core.register('click_attribute', { folder: 'page-structure', attribute: 'data-go', order: 130, run: function (target) {
    core.ui.go_struct(+target.getAttribute('data-go'));
  } });
  core.register('click_attribute', { folder: 'page-structure', attribute: 'data-seg', order: 140, run: function (target) {
    core.ui.structure_mode = target.getAttribute('data-seg'); core.ui.open_view('structure');
    var segment_button = core.find_one('[data-seg="' + core.ui.structure_mode + '"]');
    if (segment_button) segment_button.focus();
  } });
});
