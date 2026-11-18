/* changes/changes.js: Changes a setting and brings the page in line with all settings */
accessibles_core.define('changes/changes.js', ['changes-2.js', 'changes-3.js'], function (core) {
  'use strict';
  // Changes one setting and brings the page in line
  core.set_state = function (key, value, silent) {
    if (core.state[key] === value) return;
    core.state[key] = value;
    var feature_id = core.feature_for(key, value);
    if (feature_id && !core.feature_ready(feature_id)) core.load_feature(feature_id, core.schedule_apply);
    if (key === 'voiceNav' && value) core.state.dictation = false;
    if (key === 'dictation' && value) core.state.voiceNav = false;
    if (key === 'oversized') core.ui.scale();
    if (!silent) { core.track_usage(key, value); core.emit_change(key, value); }
    core.schedule_apply();
  };
  // The feature that handles a setting (for a radio setting, the one for that value)
  core.feature_for = function (key, value) {
    var extra = { brightness: 'brightness', bgColor: 'customColors', textColor: 'customColors', titleColor: 'customColors', translateTo: 'translate' };
    var item = core.features.filter(function (feature) { return feature.key === key && (feature.value === undefined || feature.value === value); })[0];
    return item ? item.id : extra[key] || '';
  };
  // Tells the page a setting changed (accessibles:change event)
  core.emit_change = function (key, value) {
    try { window.dispatchEvent(new CustomEvent('accessibles:change', { detail: { key: key, value: value, state: JSON.parse(JSON.stringify(core.state)) } })); } catch (error) { /* old browser */ }
  };
  // Brings the page in line with the settings on the next frame
  core.schedule_apply = function () {
    if (core.apply_queued) return;
    core.apply_queued = true;
    // Wait one frame so a loading state can paint before heavier work runs.
    // A timer backs it up, because some pages and tabs draw no frames for a while.
    var ran = false;
    var run_next = function () { if (ran) return; ran = true; core.run_later(function () { core.apply_queued = false; core.apply_all(); }, 0); };
    if (window.requestAnimationFrame) requestAnimationFrame(run_next);
    core.run_later(run_next, 120);
  };
  // Moves a cycling setting one step up or down
  core.step_cycle = function (key, direction) {
    var list = core.features.filter(function (feature) { return feature.key === key && feature.type === 'cycle'; })[0];
    if (!list) return;
    var position = list.options.indexOf(core.state[key]);
    core.set_state(key, list.options[core.clamp(position + direction, 0, list.options.length - 1)]);
    core.ui.refresh();
  };
});
