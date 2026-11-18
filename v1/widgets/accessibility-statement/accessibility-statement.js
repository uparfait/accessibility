/* accessibility-statement/accessibility-statement.js: Accessibility statement: the statement window or your own page */
accessibles_core.define('accessibility-statement/accessibility-statement.js', [], function (core) {
  'use strict';
  core.ui.views.statement = {
      title: 'Accessibility statement',
      render: function (box) {
        var site = core.escape_html(core.config.site_name || location.hostname || 'this website');
        box.innerHTML = '<div class="prose"><p>We want ' + site + ' to be usable by everyone, including people with disabilities. We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA.</p>' +
          '<p>This site provides accessibility features so you can adjust text, colors, motion, reading and navigation to suit your needs. These features also repair some common technical problems automatically, such as missing labels and image descriptions.</p>' +
          '<p>These features support, but do not replace, accessible design. If something on this site is hard to use, please tell us and we will work to fix it.</p></div>' +
          '<div class="btns"><button type="button" class="btn" data-view="report">' + core.icon_svg('report') + 'Report an accessibility issue</button></div>';
      }
    };
    // The accessibility statement always opens inside the panel. A statement page on the same site is read and shown here.
  core.ui.statement = function () {
    var self = this, site = core.config.site_name || location.hostname || 'this website';
    this.help_id = 'doc';
    var box = this.open_shell(this.help_shell('statement', 'About', 'Accessibility statement', false));
    var main = core.find_one('.help-main', box);
    var built_in = '<div class="help-text prose"><p>We want ' + core.escape_html(site) + ' to be usable by everyone, including people with disabilities. We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA.</p>' +
      '<p>This site provides accessibility features so you can adjust text, colors, motion, reading and navigation to suit your needs. These features also repair some common technical problems automatically, such as missing labels and image descriptions.</p>' +
      '<p>These features support, but do not replace, accessible design. If something on this site is hard to use, please tell us and we will work to fix it.</p></div>';
    var foot = '<div class="btns"><button type="button" class="btn" data-act="help-report">' + core.icon_svg('report') + 'Report an accessibility issue</button></div>';
    var url = null;
    try { url = core.config.statement ? new URL(core.config.statement, location.href) : null; } catch (error) { url = null; }
    if (!url || !/^https?:$/.test(url.protocol)) { main.innerHTML = built_in + foot; core.panel_translation.apply(box); return; }
    main.innerHTML = '<div class="wait" translate="no">' + core.icon_svg('spinner', 'spin') + '<span>' + core.escape_html(core.translate_ui('Waiting…')) + '</span></div>';
    core.panel_translation.apply(box);
    var show_frame = function () {
      main.innerHTML = '<iframe class="help-frame" title="Accessibility statement" referrerpolicy="no-referrer"></iframe>' + foot;
      core.find_one('.help-frame', main).src = url.href;
      core.panel_translation.apply(box);
    };
    if (url.origin !== location.origin) { show_frame(); return; }
    fetch(url.href, { credentials: 'same-origin' }).then(function (result) { if (!result.ok) throw new Error(result.status); return result.text(); }).then(function (html) {
      if (self.help_id !== 'doc') return;
      var parsed_document = new DOMParser().parseFromString(html, 'text/html');
      var base = parsed_document.createElement('base'); base.href = url.href; parsed_document.head.insertBefore(base, parsed_document.head.firstChild);
      var element = parsed_document.querySelector('main,[role="main"],article,#content,.content') || parsed_document.body;
      var article = document.createElement('div');
      article.className = 'help-text prose doc';
      article.setAttribute('translate', 'no');
      article.appendChild(core.clean_copy(element, 0));
      main.innerHTML = '';
      main.appendChild(article);
      main.insertAdjacentHTML('beforeend', foot);
      core.panel_translation.apply(box);
    }).catch(show_frame);
  };
  core.register('action', { folder: 'accessibility-statement', names: ['statement'], run: function (target) {
    core.ui.statement();
  } });
});
