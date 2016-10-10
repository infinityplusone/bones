/*
 * Provides destroy:component to destroy Grunt Task
 *
 * Author(s):  Jonathan "Yoni" Knoll
 * Version:    0.3.0
 * Date:       2016-10-10
 *
 */


module.exports = function(grunt) {
  'use strict';

  var colors = require('colors');
  var _ = require('lodash');
  var helpers = require('../common/helpers')(grunt);
  var paths = grunt.config('meta').dir;

  var name = _.kebabCase(grunt.option('name'));

  var files = grunt.file.expand([paths.common + '/' + name + '/**']);

  files.reverse(); // so the directory is last

  console.log('\nDestroying component: ' + colors.cyan.bold(helpers.checkName({
    name: name,
    scaffold: 'component'
  })) + '\n');

  files.forEach(function(f) {
    helpers.deleteFile(helpers.getPath(f));
  });

};
