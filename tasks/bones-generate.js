/*
 * Provides generate.js as Grunt task
 *
 * Author(s):  Jonathan "Yoni" Knoll
 * Version:    0.9.0
 * Date:       2016-11-03
 *
 */

module.exports = function( grunt ) {
  'use strict';

  var colors = require('colors');
  var makeBone = require('./libs/generators/bone');
  var makeBoneLess = require('./libs/generators/bone-less');
  var makeShapes = require('./libs/generators/shapes');

  // helper task to generate components (and some other stuff)
  // Usage: grunt generate:bone --name="foo" (can be either the component name or the file name)
  grunt.registerMultiTask('bones-generate', 'Generate a bone.', function() {

    if(!this.target) {
      grunt.fail.fatal('\nWhat are you making here?\n');
    }

    switch(this.target) {

      case 'bone':
        grunt.option('parent', 'bone');
        makeBone.call(this, grunt);
        grunt.task.run('bones-generate:shapes');
        break;

      case 'bone-less':
        makeBoneLess.call(this, grunt);
        break;

      case 'shapes':
        makeShapes.call(this, grunt);
        grunt.task.run('bones-generate:bone-less');
        break;

      default:
        grunt.fail.fatal('\n\n\tI don\'t know how to generate ' + colors.cyan.bold(this.target) + colors.red('!\n\n'));
        break;

    }

  }); // generate

  grunt.config('bones-generate.bone', {});
  grunt.config('bones-generate.bone-less', {});
  grunt.config('bones-generate.shapes', {});

};
