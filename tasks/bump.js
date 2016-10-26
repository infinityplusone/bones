/*
 * Provides bump.js as Grunt task
 *
 * Author(s):  Jonathan "Yoni" Knoll
 * Version:    0.6.0
 * Date:       2016-10-26
 *
 */

module.exports = function( grunt ) {
  'use strict';

  var colors = require('colors');

  if(!grunt.task.exists('bump')) {
    grunt.registerTask('bump', 'Bumps a project\'s version number up across relevant files.', function(version) {

      var currentVersion = grunt.config('pkg').version;

      switch(version) {
        case 'check':
          console.log('\nThe current version is ' + colors.cyan.bold(currentVersion) + '.');
          return;
        case 'patch':
          version = currentVersion.replace(/([0-9]+)$/, function(match, capture) {
            return +capture + 1;
          });
          break;
        case 'minor':
          version = currentVersion.replace(/(\d+)\.\d+$/, function(match, capture) {
            return (+capture + 1) + '.0';
          });
          break;
        case 'major':
          version = currentVersion.replace(/^(\d+)\.\d+\.\d+/, function(match, capture) {
            return (+capture + 1) + '.0.0';
          });
          break;
        default:
          break;
      }

      if(!/\d+\.\d+\.\d+/.test(version)) {
        grunt.fail.fatal('\n\nYou need to specify a valid version number!\n\nThe current version is: ' + colors.yellow.bold(currentVersion) + '\n');
      }

      console.log('\nOK! Moving the needle from ' + colors.cyan.bold(currentVersion) + ' to ' + colors.cyan.bold(version) + '.');

      grunt.file.expand([
        'bower.json',
        'package.json'
      ]).forEach(function(f) {
        var json = grunt.file.readJSON(f);
        json.version = version;
        grunt.file.write(f, JSON.stringify(json, null, 2));
      });

      grunt.file.expand([
        '*.js',
        './bone/*.js',
        './skeleton.js',
        './Gruntfile.js',
        'tasks/**/*.js',
        '!tasks/templates/**/*.js'
        ]).forEach(function(f) {
        var lines = grunt.file.read(f).split('\n');
        var newLines = [];
        for(var i=0, len=lines.length, line; i<len; i++) {
          line = lines[i];
          if(line.indexOf(' * Version: ')===0) {
            newLines.push(' * Version:    ' + version);
          }
          else if(line.indexOf(' * Date: ')===0) {
            newLines.push(' * Date:       ' + grunt.template.today('yyyy-mm-dd'));
          }
          else if(line.indexOf('    VERSION: \'')===0) {
            newLines.push('    VERSION: \'' + version + '\',');
          }
          else {
            newLines.push(line);
          }
        }
        grunt.file.write(f, newLines.join('\n'));
      });

      var readMe = grunt.file.read('README.md');
      var title = grunt.config('pkg.title') ? grunt.config('pkg.title') : grunt.config('pkg.description');
      var re = new RegExp('(# ' + title + ' v).*');

      grunt.file.write('README.md', readMe.replace(re, '$1' + version));

    }); // bump
  } // if
};
