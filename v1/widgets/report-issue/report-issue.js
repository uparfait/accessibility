/* report-issue/report-issue.js: Report an issue: sends a problem report by email or to your server */
accessibles_core.define('report-issue/report-issue.js', ['report-issue-2.js'], function (core) {
  'use strict';
  core.ui.views.report = {
      title: 'Report an issue',
      render: function (box) {
        box.innerHTML = '<div class="field"><span>What kind of problem?</span>' + this.select_html('reptype') + '</div>' +
          '<label class="field"><span>Describe the problem</span><textarea class="rep-msg inp" placeholder="What were you trying to do, and what happened?"></textarea></label>' +
          '<label class="field"><span>Email, so we can reply</span><input type="email" class="rep-mail inp" autocomplete="email" required aria-required="true" placeholder="Enter your valid mail address"></label>' +
          // Messages (thanks, problems, what to do next) sit above the buttons
          '<p class="status rep-status" role="status"></p>' +
          '<div class="btns rep-btns"><button type="button" class="btn" data-act="report-send">' + core.icon_svg('report') + 'Send the report</button><button type="button" class="btn ghost" data-act="report-copy">' + core.icon_svg('copy') + 'Copy the report</button></div>' +
          // Shown while the visitor's email app opens: did the email go?
          '<div class="btns rep-confirm" hidden><button type="button" class="btn" data-act="report-sent">' + core.icon_svg('check') + 'Email sent</button><button type="button" class="btn ghost" data-act="report-failed">' + core.icon_svg('close') + 'Failed</button></div>';
      }
    };
  // The text of an issue report
  core.ui.report_text = function () {
    var type = this.report_type || 'Something is hard to read';
    var message = core.find_one('.rep-msg') ? core.find_one('.rep-msg').value.trim() : '';
    var is_on = Object.keys(core.defaults).filter(function (key) { return JSON.stringify(core.state[key]) !== JSON.stringify(core.defaults[key]); }).map(function (key) { return key + '=' + JSON.stringify(core.state[key]); }).join(', ');
    return 'Accessibility issue' + (core.config.site_name ? ' on ' + core.config.site_name : '') + ': ' + type + '\n\n' + message + '\n\nPage: ' + location.href + '\nBrowser: ' + navigator.userAgent + '\nScreen: ' + core.view_width() + 'x' + core.view_height() + '\nSettings: ' + (is_on || 'default');
  };
    // What the report form shows after Send: the email app is opening, it failed, or it was sent
  core.ui.report_state = function (state) {
    var status = core.find_one('.rep-status'), btns = core.find_one('.rep-btns'), conf = core.find_one('.rep-confirm');
    if (!status || !btns || !conf) return;
    btns.hidden = state === 'opening';
    conf.hidden = state !== 'opening';
    var focus = null;
    if (state === 'opening') { status.textContent = core.translate_ui('We are opening your email app. Click Send there if it opened.'); focus = core.find_one('[data-act="report-sent"]', conf); }
    else if (state === 'failed') { status.textContent = core.translate_ui('The email did not send. Copy the report and send it yourself, or click Send the report again.'); focus = core.find_one('[data-act="report-send"]', btns); }
    else if (state === 'sent') {
      core.find_one('.rep-msg').value = ''; core.find_one('.rep-mail').value = ''; core.find_one('.rep-mail').removeAttribute('aria-invalid');
      status.textContent = core.translate_ui('Thanks for your feedback.');
      focus = core.find_one('.rep-msg');
    }
    if (focus) { try { focus.focus({ preventScroll: true }); } catch (error) { /* ignore */ } }
  };
});
