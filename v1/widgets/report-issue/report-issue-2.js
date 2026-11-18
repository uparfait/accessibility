/* report-issue/report-issue-2.js: Report an issue, continued */
accessibles_core.define('report-issue/report-issue-2.js', [], function (core) {
  'use strict';
  // Sends an issue report by email or to the site's server
  core.ui.send_report = function () {
    var status = core.find_one('.rep-status'), message = core.find_one('.rep-msg').value.trim(), mail = core.find_one('.rep-mail').value.trim();
    if (message.length < 5) { status.textContent = 'Please describe the problem first.'; core.find_one('.rep-msg').focus(); return; }
    // An email is needed so the site can reply
    var mail_field = core.find_one('.rep-mail');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) {
      status.textContent = core.translate_ui(mail ? 'Please enter a valid email address, so we can reply.' : 'Please enter your email address, so we can reply.');
      mail_field.setAttribute('aria-invalid', 'true'); mail_field.focus(); return;
    }
    mail_field.removeAttribute('aria-invalid');
    var dest = core.config.report, self = this;
    var data = { site: core.config.site_name || location.hostname, type: this.report_type || 'Something is hard to read', message: message, email: mail, page: location.href, userAgent: navigator.userAgent, viewport: core.view_width() + 'x' + core.view_height(), settings: core.state, time: new Date().toISOString(), widget: 'accessibles/' + core.version };
    var addr = dest.replace(/^mailto:/i, '');
    if (/^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/.test(addr)) {
      location.href = 'mailto:' + addr + '?subject=' + encodeURIComponent('Accessibility issue: ' + data.type) + '&body=' + encodeURIComponent(this.report_text() + (mail ? '\nReply to: ' + mail : ''));
      this.report_state('opening');
      return;
    }
    if (/^https?:/i.test(dest) || /^\//.test(dest)) {
      status.textContent = 'Sending…';
      fetch(dest, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (result) { if (!result.ok) throw new Error(result.status); self.report_state('sent'); })
        .catch(function () { status.textContent = 'The report could not be sent. Use Copy and send it to the site owner.'; });
      return;
    }
    self.copy(this.report_text());
    status.textContent = 'This site has no report address set up. The report was copied so you can send it yourself.';
  };
  core.register('action', { folder: 'report-issue', names: ['report-send'], run: function (target) {
    core.ui.send_report();
  } });
  core.register('action', { folder: 'report-issue', names: ['report-copy'], run: function (target) {
    core.ui.copy(core.ui.report_text(), target);
  } });
  core.register('action', { folder: 'report-issue', names: ['report-sent'], run: function (target) {
    core.ui.report_state('sent');
  } });
  core.register('action', { folder: 'report-issue', names: ['report-failed'], run: function (target) {
    core.ui.report_state('failed');
  } });
});
