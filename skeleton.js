/*
 * Name: skeleton.js
 * Description: Bone skeleton
 * Dependencies: brain, jquery, jquery-bindable, lodash, bone
 * 
 * Author(s):  Jonathan "Yoni" Knoll
 * Version:    0.1.0
 * Date:       2016-09-26
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

  function SkeletonError(message) {
    this.name = 'SkeletonError';
    this.message = message || '';
  }
  SkeletonError.prototype = Error.prototype;

  var $body = $('body');

  var Skeleton = brain.utils.bindable.create({

    VERSION: '0.1.0',

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
      loading: true,
      loaded: false
    }, // state

    /*
     * Create a new bone instance and return it
     * @param opts {Object} Options for the bone
     *    - type {String} [required]
     */
    createBone: function(opts) {

      var skel = this;

      var prototype = skel.shapes[opts.type],
          bone;

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
      
      bone = prototype.create(opts);

      bone.on('*', function(e, data) {
        switch(e.originalEvent.type) {
          case 'bone:ready':
            skel.findBones(null, this.$elem);
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
          $orphans;
      console.log($root.get(0));
      $orphans = $root.find('[data-bone]:not([data-generated])');

      skel.initializeBones($.makeArray($orphans.map(function(i, o) {
        return o.getAttribute('data-bone');
      })), function() { // callback
        $orphans.each(function(j, v) {
          skel.createBone({
            type: v.getAttribute('data-bone'),
            elem: v
          }).on('bone:generated', skel.onBoneGenerated).generate().display();
        });
      });

      skel.trigger('skeleton:bones-loaded');

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
        .on('skeleton:bones-loaded', skel.onBonesLoaded)
        .on('skeleton:bone-added', skel.onBoneAdded);


      skel.findBones();

      // this is the only place where a race condition might be created
      skel.state.loading = setInterval(function() {
        attempts++;
        if($('[data-bone]:not([data-generated])').length===0) {
          clearInterval(skel.state.loading);
          skel.state.loading = false;
          skel.state.loaded = true;
          skel.trigger('skeleton:ready');
        }
        else if(attempts>1500) {
          clearInterval(skel.state.loading);
          skel.state.loading = false;
          console.warn('Unable to load all bones. Aborting.');
          skel.trigger('skeleton:ready');
        }
      }, 5);

    }, // init


    /*
     * Initializes the necessary bone prototypes for use on the page
     * @param bones {Object} Event object
     * @param callback {Function}
     */
    initializeBones: function(bones, callback) {
      var skel = this;

      var dependencies = _.uniq(bones.map(function(bone) {
        if(bone.indexOf('/')<0) {
          return ['common', bone, bone].join('/');
        }
        return bone;
      }));

      requirejs(dependencies, function() {
        Array.prototype.slice.call(arguments).forEach(function(bone) {
          if(typeof skel.shapes[bone.type]==='undefined') {
            skel.shapes[bone.type] = bone.init(skel);
          }
        });
        if(callback) {
          callback();
        }
      });
    }, // initializeBones

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
      this.init();
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