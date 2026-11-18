/* page-fixes/page-fixes-3.js: Shared tools for fixing page markup and naming elements, continued */
accessibles_core.define('page-fixes/page-fixes-3.js', [], function (core) {
  'use strict';
  // Moves focus to the next or previous element matching a selector
  core.move_to = function (selector, direction) {
    var list = Array.prototype.filter.call(document.querySelectorAll(selector), function (element) { return !core.is_ours(element) && core.is_visible(element); });
    if (!list.length) { core.announce('None found'); return; }
    var current = document.activeElement && document.activeElement !== document.body && !core.is_ours(document.activeElement) ? document.activeElement : null;
    var next = -1, index;
    if (!current) next = direction > 0 ? 0 : list.length - 1;
    else if (direction > 0) {
      for (index = 0; index < list.length; index++) if (list[index] !== current && (current.compareDocumentPosition(list[index]) & Node.DOCUMENT_POSITION_FOLLOWING)) { next = index; break; }
      if (next < 0) next = 0;
    } else {
      for (index = list.length - 1; index >= 0; index--) if (list[index] !== current && !list[index].contains(current) && (current.compareDocumentPosition(list[index]) & Node.DOCUMENT_POSITION_PRECEDING)) { next = index; break; }
      if (next < 0) next = list.length - 1;
    }
    var element = list[next];
    core.focus_element(element);
    var label = /^H[1-6]$/.test(element.tagName) ? 'Heading level ' + element.tagName.charAt(1) + ', ' : '';
    core.announce(label + (core.accessible_name(element) || core.text_of(element)).slice(0, 120));
  };
  core.change_recorder.prototype.set = function (element, attr, value) {
    this.records.push([element, attr, element.getAttribute(attr)]);
    element.setAttribute(attr, value);
  };
  core.change_recorder.prototype.add = function (node) { this.nodes.push(node); return node; };
  core.change_recorder.prototype.revert = function () {
    for (var index = this.records.length - 1; index >= 0; index--) {
      var rect = this.records[index];
      if (rect[2] === null) rect[0].removeAttribute(rect[1]); else rect[0].setAttribute(rect[1], rect[2]);
    }
    this.nodes.forEach(function (node) { if (node.parentNode) node.parentNode.removeChild(node); });
    this.records = []; this.nodes = [];
  };
  core.icon_words = [
    [/close|times|dismiss|(^|[-_ ])x($|[-_ ])/, 'Close'], [/hamburger|menu|bars|navicon/, 'Menu'], [/search|magnif|loupe/, 'Search'],
    [/cart|basket|bag|shop/, 'Shopping cart'], [/user|account|profile|person|avatar/, 'Account'], [/home|house/, 'Home'],
    [/facebook/, 'Facebook'], [/twitter/, 'Twitter'], [/instagram/, 'Instagram'], [/linkedin/, 'LinkedIn'], [/youtube/, 'YouTube'],
    [/whatsapp/, 'WhatsApp'], [/tiktok/, 'TikTok'], [/github/, 'GitHub'], [/telegram/, 'Telegram'],
    [/arrow[-_ ]?left|prev|chevron[-_ ]?left|angle[-_ ]?left|back/, 'Previous'], [/arrow[-_ ]?right|next|chevron[-_ ]?right|angle[-_ ]?right|forward/, 'Next'],
    [/arrow[-_ ]?up|to[-_ ]?top|chevron[-_ ]?up/, 'Back to top'], [/caret|chevron[-_ ]?down|angle[-_ ]?down|dropdown|expand/, 'Expand'],
    [/play/, 'Play'], [/pause/, 'Pause'], [/download/, 'Download'], [/upload/, 'Upload'], [/share/, 'Share'], [/heart|like|favou?rite|star/, 'Favorite'],
    [/mail|envelope|email/, 'Email'], [/phone|call/, 'Phone'], [/plus|add/, 'Add'], [/minus|remove/, 'Remove'], [/edit|pencil|pen/, 'Edit'],
    [/trash|delete|bin/, 'Delete'], [/settings|gear|cog/, 'Settings'], [/bell|notif/, 'Notifications'], [/globe|language|lang/, 'Language'],
    [/filter/, 'Filter'], [/sort/, 'Sort'], [/info/, 'Information'], [/help|question/, 'Help'], [/calendar|date/, 'Calendar'],
    [/location|map|marker|pin/, 'Location'], [/print/, 'Print'], [/login|sign[-_ ]?in/, 'Sign in'], [/logout|sign[-_ ]?out/, 'Sign out']
  ];
});
