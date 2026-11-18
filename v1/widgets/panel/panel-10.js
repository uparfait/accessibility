/* panel/panel-10.js: The button, the panel, its tabs, tiles, views, help and messages, continued */
accessibles_core.define('panel/panel-10.js', [], function (core) {
  'use strict';
    // The help window stays put: wheel and touch scrolling outside its text never move the page behind it
  core.ui.bind_help_scroll = function () {
    var help_box = core.find_one('.help');
    var hold_scroll = function (event) {
      var main = event.target.closest && event.target.closest('.help-main,.help-frame');
      if (!main) { event.preventDefault(); return; }
      if (event.type === 'wheel') {
        var at_top = main.scrollTop <= 0, at_end = main.scrollTop + main.clientHeight >= main.scrollHeight - 1;
        if ((event.deltaY < 0 && at_top) || (event.deltaY > 0 && at_end)) event.preventDefault();
      }
    };
    help_box.addEventListener('wheel', hold_scroll, { passive: false });
    help_box.addEventListener('touchmove', function (event) { if (!(event.target.closest && event.target.closest('.help-main'))) event.preventDefault(); }, { passive: false });
    core.root.addEventListener('pointerdown', function () { core.tooltip_bubble.hide(); }, true);
  };
    // Custom sliders: drag with any pointer
  core.ui.bind_sliders = function () {
    var self = this;
    core.root.addEventListener('pointerdown', function (event) {
      self.by_keyboard = false;
      var slider = event.target.closest('.sl');
      if (slider) {
        event.preventDefault();
        try { slider.focus({ preventScroll: true }); } catch (error) { slider.focus(); }
        self.slider_drag = { element: slider, id: event.pointerId };
        try { slider.setPointerCapture(event.pointerId); } catch (error) { /* ignore */ }
        self.slider_from_pointer(slider, event.clientX, true);
      }
      if (!event.target.closest('.cs-pop,[data-sel]')) self.close_select();
      if (!event.target.closest('.cp-pop,[data-cpick]')) self.close_color();
    });
    core.root.addEventListener('pointermove', function (event) { if (self.slider_drag && event.pointerId === self.slider_drag.id) self.slider_from_pointer(self.slider_drag.element, event.clientX, true); });
    var end_slider_drag = function (event) { if (self.slider_drag && event.pointerId === self.slider_drag.id) { var element = self.slider_drag.element; self.slider_drag = null; core.track_usage(element.getAttribute('data-s'), core.state[element.getAttribute('data-s')]); core.save_settings(); } };
    core.root.addEventListener('pointerup', end_slider_drag); core.root.addEventListener('pointercancel', end_slider_drag);
  };
    // The panel's own fields work with the on-screen keyboard and Talk & type; read aloud speaks what gets keyboard focus
  core.ui.bind_focus = function () {
    var self = this;
    core.root.addEventListener('focusin', function (event) {
      var target = event.target;
      if (core.is_editable(target)) { core.last_editable = target; if (core.has('on-screen-keyboard')) self.vkb_target(); }
      if (core.state.tts && core.speech.ok && self.by_keyboard && !target.closest('.vkb')) { var attribute = core.accessible_name(target) || (target.getAttribute('aria-valuetext') || ''); if (attribute) core.speech.say(attribute.slice(0, 200), null); }
    });
  };
});
