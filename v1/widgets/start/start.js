/* start/start.js: Starts the widget once the page is ready */
accessibles_core.define('start/start.js', ['start-2.js'], function (core) {
  'use strict';
  // Starts the widget: builds it, applies the settings and watches the page
  core.start = function () {
    if (core.started || !document.body) return;
    core.started = true;
    var mount = document.querySelector('.accessibles-widget');
    if (!mount) { mount = document.createElement('div'); mount.className = 'accessibles-widget'; }
    core.config = core.read_config(mount);
    if (core.config.large && !core.store.read()) core.state.oversized = true;
    core.palette = core.build_palette(core.config.color, core.config.bg, core.config.icon_color);
    core.host = mount;
    core.host.setAttribute('data-accessibles', core.version);
    core.host.setAttribute('translate', 'no');
    core.host.classList.add('notranslate');
    // The widget lives outside <body> (and in the top layer when supported),
    // so page-wide filters, zoom and color overrides never touch it.
    document.documentElement.appendChild(core.host);
    core.host.style.cssText = 'all:initial!important;position:fixed!important;inset:0!important;top:0!important;left:0!important;right:0!important;bottom:0!important;width:auto!important;height:auto!important;max-width:none!important;max-height:none!important;margin:0!important;padding:0!important;border:0!important;background:transparent!important;overflow:visible!important;pointer-events:none!important;z-index:2147483647!important;display:block!important;visibility:visible!important;opacity:1!important;transform:none!important;filter:none!important;contain:none!important;color-scheme:light dark!important';
    core.shadow = core.host.shadowRoot || core.host.attachShadow({ mode: 'open' });
    core.add_widget_styles();
    if (core.use_top_layer) {
      try { core.host.setAttribute('popover', 'manual'); core.host.showPopover(); } catch (error) { core.use_top_layer = false; core.host.removeAttribute('popover'); }
    }
    // Widget typeface (Figtree); falls back to the system UI font if it cannot load
    if (!document.querySelector('link[data-accessibles-font]')) { var font_link = core.add_css_link('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap'); font_link.setAttribute('data-accessibles-font', ''); }
    core.panel_translation.load();
    if (core.state.translateTo) core.panel_translation.lang = /^en(-|$)/i.test(core.state.translateTo) ? '' : core.state.translateTo;
    core.ui.build();
    core.apply_all();
    core.observe_page();
    core.watch_top_layer();
    if (core.state.translateTo && core.has('translate')) core.page_translation.run(core.state.translateTo, true);
    core.resume_voice();
    core.expose_api();
    try { window.dispatchEvent(new CustomEvent('accessibles:ready', { detail: { version: core.version } })); } catch (error) { /* ignore */ }
  };

  // The widget's own styles go into its shadow root
  core.add_widget_styles = function () {
    var css = core.widget_css(core.palette);
    var adopted = false;
    if (core.can_adopt_sheets) {
      try { var sheet = new CSSStyleSheet(); sheet.replaceSync(css); core.shadow.adoptedStyleSheets = [sheet]; adopted = true; } catch (error) { adopted = false; }
    }
    if (!adopted) { var status = document.createElement('style'); status.textContent = css; core.shadow.appendChild(status); }
  };

  // Voice input stays on across pages, but only when the microphone is already allowed (no surprise prompts)
  core.resume_voice = function () {
    if (core.voice_was_on && core.speech_recognition && navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' }).then(function (result) { if (result.state === 'granted' && !core.state.voiceNav && !core.state.dictation) core.set_state(core.voice_was_on, true, true); }, function () { /* not supported */ });
    }
  };
});
