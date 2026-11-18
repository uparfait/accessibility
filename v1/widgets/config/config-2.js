/* config/config-2.js: Reads the options from the script URL, the page and window.AccessiblesConfig, continued */
accessibles_core.define('config/config-2.js', [], function (core) {
  'use strict';
  // Collects every option: script address, data attributes and window.AccessiblesConfig
  core.read_config = function (mount) {
    var group = window.AccessiblesConfig || window.accessiblesConfig || {};
    var raw = {};
    Object.keys(group).forEach(function (key) { if (typeof group[key] !== 'function' && typeof group[key] !== 'object') raw[core.normalize_key(key)] = group[key]; });
    var query = core.parse_query(core.script_src);
    Object.keys(query).forEach(function (key) { raw[key] = query[key]; });
    if (mount && mount.attributes) {
      for (var count = 0; count < mount.attributes.length; count++) {
        var first = mount.attributes[count];
        if (first.name.indexOf('data-') === 0) raw[core.normalize_key(first.name.slice(5))] = first.value;
      }
    }
    var off = core.to_number(raw.offset, 20);
    return {
      color: raw.color || raw.primary || raw.colour || '#2F6B5A',
      bg: raw.bg || raw.background || raw.backgroundcolor || '#000000',
      icon_color: raw.iconcolor || raw.ink || '',
      site_name: String(raw.sitename || raw.site || '').trim(),
      site_icon: String(raw.siteiconurl || raw.siteicon || raw.icon || '').trim(),
      position: core.normalize_position(raw.position || raw.pos || 'bottom-right'),
      offset_x: core.to_number(raw.offsetx, off),
      offset_y: core.to_number(raw.offsety, off),
      title: raw.title || 'Accessibility',
      statement: raw.statement || '',
      report: raw.report || '',
      analytics: raw.analytics || '',
      large: /^(large|big|xl)$/i.test(raw.size || ''),
      draggable: !/^(false|0|no|off)$/i.test(String(raw.draggable == null ? 'true' : raw.draggable)),
      lang: raw.lang || '',
      readable_font_url: raw.readablefonturl || 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&display=swap',
      dyslexic_font_url: raw.dyslexicfonturl || 'https://fonts.googleapis.com/css2?family=Lexend:wght@300..700&display=swap',
      dictionary_url: raw.dictionary || '',
      // Optional hooks (functions) — only from window.AccessiblesConfig
      alt_text_provider: typeof group.altText === 'function' ? group.altText : null,
      summarize_provider: typeof group.summarize === 'function' ? group.summarize : null,
      sign_hook: typeof group.signProvider === 'function' ? group.signProvider : null,
      glossary: (group.glossary && typeof group.glossary === 'object') ? group.glossary : (window.AccessiblesGlossary || null),
      sign_video_map: (group.signVideos && typeof group.signVideos === 'object') ? group.signVideos : null
    };
  };
  core.script_src = core.script_tag ? (core.script_tag.getAttribute('src') || '') : '';
  core.script_base = '';
  try { core.script_base = core.script_tag ? new URL('.', core.script_tag.src).href : ''; } catch (error) { core.script_base = ''; }
  core.host = undefined; core.shadow = undefined; core.root = undefined; core.config = undefined;
});
