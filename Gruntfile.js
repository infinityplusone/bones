/*
 * bones Gruntfile
 *
 * Author(s):  Jonathan "Yoni" Knoll
 * Version:    0.2.0
 * Date:       2016-10-07
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
