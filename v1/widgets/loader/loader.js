/* loader/loader.js: The order of the widget's folders and the folders each feature needs */
accessibles_core.define('loader/loader.js', ['loader-2.js', 'loader-3.js'], function (core) {
  'use strict';
  // The widget's own folders: they run one after another, in this order
  core.core_folders.push(
    'helpers', 'config', 'colors', 'icons', 'catalogue', 'help-texts', 'illustrations', 'settings', 'page-styles', 'page-fixes', 'page-text',
    'speech', 'pointer', 'typing', 'translation', 'changes', 'panel-styles', 'panel', 'page-watch', 'start'
  );
  // Feature folders: each one loads and runs on its own, so one that fails never stops the others
  core.feature_folders = [
    'content-scaling', 'bigger-text', 'fonts', 'line-height', 'letter-spacing', 'word-spacing', 'bolder-text', 'text-align', 'text-direction',
    'highlight-titles', 'highlight-links', 'magnifier', 'dark-mode', 'dark-contrast', 'light-contrast', 'high-contrast', 'smart-contrast', 'invert-colors',
    'monochrome', 'low-saturation', 'high-saturation', 'color-blindness', 'custom-colors', 'brightness', 'keyboard-navigation', 'focus-highlight',
    'hover-highlight', 'page-structure', 'big-black-cursor', 'big-white-cursor', 'on-screen-keyboard', 'voice', 'voice-commands', 'talk-and-type',
    'bigger-targets', 'more-time', 'read-aloud', 'reading-guide', 'reading-mask', 'stop-animations', 'hide-images', 'mute-sounds', 'tooltips',
    'spoken-tips', 'reader-view', 'dictionary', 'page-summary', 'sign-language', 'translate', 'aria-fixes', 'image-descriptions', 'form-fixes',
    'feature-position', 'page-check', 'report-issue', 'accessibility-statement'
  ];
  // The folders each feature of the panel needs, by feature id
  core.feature_map = {
    contentScale: ['content-scaling'], fontSize: ['bigger-text'], font: ['fonts'], lineHeight: ['line-height'], letterSpacing: ['letter-spacing'],
    wordSpacing: ['word-spacing'], fontWeight: ['bolder-text'], textAlign: ['text-align'], textDir: ['text-direction'],
    highlightTitles: ['highlight-titles'], highlightLinks: ['highlight-links'], magnifier: ['magnifier'], darkMode: ['dark-mode'], darkContrast: ['dark-contrast'],
    lightContrast: ['light-contrast'], highContrast: ['high-contrast'], smartContrast: ['smart-contrast'], invert: ['invert-colors'],
    mono: ['monochrome'], lowSat: ['low-saturation'], highSat: ['high-saturation'], colorBlind: ['color-blindness'], customColors: ['custom-colors'],
    brightness: ['brightness'], keyboardNav: ['keyboard-navigation', 'focus-highlight'], focusRing: ['focus-highlight'],
    hoverHighlight: ['hover-highlight'], structure: ['page-structure'], cursorBlack: ['big-black-cursor'], cursorWhite: ['big-white-cursor'],
    vkeyboard: ['on-screen-keyboard'], voiceNav: ['voice', 'voice-commands', 'talk-and-type'],
    dictation: ['voice', 'voice-commands', 'talk-and-type'], bigTargets: ['bigger-targets'], extendedTime: ['more-time'], tts: ['read-aloud'],
    readingGuide: ['reading-guide'], readingMask: ['reading-mask'], stopAnimations: ['stop-animations'], hideImages: ['hide-images'],
    mute: ['mute-sounds'], tooltips: ['tooltips'], spokenTips: ['spoken-tips'], reader: ['reader-view'], dictionary: ['dictionary'],
    summary: ['page-summary'], sign: ['sign-language'], translate: ['translate'], ariaFix: ['aria-fixes'], altText: ['image-descriptions'],
    formFix: ['form-fixes'], position: ['feature-position'], audit: ['page-check'], reportIssue: ['report-issue'],
    statementLink: ['accessibility-statement']
  };
});
