/* bigger-targets/bigger-targets.js: Bigger targets: larger buttons, links and checkboxes */
accessibles_core.define('bigger-targets/bigger-targets.js', [], function (core) {
  'use strict';
  core.register('page_css', { folder: 'bigger-targets', order: 190, rules: function (body) {
    var list = [];
    if (core.state.bigTargets) {
      list.push(body + ' :is(button,[role="button"],input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]),select,summary){min-height:44px!important;min-width:44px!important}');
      list.push(body + ' input:is([type="checkbox"],[type="radio"]){width:22px!important;height:22px!important;margin:6px!important}');
      list.push(body + ' a[href]{padding-top:.25em!important;padding-bottom:.25em!important}');
    }
    return list;
  } });
});
