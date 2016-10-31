/*
 * Provides destroy.js as Grunt task
 *
 * Author(s):  Jonathan "Yoni" Knoll
 * Version:    0.7.1
 * Date:       2016-10-31
 *
 */

module.exports = function( grunt ) {
  'use strict';

  var colors = require('colors');
  var destroyBone = require('./libs/destroyers/bone');

  // helper task to destroy generated objects
  // Usage: grunt destroy:bone --name="foo" (can be either the bone name or the file name)
  grunt.registerMultiTask('bones-destroy', 'Destroy a bone.', function() {

    if(!this.target) {
      grunt.fail.fatal('\nWhat are you trying to destroy?\n');
    }

    switch(this.target) {

      case 'bone':
        destroyBone.call(this, grunt);
        grunt.task.run('bones-generate:shapes');
        break;

      default:
        grunt.fail.fatal('\n\n\tI don\'t know how to destroy `' + colors.cyan.bold(this.target) + '`!\n\n');
        break;

    }

  }); // destroy

  grunt.config('bones-destroy.bone', {});
};
