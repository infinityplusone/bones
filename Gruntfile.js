/*
 * bones Gruntfile
 *
 * Author(s):  Jonathan "Yoni" Knoll
 * Version:    0.7.1
 * Date:       2016-10-31
 *
 */

module.exports = function(grunt) {

  var colors = require('colors');
  var pkg = grunt.file.readJSON('./package.json');

  
  // Project configuration
  grunt.initConfig({
    pkg: pkg,
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

  grunt.registerTask('build', function() {
    grunt.file.write('VERSION', pkg.version);
  });

  console.log('\n');
};
