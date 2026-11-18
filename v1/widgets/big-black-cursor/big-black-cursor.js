/* big-black-cursor/big-black-cursor.js: Big black cursor: a large black mouse pointer */
accessibles_core.define('big-black-cursor/big-black-cursor.js', [], function (core) {
  'use strict';
  core.register('page_css', { folder: 'big-black-cursor', order: 170, rules: function (body) {
    var list = [];
    if (core.state.cursor === 'black') {
      var fill = '#000', stroke = '#fff';
      list.push(body + ',' + body + ' *{cursor:' + core.svg_cursor(fill, stroke, 'arrow') + ',auto!important}');
      list.push(body + ' :is(a[href],a[href] *,button,button *,[role="button"],[role="link"],label,select,summary,[onclick],input[type="submit"],input[type="button"],input[type="checkbox"],input[type="radio"]){cursor:' + core.svg_cursor(fill, stroke, 'hand') + ',pointer!important}');
    }
    return list;
  } });
});
