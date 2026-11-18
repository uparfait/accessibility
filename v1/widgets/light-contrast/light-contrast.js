/* light-contrast/light-contrast.js: Light contrast: dark text on a light page */
accessibles_core.define('light-contrast/light-contrast.js', [], function (core) {
  'use strict';
  core.register('page_css', { folder: 'light-contrast', order: 150, rules: function (body) {
    var list = [];
    if (core.state.contrast === 'light') {
      list.push(body + ',' + body + ' *' + core.not_media + '{background-color:#ffffff!important;color:#141414!important;border-color:#6b6b6b!important;text-shadow:none!important}');
      list.push(body + ' :is(' + core.headings + '),' + body + ' :is(' + core.headings + ') *{color:#000000!important}');
      list.push(body + ' :is(a[href],a[href] *){color:#0645ad!important}');
      list.push(body + ' :is(input,textarea,select,button){background-color:#ffffff!important;border-color:#444!important}');
    }
    return list;
  } });
});
