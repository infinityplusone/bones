/*
 * Name: skeleton.js
 * Description: Bone skeleton
 * Dependencies: brain, jquery, jquery-bindable, lodash, bone
 * 
 * Author(s):  Jonathan "Yoni" Knoll
 * Version:    0.9.0
 * Date:       2016-11-03
 *
 * Notes: 
 *
 *
 */

requirejs.config({
  paths: {
    // these come from bower
    'jquery':               'bower_components/jquery/dist/jquery',
    'lodash':               'bower_components/lodash/dist/lodash.min',

    // these come from infinityplusone
    'bones':                'bower_components/bones',
    'brain':                'bower_components/brain/brain',
    'skeleton':             'bower_components/bones/skeleton'
  },
  shim: {
    'skeleton': {
      deps: [ 'brain', 'jquery', 'lodash', 'bones/bone/bone' ],
      exports: 'skeleton'
    },
    'brain': {
      deps: [ 'brainybars', 'jquery', 'jquery-bindable', 'lodash', 'lodash-inflection' ],
      exports: 'brain'
    }
  }
});

define([
  'jquery',
  'lodash',
  'bones/bone/bone', // required so the world makes sense to it
  'brain'
], function($, _, Bone) {

  var UNGENERATED_BONE = '[data-bone]:not([data-generated]):not([data-generate])';

  function SkeletonError(message) {
    this.name = 'SkeletonError';
    this.message = message || '';
  }
  SkeletonError.prototype = Error.prototype;

  var $body = $('body');

  var Skeleton = brain.utils.bindable.create({

    VERSION: '0.9.0',

    name: 'Skeleton',

    shapes: {}, // this will store all the prototypes for bones

    messages: $.extend([], {
      push: function(val) {
        this[this.length] = val;
        console.log(val);
      }
    }),

    options: {
      contentSelector: 'body'
    }, // options

    state: {
      ready: false,
      loading: [],
      loaded: false
    }, // state


    /*
     * Create a new bone instance and return it
     * @param opts {HTMLElement|Object} Either an HTML element or options containing
     *    - type {String} [required]
     *    - options {Object} Options for the bone
     */
    createBone: function(source) {

      var skel = this,
          opts, prototype, bone;

      skel.state.loading.push(1);
      skel.state.loaded = false;
      skel.state.ready = false;

      opts = !source.ELEMENT_NODE ? source : {
        type: source.getAttribute('data-bone'),
        elem: source,
        options: $(source).data()
      };

      prototype = skel.shapes[opts.type];

      try {
        if(!prototype) {
          throw new SkeletonError('Invalid bone type `' + opts.type + '`!');
        }
      }
      catch(err) {
        this.messages.push([err.name + ': ' + err.message, 'warn']);
        return false;
      }

      Skeleton.state.nextID++;

      opts = $.extend(opts, {
        options: $.extend(true, {}, prototype.options, opts.options)
      });

      bone = prototype.make(opts);

      bone.on('*', function(e, data) {
        switch(e.originalEvent.type) {
          case 'bone:display':
            
            break;
          case 'bone:generated':
            skel.findBones(null, this.$elem);
            skel.state.loading.pop();
            break;
          default:
            break;
        }
      });
     
      return bone;

    }, // createBone


    /*
     * Find bones
     */
    findBones: function(e, $elem) {
      var skel = this,
          $root = $elem ? $elem : $(skel.options.contentSelector),
          $orphans,
          bones;

      $orphans = $root.find(UNGENERATED_BONE);

      function callback() { // callback
        $orphans.each(function(j, v) {
          if(!v.hasAttribute('data-generate')) {
            var bone = skel.createBone(v);
            if(bone) {
              bone.on('bone:generated', skel.onBoneGenerated).generate().display();
            }
          }
        });
      } // callback

      if($orphans.length>0) {
        bones = _.uniq($.makeArray($orphans.map(function(i, o) {
          return o.getAttribute('data-bone');
        }))).filter(function(b) {
          return typeof skel.shapes[b]==='undefined';
        });

        if(bones.length>0) {
          skel.initializeBones(bones, callback);
        }
        else {
          callback.call(skel);
        }
      }
      if(skel.state.loading.length===0) {
        skel.trigger('skeleton:ready');
      }
      // skel.trigger('skeleton:bones-loaded');

    }, // findBones


    /*
     * Initialize a Skeleton instance with various options
     * @param args {Object} An object containing override options for the skeleton
     */
    init: function(settings) {

      var skel = this;
      var attempts = 0;

      skel.off('*').off();

      settings = settings ? settings : { };

      $.extend(skel.options, settings.options);

      skel
        .on('skeleton:ready', skel.onSkeletonReady)
        // .on('skeleton:bones-loaded', skel.onBonesLoaded)
        .on('skeleton:bone-added', skel.onBoneAdded);

      if(typeof settings.handlers==='object') {
        Object.keys(settings.handlers).forEach(function(evt) {
          skel.on(evt, settings.handlers[evt]);
        });
      }

      skel.findBones();

      return skel;

    }, // init


    /*
     * Initializes the necessary bone prototypes for use on the page
     * @param bones {Object} Event object
     * @param callback {Function}
     */
    initializeBones: function(bones, callback) {
      var skel = this;

      var dependencies = bones.map(function(bone) {
        if(bone.indexOf('/')<0) {
          return ['common', bone, bone].join('/');
        }
        return bone;
      });

      if(dependencies.length>0) {
        requirejs(dependencies, function() {
          Array.prototype.slice.call(arguments).forEach(function(bone) {
            if(typeof skel.shapes[bone.type]==='undefined') {
              skel.shapes[bone.type] = bone.init(skel);
            }
          });
          if(callback) {
            callback.call(skel);
          }
        });
      }
    }, // initializeBones


    kill: function() {

    }, // kill


    /*
     * Fires when a bone has been added anywhere. This can't be good
     * @param e {Object} Event object
     * @param bone {Object} The bone from which the event was fired
     */
    onBoneAdded: function(e, bone) {}, // onBoneAdded

    /*
     * Fires when a bone has been generated
     * @param e {Object} Event object
     */
    onBoneGenerated: function(e) {}, // onBoneGenerated

    onSkeletonReady: function() {
      this.state.ready = true;
      this.messages.push([this.name + ' Ready', 'info']);
    }, // onSkeletonReady

    /*
     * This needs to be rethought, moved, or something
     */
    reset: function() {
      $('[data-bone-type]').remove();
      $('[data-bone]').removeAttr('data-generated');
      this.init({});
    }, // reset


    /**
     * @return {String} Returns `Skeleton`
     */
    toString: function() {
      return '[object Skeleton]';
    } // toString

  }); // Skeleton

  return Skeleton;

}); // define