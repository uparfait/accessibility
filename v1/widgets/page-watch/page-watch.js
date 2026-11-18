/* page-watch/page-watch.js: Watches the page for new content and keeps the widget on top */
accessibles_core.define('page-watch/page-watch.js', ['page-watch-2.js', 'page-watch-3.js'], function (core) {
  'use strict';
  // The box that holds the widget above a modal dialog
  core.top_box = function () {
    if (core.top_box_element) return core.top_box_element;
    core.top_box_element = document.createElement('div');
    core.top_box_element.id = 'accessibles-top';
    core.top_box_element.setAttribute('data-accessibles', '');
    core.top_box_element.style.cssText = 'position:fixed!important;inset:0!important;width:auto!important;height:auto!important;max-width:none!important;max-height:none!important;margin:0!important;padding:0!important;border:0!important;background:transparent!important;overflow:visible!important;pointer-events:none!important;z-index:2147483647!important;display:block!important;visibility:visible!important;opacity:1!important;transform:none!important;filter:none!important;contain:none!important';
    (core.host_home || document.documentElement).insertBefore(core.top_box_element, core.host && core.host.parentNode === (core.host_home || document.documentElement) ? core.host : null);
    if (core.use_top_layer) { try { core.top_box_element.setAttribute('popover', 'manual'); core.top_box_element.showPopover(); } catch (error) { /* stays a fixed layer */ } }
    return core.top_box_element;
  };
  // Brings the widget back on top of everything
  core.raise_widget = function () {
    if (!core.use_top_layer || !core.host || core.raising) return;
    core.raising = true;
    var had = core.shadow && core.shadow.activeElement;
    if (core.top_box_element) { try { core.top_box_element.hidePopover(); core.top_box_element.showPopover(); } catch (error) { /* ignore */ } }
    try { core.host.hidePopover(); core.host.showPopover(); } catch (error) { /* not shown as a popover */ }
    if (had && had.isConnected) { try { had.focus({ preventScroll: true }); } catch (error) { /* ignore */ } }
    core.run_later(function () { core.raising = false; }, 0);
  };
  // Moves the widget into a modal dialog so it stays usable above it
  core.rehome = function (dialog) {
    var had = core.shadow && core.shadow.activeElement;
    try { if (core.host.matches(':popover-open')) core.host.hidePopover(); } catch (error) { /* ignore */ }
    if (core.top_box_element) { try { if (core.top_box_element.matches(':popover-open')) core.top_box_element.hidePopover(); } catch (error) { /* ignore */ } }
    var home = dialog || document.documentElement;
    if (core.top_box_element) home.appendChild(core.top_box_element);
    home.appendChild(core.host);
    core.host_home = dialog || null;
    if (core.top_box_element) { try { core.top_box_element.showPopover(); } catch (error) { /* ignore */ } }
    try { core.host.showPopover(); } catch (error) { /* ignore */ }
    if (had && had.isConnected) { try { had.focus({ preventScroll: true }); } catch (error) { /* ignore */ } }
  };
  // True when an element is an open modal dialog
  core.is_modal = function (element) { try { return element.tagName === 'DIALOG' && element.open && element.matches(':modal'); } catch (error) { return false; } };
  // Puts the widget where it belongs for the dialogs that are open
  core.settle_home = function () {
    var open = Array.prototype.filter.call(document.querySelectorAll('dialog[open]'), core.is_modal);
    var top = open[open.length - 1] || null;
    if (top !== core.host_home) core.rehome(top); else if (!core.host.isConnected) core.rehome(null);
  };
});
