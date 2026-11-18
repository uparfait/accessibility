/* custom-colors/custom-colors.js: Custom colors: your own background, text and title colors */
accessibles_core.define('custom-colors/custom-colors.js', [], function (core) {
  'use strict';
  core.register('page_css', { folder: 'custom-colors', order: 160, rules: function (body) {
    var list = [];
    if (core.state.bgColor) list.push(body + ',' + body + ' *' + core.not_media + '{background-color:' + core.state.bgColor + '!important}');
    if (core.state.textColor) list.push(body + ',' + body + ' *' + core.not_media + '{color:' + core.state.textColor + '!important}');
    if (core.state.titleColor) list.push(body + ' :is(' + core.headings + '),' + body + ' :is(' + core.headings + ') *{color:' + core.state.titleColor + '!important}');
    return list;
  } });
});
