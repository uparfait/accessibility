/* page-summary/page-summary-2.js: Page summary, continued */
accessibles_core.define('page-summary/page-summary-2.js', [], function (core) {
  'use strict';
  // The key points of the page (the browser's summarizer when it has one)
  core.summarize = function () {
    var main = core.find_main();
    var text = core.main_text(main, true);
    var words = (text.match(/\S+/g) || []).length;
    var heads = Array.prototype.filter.call(main.querySelectorAll('h2,h3,h4'), function (heading) { return core.is_visible(heading) && !core.is_ours(heading); }).map(core.text_of).filter(Boolean).slice(0, 8);
    var base = { words: words, minutes: Math.max(1, Math.round(words / 200)), headings: heads };
    function timeout(part, delay_ms) { return Promise.race([part, new Promise(function (unused, reject) { core.run_later(function () { reject(new Error('timeout')); }, delay_ms); })]); }
    var attempt = null;
    if (core.config.summarize_provider) {
      attempt = timeout(Promise.resolve(core.config.summarize_provider(text.slice(0, 20000))), 20000);
    } else if (typeof window.Summarizer === 'function' || (window.Summarizer && window.Summarizer.availability)) {
      var ok_l = ['en', 'es', 'ja', 'de', 'fr'], user_language = core.user_lang().split('-')[0].toLowerCase(), page_language = core.page_lang().split('-')[0].toLowerCase();
      var s_opts = { type: 'key-points', format: 'plain-text', length: 'medium', outputLanguage: ok_l.indexOf(user_language) > -1 ? user_language : 'en', expectedInputLanguages: [ok_l.indexOf(page_language) > -1 ? page_language : 'en'] };
      attempt = timeout(window.Summarizer.availability(s_opts).then(function (availability) {
        if (availability !== 'available') throw new Error('not ready');
        return window.Summarizer.create(s_opts);
      }).then(function (summarizer) { return summarizer.summarize(text.slice(0, 12000)); }), 15000);
    }
    if (!attempt) attempt = Promise.reject(new Error('none'));
    return attempt.then(function (result) {
      var points = Array.isArray(result) ? result : String(result || '').split(/\n+/);
      points = points.map(function (point) { return String(point).replace(/^\s*([-*•]|\d+[.)])\s*/, '').trim(); }).filter(Boolean);
      if (!points.length) throw new Error('empty');
      base.points = points; return base;
    }).catch(function () {
      base.points = core.extractive_summary(text);
      return base;
    });
  };
  core.stop_words = ('a an the and or but if then so of to in on at by for with from as is are was were be been being it its this that these those there here we you he she they them our your their his her not no yes do does did have has had will would can could should may might must also than more most such into over under about after before between while which who whom what when where why how all any each few other some only own same just very i me my mine us').split(' ');
  core.stop_word_set = {};
  core.stop_words.forEach(function (width) { core.stop_word_set[width] = 1; });
  core.ui.views.summary = {
      title: 'Page summary',
      render: function (box) {
        var self = this;
        box.innerHTML = '<div class="wait" translate="no">' + core.icon_svg('spinner', 'spin') + '<span>' + core.escape_html(core.translate_ui('Reading the page…')) + '</span></div>';
        core.summarize().then(function (result) {
          if (self.view !== 'summary') return;
          self.summary_points = result.points;
          var meta = '<div class="meta"><span class="chip">' + result.words.toLocaleString() + ' words</span><span class="chip">' + result.minutes + ' min read</span></div>';
          var points = result.points.length ? '<ul class="sum">' + result.points.map(function (point) { return '<li>' + core.escape_html(point) + '</li>'; }).join('') + '</ul>' : '<p class="empty">This page does not have enough text to summarize.</p>';
          var head_score = result.headings.length ? '<div class="sec"><h3 class="sh">Sections</h3><div class="list">' + result.headings.map(function (heading) { return '<div class="li"><span class="lt">' + core.escape_html(heading) + '</span></div>'; }).join('') + '</div></div>' : '';
          box.innerHTML = meta + points + '<div class="btns">' + (result.points.length ? '<button type="button" class="btn" data-act="sum-read" aria-label="Listen to the summary">' + core.icon_svg('speak') + 'Listen to summary</button><button type="button" class="btn ghost" data-act="sum-copy" aria-label="Copy the summary">' + core.icon_svg('copy') + 'Copy summary</button>' : '') + '</div>' + head_score;
        });
      }
    };
  core.register('action', { folder: 'page-summary', names: ['sum-read'], run: function (target) {
    if (core.ui.summary_points) { if (!core.state.tts) core.set_state('tts', true); core.speech.play(core.ui.summary_points.map(function (part) { return { text: part, element: null }; })); }
  } });
  core.register('action', { folder: 'page-summary', names: ['sum-copy'], run: function (target) {
    core.ui.copy((core.ui.summary_points || []).map(function (part) { return '- ' + part; }).join('\n'), target);
  } });
});
