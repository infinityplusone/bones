/*
 * Provides generate:component to generate Grunt Task
 *
 * Author(s):  Jonathan "Yoni" Knoll
 * Version:    0.4.0
 * Date:       2016-10-24
 *
 */

module.exports = function(grunt) {
  'use strict';

  // libs & reference
  var colors = require('colors');
  var _ = require('lodash');
  var helpers = require('../common/helpers')(grunt);
  var paths = grunt.config('meta').dir;

  var templatePath = __dirname.replace(/\/libs\/.*/, '/templates/');

  paths.templates.bone = {
    js:         templatePath + 'bone/bone.js',
    hbs:        templatePath + 'bone/bone.hbs',
    less:       templatePath + 'bone/bone.less'
  };

  // this allows for overriding of templates using options
  Object.keys(paths.templates.bone).forEach(function(t) {
    if(grunt.option(t) && grunt.file.exists(grunt.option(t))) {
      paths.templates.bone[t] = grunt.option(t);
    }
  });
  
  // defaults
  var defaultLess = '@import (reference) "../brain/imports/imports.less";';

  // stuff used here
  var f, files, dest;
  var title = helpers.checkName({
    name: grunt.option('name'),
    scaffold: 'component',
    duplicates: true
  });

  var name = _.kebabCase(title);
  var parent = grunt.option('parent') ? grunt.option('parent') : null;

  // This is the data that will ultimately get converted into the component's pattern.json
  var componentData = {
    title: title,
    name: name,
    safeName: _.camelCase(name),
    meta: {
      author: helpers.getGitName(),
      description: [
        grunt.option('description') ? grunt.option('description') : 'Please provide a description for your component.'
      ],
      displayName: title,
      last_modified: grunt.template.today('yyyy-mm-dd'),
      related: grunt.option('related') ? grunt.option('related').split(',') : [],
      tags: grunt.option('tags') ? grunt.option('tags').split(',') : [],
      version: "1.0.0"
    },
    dependencies: parent ? [parent] : [],
    sections: {
      Base: {
        markup: [name, 'html'].join('.')
      }
    },
    files: {
      less: name + '.less'
    }
  };

  if(parent) {
    componentData.parent = parent;
  }

  // these two files will always get generated
  files = {
    less: {
      src: paths.templates.bone.less,
      dest: helpers.getPath(paths.common + '/<%=filename%>/<%=filename%>.less')
    }
  };

  // if there will be a template, add it to the pattern's JSON
    // add a template file & add it to the component data
  files['hbs'] = {
    src: paths.templates.bone.hbs,
    dest: helpers.getPath(paths.common + '/<%=filename%>/<%=filename%>.hbs')
  };
  componentData.files['hbs'] = [name, 'hbs'].join('.');

  // if there will be a script, add it to the pattern's JSON
  files['js'] = {
    src: parent==='bone' ? paths.templates.bone.js : paths.templates.bone.js,
    dest: helpers.getPath(paths.common + '/<%=filename%>/<%=filename%>.js')
  };
  componentData.files['js'] = [name, 'js'].join('.');
  
  // create the component's folder
  grunt.file.mkdir(helpers.getPath(paths.common + '/<%=filename%>'));

  // generate the files
  helpers.generateFiles({
    scaffold: 'component',
    files: files,
    data: componentData,
    isForced: grunt.option('force')
  });

  console.log('File ' + colors.cyan(dest) + ' created.');

};
