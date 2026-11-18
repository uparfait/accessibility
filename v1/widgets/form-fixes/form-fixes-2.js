/* form-fixes/form-fixes-2.js: Form fixes, continued */
accessibles_core.define('form-fixes/form-fixes-2.js', [], function (core) {
  'use strict';
  // Applies the same changes to new content added to the page
  core.form_fixes.fix = function (root) {
    if (!this.on || !root || root.nodeType !== 1) return;
    var recorder = this.recorder, self = this;
    var fields = Array.prototype.slice.call(root.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"]),select,textarea'));
    if (root.matches && root.matches('input,select,textarea')) fields.unshift(root);
    fields.forEach(function (field) {
      if (core.is_ours(field)) return;
      var has_label = (field.labels && Array.prototype.some.call(field.labels, function (item) { return core.text_of(item); })) || core.accessible_name_attribute(field) || (field.getAttribute('title') || '').trim();
      if (!has_label) {
        var name = (field.getAttribute('placeholder') || '').trim() || self.nearby_text(field) || core.humanize(field.getAttribute('name') || field.id || '') || core.humanize(field.type || 'Field');
        recorder.set(field, 'aria-label', name); core.mark_fixed(recorder, field, 'form');
      }
      if (field.required && !field.hasAttribute('aria-required')) recorder.set(field, 'aria-required', 'true');
      if (!field.hasAttribute('autocomplete') && field.tagName === 'INPUT') {
        var hint = ((field.getAttribute('name') || '') + ' ' + (field.id || '') + ' ' + field.type).toLowerCase();
        var autocomplete_token = /e-?mail/.test(hint) ? 'email' : /(^|\W)tel|phone|mobile/.test(hint) ? 'tel' : /first.?name|given/.test(hint) ? 'given-name' : /last.?name|surname|family/.test(hint) ? 'family-name' : /(^|\W)(full.?)?name($|\W)/.test(hint) ? 'name' : /zip|postal/.test(hint) ? 'postal-code' : '';
        if (autocomplete_token) recorder.set(field, 'autocomplete', autocomplete_token);
      }
      // Error messages near the field
      var group = field.closest('.form-group,.field,.form-field,.input-group,.form-row,.control-group,fieldset,label,p,li,div');
      var error_selector = '.error,.errors,.invalid-feedback,.field-error,.error-message,.help-block.error,[class*="error-text"],[class*="errorMessage"],[role="alert"]';
      var sibling = field.nextElementSibling;
      if (group && group.querySelectorAll('input:not([type="hidden"]),select,textarea').length > 2) group = null;
      if (sibling && sibling.matches(error_selector)) group = { querySelector: function () { return sibling; } };
      if (group) {
        var error_value = group.querySelector('.error,.errors,.invalid-feedback,.field-error,.error-message,.help-block.error,[class*="error-text"],[class*="errorMessage"],[role="alert"]');
        if (error_value && error_value !== field && core.text_of(error_value)) {
          if (!error_value.id) recorder.set(error_value, 'id', 'acc-err-' + Math.random().toString(36).slice(2, 8));
          var described_by = field.getAttribute('aria-describedby') || '';
          if ((' ' + described_by + ' ').indexOf(' ' + error_value.id + ' ') < 0) recorder.set(field, 'aria-describedby', (described_by + ' ' + error_value.id).trim());
          if (!error_value.hasAttribute('aria-live') && !error_value.getAttribute('role')) recorder.set(error_value, 'aria-live', 'polite');
          if (core.is_visible(error_value) && !field.hasAttribute('aria-invalid')) recorder.set(field, 'aria-invalid', 'true');
          core.mark_fixed(recorder, field, 'form');
        }
      }
    });
    // Native validation messages: announce and mark invalid on submit attempts
    if (root === document.body && !this.listening) {
      this.listening = true;
      document.addEventListener('invalid', function (event) {
        if (!self.on) return;
        var title = event.target;
        if (title && title.setAttribute) { title.setAttribute('aria-invalid', 'true'); if (title.validationMessage) core.announce(title.validationMessage); }
      }, true);
      document.addEventListener('input', function (event) {
        var title = event.target;
        if (self.on && title && title.getAttribute && title.getAttribute('aria-invalid') === 'true' && title.checkValidity && title.checkValidity() && !title.getAttribute('aria-describedby')) title.removeAttribute('aria-invalid');
      }, true);
    }
  };
  core.register('module', { folder: 'form-fixes', order: 60, module: core.form_fixes });
});
