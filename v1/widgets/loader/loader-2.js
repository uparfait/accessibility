/* loader/loader-2.js: What features add to the widget, and whether a feature has arrived */
accessibles_core.define('loader/loader-2.js', [], function (core) {
  'use strict';
  core.registry = {};
  // Adds something a feature brings (page styles, color filters, modules, button actions ...), kept in order
  core.register = function (kind, item) {
    var list = core.registry[kind] = core.registry[kind] || [];
    list.push(item);
    list.sort(function (first, second) { return (first.order || 0) - (second.order || 0); });
    return item;
  };
  // Everything registered of one kind, in order
  core.registered = function (kind) { return core.registry[kind] || []; };
  // True when every file of a folder has arrived and run
  core.has = function (folder_name) { var folder = core.folders[folder_name]; return !!folder && folder.state === 'ready'; };
  // True when every folder a feature needs is ready
  core.feature_ready = function (feature_id) { return (core.feature_map[feature_id] || []).every(core.has); };
  // Fetches a feature's folders right away (no more waiting for the next try), then runs the callback
  core.load_feature = function (feature_id, then) {
    var needed = core.feature_map[feature_id] || [];
    if (needed.every(core.has)) { if (then) then(); return; }
    core.waiting.push({ folders: needed, then: then });
    needed.forEach(core.fetch_folder_now);
  };
  // Tries a folder's missing files now
  core.fetch_folder_now = function (folder_name) {
    var folder = core.folder(folder_name), paths = folder.paths || [folder_name + '/' + folder_name + '.js'];
    paths.forEach(function (path) {
      var file = core.files[path];
      if (!file) { core.fetch_file(path); return; }
      if (file.body || file.loading) return;
      window.clearTimeout(file.timer);
      core.fetch_file(path);
    });
  };
});
