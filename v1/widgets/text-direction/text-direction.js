/* text-direction/text-direction.js: Text direction: left to right or right to left */
accessibles_core.define('text-direction/text-direction.js', ['text-direction-2.js'], function (core) {
  'use strict';
  // Text direction: sets dir on <html> and <body>, restoring the originals exactly
  // Page direction. Right to left mirrors the whole layout the way Arabic, Hebrew or Persian sites are built:
  // dir attributes flip flex, grid and text flow; floats and explicit left/right alignment are swapped too.
  // Translating into a right-to-left language turns it on automatically.
  core.page_direction = function () { return core.state.textDir || (core.state.translateTo && core.rtl_languages.test(core.state.translateTo) ? 'rtl' : ''); };
  core.register('page_css', { folder: 'text-direction', order: 100, rules: function (body) {
    var list = [];
    var direction = core.page_direction();
    if (direction) {
      list.push(body + ',' + body + ' *:not(svg):not(svg *):not(code):not(pre):not(kbd):not(samp):not(input[type="email"]):not(input[type="url"]):not(input[type="tel"]){direction:' + direction + '!important}');
      list.push(body + ' :is(code,pre,kbd,samp){direction:ltr!important;text-align:left!important}');
    }
    return list;
  } });
});
