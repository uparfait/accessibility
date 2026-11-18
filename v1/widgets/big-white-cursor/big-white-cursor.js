/* big-white-cursor/big-white-cursor.js: Big white cursor: a large white mouse pointer */
accessibles_core.define('big-white-cursor/big-white-cursor.js', [], function (core) {
  'use strict';
  core.register('page_css', { folder: 'big-white-cursor', order: 171, rules: function (body) {
    var list = [];
    if (core.state.cursor === 'white') {
      var fill = '#fff', stroke = '#000';
      list.push(body + ',' + body + ' *{cursor:' + core.svg_cursor(fill, stroke, 'arrow') + ',auto!important}');
      list.push(body + ' :is(a[href],a[href] *,button,button *,[role="button"],[role="link"],label,select,summary,[onclick],input[type="submit"],input[type="button"],input[type="checkbox"],input[type="radio"]){cursor:' + core.svg_cursor(fill, stroke, 'hand') + ',pointer!important}');
    }
    return list;
  } });
});
