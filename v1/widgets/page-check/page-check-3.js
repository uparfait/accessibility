/* page-check/page-check-3.js: Page check, continued */
accessibles_core.define('page-check/page-check-3.js', [], function (core) {
  'use strict';
  core.ui.views.audit = {
      title: 'Page check',
      render: function (box) {
        var self = this;
        box.innerHTML = '<div class="wait" translate="no">' + core.icon_svg('spinner', 'spin') + '<span>' + core.escape_html(core.translate_ui('Checking the page…')) + '</span></div>';
        core.run_audit_async(function (item) { var scratch = core.find_one('.wait span', box); if (scratch) scratch.textContent = core.translate_ui('Checking the page…') + ' ' + Math.round(item * 100) + '%'; })
          .then(function (result) { if (self.view === 'audit') { self.views.audit.show.call(self, box, result); self.after_render(); } });
      },
      show: function (box, result) {
        this.audit_res = result;
        var open_count = result.checks.filter(function (check) { return check.open.length; }).length;
        var top = Object.keys(core.usage).sort(function (first, second) { return core.usage[second] - core.usage[first]; }).slice(0, 5);
        box.innerHTML = '<div class="score"><span class="n">' + result.score + '</span><div class="grow"><div class="st-t">' + (open_count ? open_count + ' area' + (open_count === 1 ? '' : 's') + ' to improve' : 'No issues found') + '</div><div class="bar"><i></i></div></div></div>' +

          '<div class="list">' + result.checks.map(function (check) {
            var is_ok = !check.open.length;
            var sub = is_ok ? (check.fixed ? check.fixed + ' fixed automatically' : 'Passed') : check.open.length + ' found' + (check.fixed ? ' · ' + check.fixed + ' fixed automatically' : '');
            return '<div class="chk-w"><button type="button" class="chk" data-check="' + check.id + '"' + (is_ok ? ' disabled' : '') + '><span class="st ' + (is_ok ? 'ok' : 'bad') + '">' + core.icon_svg(is_ok ? 'check' : 'minus') + '</span><span class="cb">' + core.escape_html(check.label) + '<span class="cs">' + core.escape_html(sub) + '</span></span></button>' +
              '<button type="button" class="hb" data-help="a:' + check.id + '" aria-label="About ' + core.escape_html(check.label) + '" data-tt="How to fix">' + core.icon_svg('help') + '</button></div>';
          }).join('') + '</div>' +
          '<div class="btns"><button type="button" class="btn ghost" data-act="audit-run" aria-label="Check the page again">' + core.icon_svg('reset') + 'Check page again</button><button type="button" class="btn ghost" data-act="audit-clear" aria-label="Remove the marks from the page">' + core.icon_svg('close') + 'Clear page marks</button></div>' +
          '<div class="sec">' + this.section_heading_html('Usage on this device', 'usage') + (top.length ? '<div class="list">' + top.map(function (item) { return '<div class="kl"><span>' + core.escape_html(core.ui.feature_label(item)) + '</span><span>' + core.usage[item] + '×</span></div>'; }).join('') + '</div>' : '<p class="hint m0">No features used yet.</p>') + '</div>' +
          '';
        core.find_one('.score .bar i', box).style.width = result.score + '%';
      }
    };
  // Outlines on the page the elements a check found
  core.ui.mark_check = function (id) {
    var list = this.audit_res && this.audit_res.checks.filter(function (check) { return check.id === id; })[0];
    if (!list || !list.open.length) return;
    core.find_all('.acc-mark', document).forEach(function (node) { node.classList.remove('acc-mark'); });
    list.open.forEach(function (dialog) { if (dialog && dialog.classList && dialog !== document.documentElement && dialog !== document.body) dialog.classList.add('acc-mark'); });
    var first = list.open.filter(function (dialog) { return dialog !== document.documentElement && dialog !== document.body && dialog.getClientRects && dialog.getClientRects().length; })[0];
    if (first) { try { first.scrollIntoView({ block: 'center' }); } catch (error) { first.scrollIntoView(); } }
    core.announce(list.open.length + ' marked on the page');
    if (core.view_width() < 700) this.close();
  };
  core.register('click_attribute', { folder: 'page-check', attribute: 'data-check', order: 160, run: function (target) {
    core.ui.mark_check(target.getAttribute('data-check'));
  } });
  core.register('action', { folder: 'page-check', names: ['audit-run'], run: function (target) {
    core.ui.open_view('audit');
  } });
  core.register('action', { folder: 'page-check', names: ['audit-clear'], run: function (target) {
    core.find_all('.acc-mark', document).forEach(function (node) { node.classList.remove('acc-mark'); });
  } });
});
