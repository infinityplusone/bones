/*
 * Name: bone.js
 * Description: Base bone component.
 * Dependencies: brain
 * 
 * Author(s):  Jonathan "Yoni" Knoll
 * Version:    0.8.0
 * Date:       2016-11-02
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
    'brain':                'bower_components/brain/brain'
  },
  shim: {
    'bones/bone/bone': {
      deps: [ 'brain', 'jquery', 'lodash' ],
      exports: 'bone'
    },
    'brain': {
      deps: [ 'brainybars', 'jquery', 'jquery-bindable', 'lodash', 'lodash-inflection' ],
      exports: 'brain'
    }
  }
});

define([
  'text!bones/bone/bone.hbs',
  'jquery',
  'lodash',
  'brain'
], function(tmpl, $, _) {

  
  // helper: bone-attributes
  brain.handlebars.registerHelper('bone-attributes', function(obj) {
    return Object.keys(obj).map(function(k) {
      if(_.startsWith(k, 'data-')) {
        return k + '="' + brain.handlebars.compile(obj[k])(obj) + '"';
      }
    }).join(' ');
  }); // bone-attributes

  brain.handlebars.addTemplates(tmpl);

  function BoneError(message, bone) {
    this.name = 'BoneError';
    this.message = message || '';
    this.bone = bone;
  }
  BoneError.prototype = Error.prototype;

  var $body = $('body');

  // See below for private methods

  /* =========================================================================
   * =========================================================================
   * Bone object
   */

  var defaultSettings = {
    _ix: {},
    options: {
      inheritClasses: true
    }
  }; // defaultSettings



  var Bone = brain.utils.bindable.create({

    VERSION: '0.8.0',

    cls: ['bone'],
    defaultSettings: defaultSettings,
    meta: {
      author: 'infinityplusone',
      description: 'Please add a description for this bone.',
      displayName: 'Bone'
    },
    options: {},
    wrapper: 'bone-base',
    type: 'bone',


    /**
     * Overridable Event Handlers
     * Interactions should be bound to `this.$elem`
     * For more information
     */

    // Bone event handlers

    /**
     * The beforeCreate & afterCreate methods are provided to allow you to
     * significantly alter how a bone is generated/handled.
     * Use sparingly and with caution
     *
     * @param e {Event} Event Object
     *
     */
    beforeCreate: function(e) {}, // beforeCreate
    afterCreate: function(e) {}, // afterCreate

    // These event handlers are exposed and meant to be used to enhance/modify bones

    /**
     * Fires before a bone's markup is generated
     * @param e {Event} Event Object
     *
     */
    beforeRender: function(e) {}, // beforeRender

    /**
     * Fires before a bone is displayed 
     * @param e {Event} Event Object
     *
     */
    beforeDisplay: function(e) {}, // beforeDisplay

    /**
     * Fires after a bone is displayed 
     * @param e {Event} Event Object
     *
     */
    afterDisplay: function(e) {}, // afterDisplay

    /**
     * Fires when a bone has failed to display for some reason
     * @param e {Event} Event Object
     * @param err {Error} Error Object
     *
     */
    afterFail: function(e, err) {}, // afterFail

    /**
     * These methods are accessible to the outside world
     * These are meant to be used by a bone's skeleton
     * Each of these methods triggers a custom event of type: `bone:METHOD`
     */

    /**
     * Destroy a bone
     * @param opts {Objects} Options for how the bone's element gets removed (not currently used)
     *
     * Note: Doesn't handle removal from bucket (bones should be removed *by* the bucket). Shitty.
     */
    destroy: function(destroy) {
      var bone = this;

      bone.on('bone:ready', function() {
        bone.$elem.remove();
        if(bone.$ref && destroy) {
          bone.$ref.remove();
        }
        bone.$elem.unbind();
        delete(bone.$elem);
        bone.elem.removeAttribute('data-generate');
        bone.elem.removeAttribute('data-generated');
        bone.trigger('bone:destroy');
        bone.unbind();
        if(typeof destroy==='function') {
          destroy();
        }
      });
      if(!bone.state.busy) {
        bone.ready(false);
      }
      return bone;
    }, // destroy

    /**
     * Display a bone
     * @return {Object} The bone
     */
    display: function() {
      this.trigger('bone:display');
      this.beforeDisplay();
      this.ready(true);
      this.afterDisplay();
      this.trigger('bone:displayed');
      return this;
    }, // display

    /**
     * Generate a bone
     * Fires a series of events, to which handlers can be bound. See below
     */
    generate: function() {
      var bone = this;

      // this should be moved into a new `_prepBone`-like method
      // $.extend(bone.data, {id: bone.id});
      $.extend(bone.options, $(bone.elem).data());

      // bone.options = $.extend({}, Bone.options, bone.options);

      bone.state = {
        ready: false,
        selected: false
      };

      bone.elem.setAttribute('data-generate', 'loading');
      // trigger the `bone:generate` event to start the ball rolling
      bone.trigger('bone:generate');
      bone.beforeRender();
      bone = _generateMarkup.call(bone);

      if(typeof bone.$elem!=='object') {
        throw new BoneError('_generateMarkup failed to create a DOM element for ' + bone.toString(), bone);
      }
      bone.state.generated = true;
      _onGenerated.call(bone);
      bone.trigger('bone:generated', bone);

      return bone;

    }, // generate

    /**
     * Hide a bone
     * @param effect {String} Choose an animation for the element
    */
    hide: function(effect) {
      var bone = this;
      bone.state.busy = true;

      switch(effect) {
        case 'fade':
          bone.$elem.animate({opacity: 0}, function() {
            bone.ready(false);
            bone.$elem.css({opacity: ''});
          });
          break;
        case 'blind':
          bone.$elem.css({overflow: 'hidden', maxHeight: bone.$elem.height(), height: bone.$elem.height()}).animate({maxHeight: 0, minHeight: 0}, function() {
            bone.$elem.animate({opacity: 0}, 100, function() {
              bone.ready(false);
              bone.$elem.css({opacity: '', overflow: '', height: '', maxHeight: '', minHeight: ''});
            });
          });
          break;
        case 'slideleft':
          bone.$elem.animate({left: '-100%'}, function() {
            bone.$elem.animate({opacity: 0}, 100, function() {
              bone.ready(false);
              bone.$elem.css({opacity: '', left: ''});
            });
          });
          break;
        case 'slideright':
          bone.$elem.animate({left: '100%'}, function() {
            bone.$elem.animate({opacity: 0}, 100, function() {
              bone.ready(false);
              bone.$elem.css({opacity: '', left: ''});
            });
          });
          break;
        default:
          bone.ready(false);
          break;
      }
      return bone;
    }, // hide

    /**
     * Initializes a bone's prototype so it can be used to create buckets
     */
    init: function(skel) {
      var bone = this;
      var defaultSettings = bone.defaultSettings;

      for(var k in defaultSettings) {
        if(defaultSettings.hasOwnProperty(k)) {
          bone[k] = $.extend({}, defaultSettings[k], bone.getParent()[k], bone[k]);
        }
      }

      // bind the bone to its skeleton
      bone.skel = skel;

      return bone;
    }, // init

    /**
     * Creates an instance of a bone
     *
     * @param opts {Object} One or more bone mixin objects. These must have an `applyMixin` method as well as a name property
     */
    make: function(opts) {
      var bone = this.create(opts);

      bone.id = _.uniqueId();

      if(typeof bone.elem==='undefined') {
        bone.elem = _createElement($.extend({
          'data-bone': this.type
        }, bone.options));
      }

      bone.afterCreate();

      bone.trigger('bone:created');

      return bone;
    }, // make

    /**
     *  @param mixins {String|Array} One or more bone mixin objects. These must have an `applyMixin` method as well as a name property
     */
    mixin: function(mixins) {
      this._ix = $.extend({}, this._ix);
      mixins = [].concat(mixins);
      for(var i=0, mLen=mixins.length, mxn, _ix; i<mLen; i++) {
        mxn = mixins[i];
        if(!mxn.name || !mxn.applyMixin) {
          throw new BoneError('Invalid mixin `' + mxn.name + '` for ' + this.toString(), this);
        }
        else {
          if(typeof this._ix[mxn.name]==='undefined') {
            this._ix[mxn.name] = mxn.applyMixin;
          }
          if(mxn.cls) {
            this.cls = this.cls.concat(mxn.cls);
          }
          this.hasMixins = true; // this is a hack and should be removed
        }
      }
      return this;
    }, // mixin

    /*
     * Get a bone ready for being added to the DOM 
     * Called inside a bucket's `displayBone` method
     */
    prep: function(bucket) {}, // prep

    /**
     * Set a bone's ready-state
     * @param state {Boolean} [optional] [default]
    */
    ready: function(state) {
      switch(typeof state) {
        case 'undefined':
          this.state.ready = true;
          break;
        default:
          this.state.ready = !!state;
          break;
      }
      this.state.busy = false;

      if(typeof this.$elem==='undefined') {
        this.state.ready = false;
        throw new BoneError('Unavailable $elem for `' + this.type + '`', this);
      }
      if(this.state.ready) {
        this.$elem.addClass('ready');
      }
      else {
        this.$elem.removeClass('ready');
      }
      _onReady.call(this, this.state.ready);
      this.trigger('bone:ready', this.state.ready);
      return this.state.ready;
    }, // ready

    /**
     * Destroy a bone completely, then generate it again
     *
     * @return {String} The bone
     */
    regenerate: function() {
      return this.destroy().generate();
    }, // regenerate

    /**
     * @return {String} The bone's type
     */
    toString: function() {
      return '[object ' + this.meta.displayName.replace(' ', '') + 'Bone]';
    } // toString

  }); // Bone


  brain._.Bone = Bone;


  /* =========================================================================
   * =========================================================================
   *  Unexposed functions for a bone's internal workings
   */

  /**
   * Add default interactions based on a bone's options
   * Interactions are bound to `this.$elem`
   * Also looks at bone's markup for cross-bone references and attempts to bind those interactions as well
   */
  function _addDefaultInteractions(e) {
    var bone = this;

    // Ignoring namespacing for now, but might want to add some namespacing for the data attribute, like data-brain-click
    // Also, this currently assumes targets will be bones. This should also be (easily) generalizable.
    bone.$elem.on('click', '[data-click][data-target]', function(e) {
      var $targetBone = $(this.getAttribute('data-target')),
          target = !!$targetBone.data('bone') ? $targetBone.data('bone') : $targetBone.data('bucket'),
          method = this.getAttribute('data-click'),
          args = $(this).data();
      if(!!target && !!target[method]) {
        return target[method].call(target, e, args);
      }
      return false;
    });
  } // _addDefaultInteractions

  /**
   * Sets the bone's `cls` property based on inheritance
   * Question: What happens if inheritClasses is on for a child of one for which it is off?
   */
  function _applyClasses(e) {
    var bone = this,
        cls = _getCssClasses(bone);

    if(this.options.inheritClasses) {
      while(!!bone.type) {
        cls = cls.concat(_getCssClasses(bone));
        bone = Object.getPrototypeOf(bone);
      }
    }
    cls.sort();
    this.cls = _.uniq(cls);
  } // _applyClasses

  /**
   * Binds a bone to to its DOM element
   */
  function _bindBoneToElement(e) {
    this.$elem.data('bone', this);
  } // _bindBoneToElement

  /**
   * Creates a generic document element 
   */
  function _createElement(attributes, appendTo) {
    var elem = document.createElement('div');
    if(attributes)
    Object.keys(attributes).forEach(function(a) {
      elem.setAttribute(a, attributes[a]);
    });
    if(appendTo) {
      $(appendTo).append(elem);
    }
    return elem;
  } // _createElement

  /**
   * @return {Array} The bone's default auto-generated class BLOQTYPE-bone
   */
  function _getCssClasses(bone) {
    var cls = [];
    for(var i in bone._ix) {
      if(bone.options[i]) {
        cls.push('is-' + i);
      }
    }
    // if the bone isn't the `bone` bone type, add its classes to this bone's classes
    if(bone.type!=='bone') {
      if(!!bone.options.cls) { // if the bone has any classes defined in its options, add them here.
        cls = cls.concat(bone.options.cls.split(' '));
      }
      return cls.concat('bone', bone.type + '-bone', bone.cls);
    }
    return cls.concat(bone.cls);
  } // getCssClasses

  /**
   * Generates a bone's markup
   * This method *must* create a jQuery-wrapped HTML element and assign it to the bone's $elem property
   * @overridable
   */
  function _generateMarkup() {
    var bone = this;
    var tmpl = !!bone.options.template ? bone.options.template : bone.type;

    bone.trigger('bone:render');
    _applyClasses.call(this);

    if(typeof brain.templates[tmpl]==='undefined') {
      throw new BoneError('Missing template `' + tmpl + '` for `' + bone.type + '`', bone);
    }
    try {
      bone.content = brain.templates[tmpl](bone);
      bone.$elem = $(bone.content);
      bone.$elem.addClass(bone.cls.join(' '));
      _bindBoneToElement.call(this);
      _addDefaultInteractions.call(this);
      bone.trigger('bone:rendered');
    }
    catch(err) {
      _onFail.call(this, err);
      bone.afterFail();
      bone.trigger('bone:fail', err);
      brain.log(err.name + ': ' + err.message, 'warn');
      throw new BoneError('Unable to generate markup for `' + bone.type + '`', bone);
    }
    return bone;
  } // _generateMarkup


  /**
   * Internal method called when a bone fails to properly render
   */
  function _onFail() {} // _onFail

  /**
   * Internal method called after a bone has been generated
   */
  function _onGenerated() {
    this.elem.setAttribute('data-generated', true);
  } // _onGenerated

  /**
   * Internal method called when a bone is ready for display
   * Only important if a bone is not in a bucket
   */
  function _onReady() {
    var bone = this;
    if(!bone.bucket || typeof bone.bucket==='undefined') {
      $(bone.elem).after(bone.$elem);
    }
  } // _onReady

  return Bone;

}); // define
