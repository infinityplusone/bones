/*
 * bones Gruntfile
 *
 * Author(s):  Jonathan "Yoni" Knoll
 * Version:    0.1.0
 * Date:       2016-09-26
 *
 */

module.exports = function(grunt) {

  var colors = require('colors');
  
  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('./package.json'),
    meta: {
      dir: {
        app: './app',
        assets: './assets',
        bones: './src',
        common: './common'
      }
    }
  });

  grunt.loadTasks('tasks');
  console.log('\n');
};
