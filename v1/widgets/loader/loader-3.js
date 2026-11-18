/* loader/loader-3.js: Loads every folder and tells the widget when it can start */
accessibles_core.define('loader/loader-3.js', [], function (core) {
  'use strict';
  var set_timer = window.setTimeout;
  core.waiting = [];
  core.settle_queue = [];
  core.settled = false;
  // A folder is ready: callbacks waiting for it run, and a feature that arrives after the start joins in
  core.folder_ready = function (folder_name) {
    core.folder(folder_name).tried = true;
    core.waiting = core.waiting.filter(function (item) {
      if (!item.folders.every(core.has)) return true;
      if (item.then) item.then();
      return false;
    });
    if (core.started && core.feature_folders.indexOf(folder_name) > -1) core.schedule_apply();
    core.check_settled();
  };
  // A file did not arrive: its folder has had its first try
  core.file_failed = function (path) {
    core.folder(path.split('/')[0]).tried = true;
    core.check_settled();
  };
  // Settled: the widget's own folders are ready and every feature has had its first try (or 5 seconds went by)
  core.check_settled = function () {
    if (core.settled || !core.core_folders.every(core.has)) return;
    if (!core.settle_timer) core.settle_timer = set_timer.call(window, function () { core.settle_timer = 'done'; core.check_settled(); }, 5000);
    var all_tried = core.feature_folders.every(function (folder_name) { return core.folder(folder_name).tried; });
    if (!all_tried && core.settle_timer !== 'done') return;
    core.settled = true;
    core.settle_queue.splice(0).forEach(function (then) { then(); });
  };
  // Runs the callback once settled
  core.when_settled = function (then) {
    if (core.settled) then();
    else core.settle_queue.push(then);
  };
  // Every folder's main file is requested at once; each folder runs as soon as it can
  core.core_folders.concat(core.feature_folders).forEach(function (folder_name) {
    core.fetch_file(folder_name + '/' + folder_name + '.js');
  });
});
