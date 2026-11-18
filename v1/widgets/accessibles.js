/* accessibles.js: Starts the Accessibles widget by loading its folders, which sit next to this file */
(function (window, document) {
  'use strict';
  if (!window || !document || window.__accessibles_loaded) return;
  if (!document.documentElement || typeof document.documentElement.attachShadow !== 'function') return;
  window.__accessibles_loaded = true;
  var set_timer = window.setTimeout, clear_timer = window.clearTimeout;
  // This file's <script> tag: its address gives the folder and the version for every other file
  var script_tag = document.currentScript || document.querySelector('script[src*="accessibles"]');
  var script_url = script_tag ? script_tag.src : '', version_match = /[?&]version=([^&#]*)/.exec(script_url);
  var core = window.accessibles_core = {
    script_tag: script_tag, files: {}, folders: {}, core_folders: ['loader'], feature_folders: [],
    base_url: script_url.replace(/[?#].*$/, '').replace(/[^\/]*$/, ''), file_version: version_match ? version_match[1] : ''
  };
  // Adds one file to the page; a file that does not arrive, or arrives broken, is tried again later
  core.fetch_file = function (path) {
    var file = core.files[path] = core.files[path] || { attempts: 0, delay: 0, body: null };
    if (file.body || file.loading) return;
    file.loading = true;
    var query = [core.file_version && 'version=' + core.file_version, file.attempts && 'attempt=' + file.attempts].filter(Boolean).join('&');
    var element = document.createElement('script');
    element.src = core.base_url + path + (query ? '?' + query : '');
    element.onload = element.onerror = function () { file.loading = false; element.remove(); if (!file.body) core.retry_file(path); };
    (document.head || document.documentElement).appendChild(element);
  };
  // Waits longer before each new try: 2s, 4s, 6s, 12s, 14s, 28s, 30s ... (twice as long, then 2s more, in turn)
  core.retry_file = function (path) {
    var file = core.files[path];
    file.attempts++;
    file.delay = file.attempts === 1 ? 2000 : file.attempts % 2 ? file.delay + 2000 : file.delay * 2;
    clear_timer.call(window, file.timer);
    file.timer = set_timer.call(window, function () { core.fetch_file(path); }, Math.min(file.delay, 600000));
    if (core.file_failed) core.file_failed(path);
  };
  // Every file calls this with its path, the files after it in its folder (main file only) and its code
  core.define = function (path, sub_files, body) {
    var folder_name = path.split('/')[0], folder = core.folder(folder_name);
    (core.files[path] = core.files[path] || { attempts: 0, delay: 0 }).body = body;
    if (path === folder_name + '/' + folder_name + '.js') {
      folder.paths = [path].concat(sub_files.map(function (name) { return folder_name + '/' + name; }));
      folder.paths.forEach(core.fetch_file);
    }
    if (core.core_folders.every(core.run_folder)) core.feature_folders.forEach(core.run_folder);
  };
  core.folder = function (name) { return core.folders[name] = core.folders[name] || { name: name, paths: null, state: 'waiting' }; };
  // Runs a folder's files in order once all have arrived (true when ready); a folder that breaks is fetched again
  core.run_folder = function (name) {
    var folder = core.folder(name);
    if (folder.state === 'ready') return true;
    if (!folder.paths || !folder.paths.every(function (path) { return core.files[path].body; })) return false;
    try { folder.paths.forEach(function (path) { core.files[path].body(core); }); } catch (error) {
      folder.paths.forEach(function (path) { core.files[path].body = null; core.retry_file(path); });
      return false;
    }
    folder.state = 'ready';
    if (core.folder_ready) core.folder_ready(name);
    return true;
  };
  core.fetch_file('loader/loader.js');
})(window, document);
