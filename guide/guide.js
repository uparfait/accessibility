// What every guide page does: the sidebar, the phone menu, colored code with a copy button, and live editors
(function () {
  var root_url = new URL(document.body.getAttribute('data-root') || './', location.href).href;
  var public_url = 'https://uparfait.github.io/accessibility/';

  // ---- Code colors (Night Owl) ----
  function escape_text(text) { return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function span(kind, text) { return '<span class="t-' + kind + '">' + escape_text(text) + '</span>'; }
  // Escapes the plain parts of a text and lets paint_match color each match
  function paint(text, pattern, paint_match) {
    var out = '', last = 0, match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(text))) { out += escape_text(text.slice(last, match.index)) + paint_match(match); last = pattern.lastIndex; }
    return out + escape_text(text.slice(last));
  }
  function color_js(text) {
    return paint(text, /(\/\/[^\n]*)|('[^'\n]*'|"[^"\n]*"|`[^`]*`)|\b(function|var|const|let|return|if|else|new|true|false|null)\b|\b(\d+(?:\.\d+)?)\b|([A-Za-z_$][\w$]*)(?=\()|(=>|[{}()[\];,.])/g, function (match) {
      return match[1] ? span('com', match[1]) : match[2] ? span('str', match[2]) : match[3] ? span('kw', match[3]) : match[4] ? span('num', match[4]) : match[5] ? span('fn', match[5]) : span('pun', match[6]);
    });
  }
  function color_attributes(text) {
    return paint(text, /([\w:-]+)(?:(=)("[^"]*"|'[^']*'))?/g, function (match) {
      return span('attr', match[1]) + (match[2] ? span('pun', match[2]) + span('str', match[3]) : '');
    });
  }
  function color_html(text) {
    var out = '', last = 0, match, pattern = /<!--[\s\S]*?-->|(<script\b[^>]*>)([\s\S]*?)(<\/script>)|<(\/?)([\w-]+)([^>]*?)(\/?)>/g;
    while ((match = pattern.exec(text))) {
      out += escape_text(text.slice(last, match.index));
      if (match[0].indexOf('<!--') === 0) out += span('com', match[0]);
      else if (match[1]) out += color_html(match[1]) + color_js(match[2]) + color_html(match[3]);
      else out += span('pun', '<' + match[4]) + span('tag', match[5]) + color_attributes(match[6]) + span('pun', match[7] + '>');
      last = pattern.lastIndex;
    }
    return out + escape_text(text.slice(last));
  }
  function color(text, language) { return language === 'js' ? color_js(text) : language === 'html' ? color_html(text) : escape_text(text); }

  // Copies text and says so on the button for a moment
  function copy_text(text, button) {
    var done = function () { var label = button.textContent; button.textContent = 'Copied'; setTimeout(function () { button.textContent = label; }, 1500); };
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done, function () {}); return; }
    var box = document.createElement('textarea'); box.value = text; document.body.appendChild(box); box.select();
    try { document.execCommand('copy'); done(); } catch (error) { /* nothing to do */ }
    box.remove();
  }

  // ---- Code blocks ----
  document.querySelectorAll('.code').forEach(function (block) {
    var code = block.querySelector('code'), text = code.textContent;
    code.innerHTML = color(text, code.getAttribute('data-lang'));
    var button = document.createElement('button');
    button.type = 'button'; button.className = 'copy'; button.textContent = 'Copy';
    button.addEventListener('click', function () { copy_text(text, button); });
    block.appendChild(button);
  });

  // ---- Live editors ----
  // The page shown in the preview: the code, with the widget loaded from this site
  function preview_page(code) {
    var body = code.split(public_url).join(root_url);
    return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<style>body{margin:0;padding:24px;font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#1f2a2e;background:#fff}' +
      'h1{font-size:26px;line-height:1.2;margin:0 0 12px}p{margin:0 0 14px;max-width:60ch}img{display:block;width:100%;max-width:560px;height:140px;object-fit:cover;border-radius:6px;margin:0 0 14px}' +
      'button{font:inherit;padding:8px 14px;margin:0 8px 8px 0;border:1px solid #9fb4ba;border-radius:4px;background:#f2f7f8;cursor:pointer}' +
      'input{font:inherit;padding:8px 10px;border:1px solid #9fb4ba;border-radius:4px}a{color:#0f4c5c}</style></head><body>' + body + '</body></html>';
  }
  document.querySelectorAll('.live').forEach(function (live) {
    var area = live.querySelector('textarea'), shown = live.querySelector('pre code'), frame = live.querySelector('iframe');
    var first_code = area.value, timer = 0;
    var paint_code = function () {
      shown.innerHTML = color_html(area.value) + '\n';
      var pre = live.querySelector('pre'), box = live.querySelector('.live-code');
      area.style.height = 'auto';
      area.style.height = pre.scrollHeight + 'px';
      area.style.width = Math.max(box.clientWidth, pre.scrollWidth) + 'px';
    };
    var run = function () { frame.srcdoc = preview_page(area.value); };
    area.addEventListener('input', function () { paint_code(); clearTimeout(timer); timer = setTimeout(run, 700); });
    area.addEventListener('keydown', function (event) {
      if (event.key !== 'Tab' || event.shiftKey) return;
      event.preventDefault();
      var start = area.selectionStart;
      area.setRangeText('  ', start, area.selectionEnd, 'end');
      paint_code();
    });
    live.querySelector('.run').addEventListener('click', run);
    live.querySelector('.copy-code').addEventListener('click', function () { copy_text(area.value, this); });
    live.querySelector('.reset').addEventListener('click', function () { area.value = first_code; paint_code(); run(); });
    paint_code();
    run();
  });

  // ---- Sidebar: one category open at a time ----
  var toggles = Array.prototype.slice.call(document.querySelectorAll('.cat-toggle'));
  toggles.forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      var opening = toggle.getAttribute('aria-expanded') !== 'true';
      toggles.forEach(function (other) {
        var open = other === toggle && opening;
        other.setAttribute('aria-expanded', String(open));
        document.getElementById(other.getAttribute('aria-controls')).hidden = !open;
      });
    });
  });
  var current = document.querySelector('.side [aria-current="page"]');
  if (current && current.scrollIntoView && window.innerWidth > 900) current.scrollIntoView({ block: 'nearest' });

  // ---- Phone menu: opens the sidebar from the top ----
  var menu_button = document.querySelector('.menu-btn');
  function set_menu(open) {
    document.body.classList.toggle('side-open', open);
    menu_button.setAttribute('aria-expanded', String(open));
    menu_button.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
  }
  menu_button.addEventListener('click', function () { set_menu(!document.body.classList.contains('side-open')); });
  document.querySelector('.side').addEventListener('click', function (event) { if (event.target.closest('a')) set_menu(false); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && document.body.classList.contains('side-open')) { set_menu(false); menu_button.focus(); } });
  document.addEventListener('click', function (event) { if (!event.target.closest('.side, .menu-btn')) set_menu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 900) set_menu(false); });

  // ---- GitHub opens in a popup window, centered on the screen ----
  document.querySelectorAll('[data-popup]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      var width = Math.min(1100, screen.availWidth - 80), height = Math.min(780, screen.availHeight - 80);
      var left = (screen.availLeft || 0) + (screen.availWidth - width) / 2, top = (screen.availTop || 0) + (screen.availHeight - height) / 2;
      var popup = window.open(link.href, 'accessibles-github', 'popup=yes,width=' + width + ',height=' + height + ',left=' + left + ',top=' + top);
      if (!popup) return;
      event.preventDefault();
      popup.opener = null;
      popup.focus();
    });
  });
})();
