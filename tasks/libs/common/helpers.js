/*
 * Provides helpers for use in generate & destroy Grunt tasks
 *
 * Author(s):  Jonathan "Yoni" Knoll
 * Version:    0.2.0
 * Date:       2016-10-07
 *
 */

module.exports = function(grunt) {
  'use strict';

  var colors = require('colors');
  var _ = require('lodash');

  return {

    checkName: function(args) {
      var existingComponents = [];
      var reservedNames = [
        '_',
        'app', 'application',
        'base', 'bone', 'bower_components',
        'bucket', 'buqet',
        'component',
        'docs',
        'main', 'skeleton',
        'node_modules',
        'page', 'brain',
        'scripts', 'shape', 'shapes',
        'src', 'staq',
        'tasks'
      ];

      // protext external lib names
      grunt.file.expand(['bower_components/**/bower.json']).forEach(function(bower) {
        var bowerJson = grunt.file.readJSON(bower);
        if(typeof bowerJson.dependencies!=='undefined') {
          reservedNames = reservedNames.concat(Object.keys(bowerJson.dependencies));
        }
      });
      reservedNames = _.uniq(reservedNames);
      reservedNames.sort();
      
      // look for existing components with the same name
      grunt.file.expand(['common/*']).forEach(function(f) {
        if(grunt.file.isDir(f)) {
          existingComponents.push(f.replace(/common\//, ''));
        }
      });

      existingComponents = existingComponents.concat(reservedNames);

      if(!args.name) {
        console.log('\n');
        grunt.fail.fatal('\nYou must define a ' + args.scaffold + ' using "--name=Foo" or "--name=\'Foo Bar\'"\n');
      }
      args.name = _.kebabCase(args.name);

      if(reservedNames.indexOf(args.name)>=0) {
        console.log('\n');
        grunt.fail.fatal('\nSorry, the name `' + args.name + '` is not allowed\n');
      }
      if(!!args.duplicates && existingComponents.indexOf(args.name)>=0) {
        console.log('\n');
        grunt.fail.warn('\nWait! `' + args.name + '` already exists!\n\n');
      }
      return _.startCase(args.name);
    }, // checkName

    deleteFile: function(src) {
      if(grunt.file.exists(src)) {
        grunt.file.delete(src);
        console.log('File ' + colors.cyan(src) + colors.red(' deleted') + '.');
      }
      else {
        console.log('File ' + colors.cyan(src) + ' ignored (' + colors.yellow('nonexistent file') + ').');
      }
    }, // deleteFile

    generateFiles: function(opts) {
      var f, file;

      console.log(colors.underline('\nGenerating files for ' + opts.scaffold + ': ' + colors.cyan.bold(opts.data.name) + '\n'));

      for(f in opts.files) {
        if(grunt.file.exists(opts.files[f].dest)) {
          if(!opts.isForced) {
            grunt.fail.warn('\n\tIt looks like this ' + colors.cyan(opts.files[f].dest) + colors.yellow(' already exists!\n\n'));
          }
          else {
            console.log(colors.yellow('\tIt looks like ') + colors.cyan(opts.files[f].dest) + colors.yellow(' already exists!'));
          }
        }
      }
      if(opts.isForced) {
        console.log(colors.white.bold('\n Used --force, continuing.\n'));
      }
      for(f in opts.files) {
        file = opts.files[f];
        this.processTemplate(file.src, file.dest, opts.data);
      }
    }, // generateFiles

    getGitName: function() {
      var n = 'mephistopheles';
      if(grunt.file.exists(process.env['HOME'] + '/.gitconfig')) {
        var gg = grunt.file.read(process.env['HOME'] + '/.gitconfig').split('\n');
        for(var i = 0, l; i<gg.length; i++) {
          l = gg[i].split(' = ');
          if(l.length===2 && l[0].indexOf('name')>=0) {
            n = l[1];
            break;
          }
        }
      }
      return n;
    }, // getGitName

    getShapes: function(shapesJson) {
      var appPath = shapesJson ? shapesJson.replace('shapes.json', '') : paths.common + '/skeleton';
      shapesJson = shapesJson ? shapesJson : appPath + '/shapes.json';
      if(grunt.file.exists(shapesJson)) {
        return grunt.file.readJSON(shapesJson);
      }
      grunt.fail.fatal('\nUnable to find `shapes.json` in ' + colors.yellow.bold(appPath));
    }, // getPile

    getPath: function(tmpl, fn) { // JSK: this is ridiculous and stupid
      fn = fn ? fn : grunt.option('name');
      return grunt.template.process(tmpl, {data: {filename:_.kebabCase(fn)}});
    }, // getPath

    processTemplate: function(src, dest, data) {
      var result = grunt.file.copy(src, dest, {
        process: function(tmpl) {
          return grunt.template.process(tmpl, {data: data});
        }
      });
      console.log('File ' + colors.cyan(dest) + ' created.');
    } // processTemplate

  };

};
