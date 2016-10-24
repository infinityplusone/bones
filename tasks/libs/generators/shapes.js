/*
 * Provides generate:shapes to generate Grunt Task
 *
 * Author(s):  Jonathan "Yoni" Knoll
 * Version:    0.5.0
 * Date:       2016-10-24
 *
 */

module.exports = function(grunt) {
  'use strict';

  var colors = require('colors');
  var _ = require('lodash');
  var helpers = require('../common/helpers')(grunt);
  var paths = grunt.config('meta').dir;

  var dest = paths.common + '/shapes.json';

  var boneList = _.uniq(grunt.file.expand([
      paths.common + '/**/*.js',
      paths.bones + '/bone/bone.js',
      ['!', paths.common, '/', grunt.config('pkg').name, '/**'].join('')
    ]).map(function(bone) {
      return bone.replace(/\/docs\//, '/').split('/').slice(-3, -1).join('/');
    })).filter(function(value, index, self) {
      return self.indexOf(value) === index;
    });

  grunt.file.write(dest, JSON.stringify(boneList, null, 2));
  console.log('File ' + colors.cyan(dest) + ' created.');

};
