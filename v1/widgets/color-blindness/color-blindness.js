/* color-blindness/color-blindness.js: Color blindness: color filters for protanopia, deuteranopia and tritanopia */
accessibles_core.define('color-blindness/color-blindness.js', [], function (core) {
  'use strict';
  // Builds the SVG filters that correct colors for each kind of color blindness
  core.build_color_blind_svg = function () {
    var simulation_matrices = {
      protanopia: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
      deuteranopia: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
      tritanopia: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]]
    };
    var shift_red_green = [[0, 0, 0], [0.7, 1, 0], [0.7, 0, 1]];
    var shift_blue = [[1, 0, 0.7], [0, 1, 0.7], [0, 0, 0]];
    function multiply(matrix_one, matrix_two) {
      return matrix_one.map(function (row) { return [0, 1, 2].map(function (column) { return row[0] * matrix_two[0][column] + row[1] * matrix_two[1][column] + row[2] * matrix_two[2][column]; }); });
    }
    var out = '';
    Object.keys(simulation_matrices).forEach(function (kind) {
      var simulation = simulation_matrices[kind];
      var error_value = [0, 1, 2].map(function (row) { return [0, 1, 2].map(function (column) { return (row === column ? 1 : 0) - simulation[row][column]; }); });
      var corr = multiply(kind === 'tritanopia' ? shift_blue : shift_red_green, error_value);
      var matrix = [0, 1, 2].map(function (row) { return [0, 1, 2].map(function (column) { return (row === column ? 1 : 0) + corr[row][column]; }); });
      var vals = matrix.map(function (row_values) { return row_values.map(function (cell) { return cell.toFixed(4); }).join(' ') + ' 0 0'; }).join(' ') + ' 0 0 0 1 0';
      out += '<filter id="acc-cb-' + kind + '"><feColorMatrix type="matrix" values="' + vals + '"/></filter>';
    });
    var wrap = document.createElement('div');
    wrap.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" id="accessibles-filters"><defs>' + out + '</defs></svg>';
    var svg = wrap.firstChild;
    svg.style.cssText = 'position:absolute!important;width:0!important;height:0!important;overflow:hidden!important;pointer-events:none!important';
    return svg;
  };
  core.register('page_filter', { folder: 'color-blindness', order: 50, filter: function () { return core.state.colorBlind ? 'url(#acc-cb-' + core.state.colorBlind + ')' : ''; } });
  // The colour-blindness filters live in the page, added once
  core.register('module', { folder: 'color-blindness', order: 5, module: { sync: function () {
    if (core.color_blind_svg) return;
    core.color_blind_svg = core.build_color_blind_svg();
    document.documentElement.appendChild(core.color_blind_svg);
  } } });
  core.color_blind_svg = null;
});
