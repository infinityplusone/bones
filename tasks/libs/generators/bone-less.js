/*
 * Provides generate:bone-less to generate Grunt Task
 *
 * Author(s):  Jonathan "Yoni" Knoll
 * Version:    0.10.0
 * Date:       2016-11-03
 *
 */

module.exports = function(grunt) {
  'use strict';

  var colors = require('colors');
  var paths = grunt.config('meta').dir;
  var dest =  paths.common + '/bones.less';

  var ignoreBones = ['bone'];

  var imports = [
    '//**** GENERATED FILE - ANY CHANGES YOU MAKE WILL BE OVERWRITTEN ****//\n\n'
  ];

  var shapes = grunt.file.readJSON(paths.common + '/shapes.json'); // faster to use the available shapes than it is to use expand

  shapes.forEach(function(shape) {
    var bone = shape.split('/')[1];
    if(ignoreBones.indexOf(bone)<0 && grunt.file.exists(shape + '/' + bone + '.less')) {
      imports.push((shape.indexOf('cards')>=0 ? '// ' : '') + '@import "' + shape + '/' + bone + '.less";');
    }
  });

  grunt.file.write(dest, imports.join('\n'));
  console.log('File ' + colors.cyan(dest) + ' created.');
};
