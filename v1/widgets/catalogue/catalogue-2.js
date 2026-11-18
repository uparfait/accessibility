/* catalogue/catalogue-2.js: The list of profiles, features and panel tabs, continued */
accessibles_core.define('catalogue/catalogue-2.js', [], function (core) {
  'use strict';
  core.features = [
    // Text
    { id: 'contentScale', tab: 'text', type: 'cycle', key: 'contentScale', icon: 'scale', label: 'Content scaling', options: [1, 1.1, 1.25, 1.4, 1.6], format: core.percent, keywords: 'zoom page size' },
    { id: 'fontSize', tab: 'text', type: 'cycle', key: 'fontSize', icon: 'fontSize', label: 'Bigger text', options: [1, 1.15, 1.3, 1.5, 1.75], format: core.percent, keywords: 'font size large' },
    { id: 'font', tab: 'text', type: 'view', view: 'fonts', key: 'font', icon: 'font', label: 'Font', value: function () { return core.has('fonts') ? core.font_name(core.state.font) : 'Original'; }, keywords: 'readable dyslexia typeface legible family' },
    { id: 'lineHeight', tab: 'text', type: 'cycle', key: 'lineHeight', icon: 'lineHeight', label: 'Line height', options: [0, 1.5, 1.8, 2.1], format: function (value) { return value ? value + '×' : 'Default'; }, keywords: 'spacing lines' },
    { id: 'letterSpacing', tab: 'text', type: 'cycle', key: 'letterSpacing', icon: 'letterSpacing', label: 'Letter spacing', options: [0, 0.05, 0.1, 0.16], format: function (value) { return ['Default', 'Light', 'Medium', 'Wide'][[0, 0.05, 0.1, 0.16].indexOf(value)]; }, keywords: 'text spacing tracking' },
    { id: 'wordSpacing', tab: 'text', type: 'cycle', key: 'wordSpacing', icon: 'wordSpacing', label: 'Word spacing', options: [0, 0.16, 0.3, 0.45], format: function (value) { return ['Default', 'Light', 'Medium', 'Wide'][[0, 0.16, 0.3, 0.45].indexOf(value)]; }, keywords: 'spacing words' },
    { id: 'fontWeight', tab: 'text', type: 'cycle', key: 'fontWeight', icon: 'fontWeight', label: 'Bolder text', options: [0, 600, 700], format: function (value) { return value ? (value === 600 ? 'Semibold' : 'Bold') : 'Default'; }, keywords: 'font weight thick' },
    { id: 'textAlign', tab: 'text', type: 'cycle', key: 'textAlign', icon: 'textAlign', label: 'Text align', options: ['', 'left', 'center', 'right', 'justify'], format: function (value) { return value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Default'; }, keywords: 'alignment justify center' },
    { id: 'textDir', tab: 'text', type: 'cycle', key: 'textDir', icon: 'direction', label: 'Text direction', options: ['', 'ltr', 'rtl'], format: function (value) { return { '': 'Default', ltr: 'Left to right', rtl: 'Right to left' }[value]; }, keywords: 'rtl ltr right left arabic hebrew' },
    { id: 'highlightTitles', tab: 'text', type: 'toggle', key: 'highlightTitles', icon: 'titles', label: 'Highlight titles', keywords: 'headings' },
    { id: 'highlightLinks', tab: 'text', type: 'toggle', key: 'highlightLinks', icon: 'links', label: 'Highlight links', keywords: 'underline' },
    { id: 'magnifier', tab: 'text', type: 'cycle', key: 'magnifier', icon: 'magnifier', label: 'Magnifier', options: [0, 1.5, 2, 3], format: function (value) { return value ? value + '×' : 'Off'; }, keywords: 'zoom lens hover glass bigger text magnifier' },
    // Color
    { id: 'darkContrast', tab: 'color', type: 'radio', key: 'contrast', value: 'dark', icon: 'dark', label: 'Dark contrast', keywords: 'night black' },
    { id: 'lightContrast', tab: 'color', type: 'radio', key: 'contrast', value: 'light', icon: 'light', label: 'Light contrast', keywords: 'white bright' },
    { id: 'highContrast', tab: 'color', type: 'radio', key: 'contrast', value: 'high', icon: 'contrast', label: 'High contrast', keywords: 'strong' },
    { id: 'smartContrast', tab: 'color', type: 'toggle', key: 'smartContrast', icon: 'smartContrast', label: 'Smart contrast', keywords: 'fix low contrast readable' },
    { id: 'invert', tab: 'color', type: 'toggle', key: 'invert', icon: 'invert', label: 'Invert colors', keywords: 'negative reverse' },
    { id: 'mono', tab: 'color', type: 'radio', key: 'saturation', value: 'mono', icon: 'mono', label: 'Monochrome', keywords: 'grayscale grey gray black white' },
    { id: 'lowSat', tab: 'color', type: 'radio', key: 'saturation', value: 'low', icon: 'lowSat', label: 'Low saturation', keywords: 'muted soft color' },
    { id: 'highSat', tab: 'color', type: 'radio', key: 'saturation', value: 'high', icon: 'highSat', label: 'High saturation', keywords: 'vivid color' },
    { id: 'colorBlind', tab: 'color', type: 'cycle', key: 'colorBlind', icon: 'filters', label: 'Color blindness', options: ['', 'protanopia', 'deuteranopia', 'tritanopia'], format: function (value) { return value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Off'; }, keywords: 'protanopia deuteranopia tritanopia filter daltonism' },
    // Navigation
    { id: 'keyboardNav', tab: 'nav', type: 'toggle', key: 'keyboardNav', icon: 'keyboard', label: 'Keyboard navigation', keywords: 'tab shortcuts' },
    { id: 'focusRing', tab: 'nav', type: 'toggle', key: 'focusRing', icon: 'focus', label: 'Focus highlight', keywords: 'visible focus indicator outline' },
    { id: 'hoverHighlight', tab: 'nav', type: 'toggle', key: 'hoverHighlight', icon: 'hover', label: 'Highlight hover', keywords: 'pointer frame outline mouse' },
    { id: 'structure', tab: 'nav', type: 'view', view: 'structure', icon: 'structure', label: 'Page structure', keywords: 'skip links headings landmarks outline' },
    { id: 'cursorBlack', tab: 'nav', type: 'radio', key: 'cursor', value: 'black', icon: 'cursorBlack', label: 'Big black cursor', keywords: 'mouse pointer' },
    { id: 'cursorWhite', tab: 'nav', type: 'radio', key: 'cursor', value: 'white', icon: 'cursorWhite', label: 'Big white cursor', keywords: 'mouse pointer' },
    { id: 'vkeyboard', tab: 'nav', type: 'toggle', key: 'vkeyboard', icon: 'vkeyboard', label: 'On-screen keyboard', keywords: 'virtual keyboard typing' },
    { id: 'voiceNav', tab: 'nav', type: 'toggle', key: 'voiceNav', icon: 'voice', label: 'Voice commands', keywords: 'speech navigation control' },
    { id: 'dictation', tab: 'nav', type: 'toggle', key: 'dictation', icon: 'dictation', label: 'Talk & type', keywords: 'speech to text dictation' },
    { id: 'bigTargets', tab: 'nav', type: 'toggle', key: 'bigTargets', icon: 'targets', label: 'Bigger targets', keywords: 'click touch buttons size' },
    { id: 'extendedTime', tab: 'nav', type: 'toggle', key: 'extendedTime', icon: 'timer', label: 'More time', keywords: 'extended timeout hover duration' },
    // Reading
    { id: 'tts', tab: 'reading', type: 'toggle', key: 'tts', icon: 'speak', label: 'Read aloud', keywords: 'text to speech screen reader voice' },
    { id: 'readingGuide', tab: 'reading', type: 'toggle', key: 'readingGuide', icon: 'guide', label: 'Reading guide', keywords: 'line ruler' },
    { id: 'readingMask', tab: 'reading', type: 'toggle', key: 'readingMask', icon: 'mask', label: 'Reading mask', keywords: 'spotlight focus' },
    { id: 'stopAnimations', tab: 'reading', type: 'toggle', key: 'stopAnimations', icon: 'pause', label: 'Stop animations', keywords: 'motion pause gif' },
    { id: 'hideImages', tab: 'reading', type: 'toggle', key: 'hideImages', icon: 'hideImg', label: 'Hide images', keywords: 'pictures media' },
    { id: 'mute', tab: 'reading', type: 'toggle', key: 'mute', icon: 'mute', label: 'Mute sounds', keywords: 'audio silence' },
    { id: 'tooltips', tab: 'reading', type: 'toggle', key: 'tooltips', icon: 'tooltip', label: 'Tooltips', keywords: 'title alt description hover' },
    { id: 'spokenTips', tab: 'reading', type: 'toggle', key: 'spokenTips', icon: 'tips', label: 'Spoken tips', keywords: 'voice guide instructions sound help commands' },
    { id: 'reader', tab: 'reading', type: 'action', icon: 'reader', label: 'Reader view', keywords: 'simplified view reader mode clean' },
    { id: 'dictionary', tab: 'reading', type: 'toggle', key: 'dictionary', icon: 'dictionary', label: 'Dictionary', keywords: 'glossary define lookup meaning' },
    { id: 'summary', tab: 'reading', type: 'view', view: 'summary', icon: 'summary', label: 'Page summary', keywords: 'summarize summarizer key points' },
    { id: 'sign', tab: 'reading', type: 'view', view: 'sign', icon: 'sign', label: 'Sign language', keywords: 'asl libras deaf interpretation' },
    { id: 'translate', tab: 'reading', type: 'view', view: 'translate', icon: 'gtranslate', label: 'Translate', keywords: 'language multilingual' },
    // Tools
    { id: 'ariaFix', tab: 'tools', type: 'toggle', key: 'ariaFix', icon: 'aria', label: 'ARIA fixes', keywords: 'roles landmarks screen reader semantics' },
    { id: 'altText', tab: 'tools', type: 'toggle', key: 'altText', icon: 'altText', label: 'Image descriptions', keywords: 'alt text images' },
    { id: 'formFix', tab: 'tools', type: 'toggle', key: 'formFix', icon: 'forms', label: 'Form fixes', keywords: 'labels errors inputs' }
  ];
});
