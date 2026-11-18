/* dark-contrast/dark-contrast.js: Dark contrast: light text on a dark page */
accessibles_core.define('dark-contrast/dark-contrast.js', [], function (core) {
  'use strict';
  core.register('page_css', { folder: 'dark-contrast', order: 140, rules: function (body) {
    var list = [];
    if (core.state.contrast === 'dark') {
      list.push(body + ',' + body + ' *' + core.not_media + '{background-color:#121417!important;color:#eef0f2!important;border-color:#3d434a!important;text-shadow:none!important}');
      list.push(body + ' :is(' + core.headings + '),' + body + ' :is(' + core.headings + ') *{color:#ffffff!important}');
      list.push(body + ' :is(a[href],a[href] *){color:#8fc9ff!important}');
      list.push(body + ' :is(input,textarea,select,button){background-color:#1c2025!important;border-color:#7a838c!important}');
      list.push(body + ' ::placeholder{color:#a6adb4!important}');
    }
    return list;
  } });
});
