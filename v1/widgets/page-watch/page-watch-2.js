/* page-watch/page-watch-2.js: Watches the page for new content and keeps the widget on top, continued */
accessibles_core.define('page-watch/page-watch-2.js', [], function (core) {
  'use strict';
  // Keeps the widget above popovers and dialogs the page opens
  core.watch_top_layer = function () {
    if (!core.use_top_layer) return;
    // The widget's own layers (and anything inside them) never count as someone else's
    var other = function (element) { return element && element.nodeType === 1 && element !== core.host && !core.is_ours(element) && !(core.top_box_element && (element === core.top_box_element || core.top_box_element.contains(element))); };
    document.addEventListener('toggle', function (event) {
      var target = event.target;
      if (!other(target)) return;
      if (core.is_modal(target) || (target.tagName === 'DIALOG' && event.newState === 'closed')) { core.run_later(core.settle_home, 0); return; }
      if (event.newState === 'open' && target.matches(':popover-open')) core.run_later(core.raise_widget, 0);
    }, true);
    document.addEventListener('close', function (event) { if (event.target && event.target.tagName === 'DIALOG') core.run_later(core.settle_home, 0); }, true);
    document.addEventListener('fullscreenchange', function () { if (document.fullscreenElement) core.run_later(core.raise_widget, 0); });
    if (window.MutationObserver) new MutationObserver(function (list) {
      for (var count = 0; count < list.length; count++) {
        var target = list[count].target;
        if (list[count].type === 'attributes' && other(target) && target.tagName === 'DIALOG') { core.run_later(core.settle_home, 0); return; }
        // The dialog holding the widget was removed from the page
        if (list[count].type === 'childList' && core.host_home && !core.host.isConnected) { core.run_later(core.settle_home, 0); return; }
      }
    }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['open'] });
  };
  // Watches the page for new content and fixes it too
  core.observe_page = function () {
    if (!window.MutationObserver || !document.body) return;
    new MutationObserver(function (list) {
      for (var count = 0; count < list.length; count++) {
        var added = list[count].addedNodes;
        for (var count_2 = 0; count_2 < added.length; count_2++) {
          var node = added[count_2];
          if (node.nodeType === 1 && !core.is_ours(node) && !(node.classList && (node.classList.contains('acc-skip') || node.classList.contains('acc-sr-only') || node.classList.contains('acc-imgalt')))) core.pending_roots.push(node);
        }
      }
      if (core.pending_roots.length) core.process_roots();
    }).observe(document.body, { childList: true, subtree: true });
    // If a framework re-renders <html> children, put the widget back
    new MutationObserver(function () {
      if (core.top_box_element && !core.top_box_element.isConnected) { document.documentElement.appendChild(core.top_box_element); if (core.use_top_layer) { try { core.top_box_element.showPopover(); } catch (error) { /* ignore */ } } }
      if (!core.host.isConnected) { document.documentElement.appendChild(core.host); if (core.use_top_layer) { try { core.host.showPopover(); } catch (error) { /* ignore */ } } }
      if (core.color_blind_svg && !core.color_blind_svg.isConnected) document.documentElement.appendChild(core.color_blind_svg);
      if (!core.can_adopt_sheets && core.page_style_element && !core.page_style_element.isConnected) (document.head || document.documentElement).appendChild(core.page_style_element);
    }).observe(document.documentElement, { childList: true });
  };
  core.pending_roots = [];
  core.process_roots = core.debounce(function () {
    var roots = core.pending_roots; core.pending_roots = [];
    roots = roots.filter(function (root, index) { return root.isConnected && !core.is_ours(root) && roots.indexOf(root) === index && !roots.some(function (root_2) { return root_2 !== root && root_2.contains(root); }); });
    if (!roots.length) return;
    roots.forEach(function (root) {
      core.registered('module').forEach(function (entry) {
        if (!core.has(entry.folder) || typeof entry.module.fix !== 'function') return;
        try { entry.module.fix(root); } catch (error) { /* keep watching */ }
      });
    });
  }, 250);
});
