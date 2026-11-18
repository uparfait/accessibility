/* page-check/page-check.js: Page check: an accessibility check of the page with a score */
accessibles_core.define('page-check/page-check.js', ['page-check-2.js', 'page-check-3.js'], function (core) {
  'use strict';
  // The page check, as steps that can run one by one
  core.audit_steps = function () {
    var out = [];
    var all = function (selector) { return Array.prototype.filter.call(document.querySelectorAll(selector), function (element) { return !core.is_ours(element); }); };
    var fixed = function (element, key) { return (' ' + (element.getAttribute('data-acc-fixed') || '') + ' ').indexOf(' ' + key + ' ') > -1; };
    function check(id, label, weight, offenders, fixed_count, help) { out.push({ id: id, label: label, weight: weight, open: offenders, fixed: fixed_count || 0, help: help }); }
    var steps = core.audit_checks.map(function (run_check) { return function () { run_check(check, all); }; });
    var finish = function () {
      var total = 0, earned = 0;
      out.forEach(function (item) { total += item.weight; if (!item.open.length) earned += item.weight; });
      return { checks: out, score: Math.round(earned / total * 100), adjusted: !!(core.filter_value() || core.state.contrast || core.state.textColor || core.state.bgColor) };
    };
    return { steps: steps, finish: finish };
  };
  // Runs the whole page check at once and returns the result
  core.run_audit = function () { var first = core.audit_steps(); first.steps.forEach(function (step) { step(); }); return first.finish(); };
  // Runs the page check step by step, so the page stays responsive
  core.run_audit_async = function (on_progress) {
    var first = core.audit_steps(), count = 0;
    return new Promise(function (resolve) {
      (function next() {
        if (count >= first.steps.length) { resolve(first.finish()); return; }
        try { first.steps[count](); } catch (error) { /* skip a failing check */ }
        count++;
        if (on_progress) on_progress(count / first.steps.length);
        core.run_later(next, 16);
      })();
    });
  };
});
