/* catalogue/catalogue-3.js: The list of profiles, features and panel tabs, continued */
accessibles_core.define('catalogue/catalogue-3.js', [], function (core) {
  'use strict';
  core.features.push(
    { id: 'oversized', tab: 'tools', type: 'toggle', key: 'oversized', icon: 'oversized', label: 'Larger features', keywords: 'oversized interface bigger menu widget' },
    { id: 'position', tab: 'tools', type: 'view', view: 'position', icon: 'position', label: 'Feature position', keywords: 'move place corner button widget' },
    { id: 'remember', tab: 'tools', type: 'toggle', key: 'remember', icon: 'remember', label: 'Remember settings', keywords: 'persistent save cookie memory' },
    { id: 'audit', tab: 'tools', type: 'view', view: 'audit', icon: 'audit', label: 'Page check', keywords: 'compliance analytics audit wcag report' },
    { id: 'reportIssue', tab: 'tools', type: 'view', view: 'report', icon: 'report', label: 'Report an issue', keywords: 'feedback problem form' },
    { id: 'statementLink', tab: 'tools', type: 'action', icon: 'statement', label: 'Accessibility statement', keywords: 'policy' },
    { id: 'resetAll', tab: 'tools', type: 'action', icon: 'reset', label: 'Reset all', keywords: 'clear default restore' }
  );
  core.features_by_id = {};
  core.features.forEach(function (feature) { core.features_by_id[feature.id] = feature; });
  core.tabs = [
    { id: 'profiles', label: 'Profiles' },
    { id: 'text', label: 'Text' },
    { id: 'color', label: 'Color' },
    { id: 'nav', label: 'Navigate' },
    { id: 'reading', label: 'Reading' },
    { id: 'tools', label: 'Tools' }
  ];
});
