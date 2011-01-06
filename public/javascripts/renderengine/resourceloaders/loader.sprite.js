/**
 * The Render Engine
 * SpriteLoader
 *
 * @fileoverview An extension of the image resource loader for handling
 *               sprites.  Includes a class for working with loaded sprites.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori $
 * @version: $Revision: 1402 $
 *
 * Copyright (c) 2010 Brett Fattori (brettf@renderengine.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

// Includes
Engine.include("/engine/engine.pooledobject.js");
Engine.include("/engine/engine.math2d.js");
Engine.include("/resourceloaders/loader.image.js");

Engine.initObject("SpriteLoader", "ImageLoader", function() {

/**
 * @class Loads sprites and makes them available to the system.  Sprites are
 *        defined by an external JSON resource file.  A sprite definition file 
 *        is a JSON file which can support single-line comments.  The format 
 *        describes the image which contains the bitmap, the size of the bitmap,
 *        the version of the file, and the sprites.  Sprites can be either single
 *        frames or animations.  Animations are expected to be sequentially organized
 *        in the bitmap from left to right.  Each frame of an animation must be the exact
 *        same dimensions.
 *        <p/>
 *        A frame is simply defined by the upper left corner of the sprite and the
 *        width and height of the frame.  For an animation, the first four arguments are
 *        the same as a frame, followed by the frame count, the millisecond delay between
 *        frames, and the type of animation (either "loop" or "toggle").  A looped animation
 *        will play all frames, indicated by the frame count, and then start again from the
 *        beginning of the animation.  A toggled animation will play from the first to
 *        the last frame, then play from the last to the first, and then repeat.  The
 *        first and last frame will not be repeated in a toggled animation.  Thus, if
 *        the frames are A, B, C, then the toggle will play as A, B, C, B, A, B...
 * <pre>
 * {
 *    // Sprite definition file v2
 *    "bitmapImage": "bitmapFile.ext",
 *    "bitmapSize": [320, 320],
 *    "version": 2
 *    "sprites": {
 *        "stand": [0, 0, 32, 32],
 *        "walk": [32, 0, 32, 32, 3, 150, "loop"]
 *    }
 * }
 * </pre>
 *        <i>Note:</i> The new file structure is a bit more compact, and is indicated with
 *        the "version" key in the file, set to the value 2.  Version 1 will be deprecated
 *        and will not be supported in a future release of The Render Engine.
 *
 * @constructor
 * @param name {String=SpriteLoader} The name of the resource loader
 * @extends ImageLoader
 */
var SpriteLoader = ImageLoader.extend(/** @scope SpriteLoader.prototype */{

   sprites: null,
   
   queuedSprites: 0,

   constructor: function(name) {
      this.base(name || "SpriteLoader");
      this.sprites = {};
      this.queuedSprites = 0;
   },

   /**
    * Load a sprite resource from a URL.
    *
    * @param name {String} The name of the resource
    * @param url {String} The URL where the resource is located
    */
   load: function(name, url, info, path) {

      if (url)
      {
         var loc = window.location;
         if (url.indexOf(loc.protocol) != -1 && url.indexOf(loc.host) == -1) {
            Assert(false, "Sprites must be located on this server");
         }

         this.queuedSprites++;
         var thisObj = this;

         // Get the file from the server
         Engine.loadJSON(url, function(spriteInfo, status) {
            // get the path to the resource file
            var path = url.substring(0, url.lastIndexOf("/"));
            thisObj.load(name, null, spriteInfo, path + "/");
         });
      }
      else
      {
         info.bitmapImage = path + info.bitmapImage;
         Console.info("Loading sprite: " + name + " @ " + info.bitmapImage);

         // Load the sprite image file
			if (!info.version || info.version == 1) {
	         this.base(name, info.bitmapImage, info.bitmapWidth, info.bitmapHeight);
			} else if (info.version == 2) {
	         this.base(name, info.bitmapImage, info.bitmapSize[0], info.bitmapSize[1]);
			}

         // Store the sprite info
         this.sprites[name] = info;
         this.queuedSprites--;
      }
   },

   /**
    * Get the sprite resource with the specified name from the cache.  The
    * object returned contains the bitmap as <tt>image</tt> and
    * the sprite definition as <tt>info</tt>.
    *
    * @param name {String} The name of the object to retrieve
    * @return {Object} An object with two keys: "image" and "info"
    */
   get: function(name) {
      var bitmap = this.base(name);
      var sprite = {
         image: bitmap,
         info: this.sprites[name]
      };
      return sprite;
   },

   /**
    * Check to see if a named resource is "ready for use".
    * @param name {String} The name of the resource to check ready status for,
    *             or <tt>null</tt> for all resources in loader.
    * @return {Boolean} <tt>true</tt> if the resource is loaded and ready to use
    */
   isReady: function(name) {
      // If sprites are queued, we can't be totally ready
      if (this.queuedSprites > 0) {
         return false;
      }
      
      return this.base(name);
   },

   /**
    * Creates a {@link Sprite} object representing the named sprite.
    *
    * @param resource {String} A loaded sprite resource
    * @param sprite {String} The name of the sprite from the resource
    * @return {Sprite} A {@link Sprite} instance
    */
   getSprite: function(resource, sprite) {
		var info = this.get(resource).info;
      return Sprite.create(sprite, info.sprites[sprite], this.get(resource), info.version || 1);
   },

   /**
    * Get the names of all the sprites available in a resource.
    *
    * @param resource {String} The name of the resource
    * @return {Array} All of the sprite names in the given loaded resource
    */
   getSpriteNames: function(resource) {
      var s = [];
      var spr = this.sprites[resource].sprites;
      for (var i in spr) {
         s.push(i);
      }
      return s;
   },

	exportAll: function(resource) {
		var o = this.base();
		var sprites = this.getSpriteNames(resource);
		for (var i in sprites) {
			o[sprites[i]] = this.getSprite(resource, sprites[i]);
		}
		return o;
	},

   /**
    * The name of the resource this loader will get.
    * @returns {String} The string "sprite"
    */
   getResourceType: function() {
      return "sprite";
   }

}, /** @scope SpriteLoader.prototype */{
   /**
    * Get the class name of this object.
    * @return {String} The string "SpriteLoader"
    */
   getClassName: function() {
      return "SpriteLoader";
   }
});

return SpriteLoader;

});

Engine.initObject("Sprite", "PooledObject", function() {

/**
 * @class Represents a sprite
 *
 * @constructor
 * @param name {String} The name of the sprite within the resource
 * @param spriteObj {Object} Passed in by a {@link SpriteLoader}.  An array which defines the
 *                  sprite frame, and parameters.
 * @param spriteResource {Object} The sprite resource loaded by the {@link SpriteLoader}
 * @extends PooledObject
 */
var Sprite = PooledObject.extend(/** @scope Sprite.prototype */{

   // The type of sprite: Single or Animation
   type: -1,

   // Animation mode: loop or toggle
   mode: -1,

   // Animation frame count
   count: -1,

   // Animation speed
   speed: -1,

   // The rect which defines the sprite frame
   frame: null,

   // The image map that contains the sprite(s)
   image: null,

   // The bounding box for the sprite
   bbox: null,

   /**
    * @private
    */
   constructor: function(name, spriteObj, spriteResource, fileVersion) {
      this.base(name);
		
		if (fileVersion == 1) {
	  		this.type = (spriteObj["a"] ? Sprite.TYPE_ANIMATION : Sprite.TYPE_SINGLE);
		} else if (fileVersion == 2) {
			this.type = (spriteObj.length == 4 ? Sprite.TYPE_SINGLE : Sprite.TYPE_ANIMATION);
		}

      var s;
		if (fileVersion == 1) {
			s = (this.type == Sprite.TYPE_ANIMATION ? spriteObj["a"] : spriteObj["f"]);
		} else if (fileVersion == 2) {
			s = spriteObj;
		}
		
      if (this.type == Sprite.TYPE_ANIMATION) {
         this.mode = (s[Sprite.INDEX_TYPE] == "loop" ? Sprite.MODE_LOOP : Sprite.MODE_TOGGLE);
         this.count = s[Sprite.INDEX_COUNT];
         this.speed = s[Sprite.INDEX_SPEED];
      }

      this.image = spriteResource.image;
      this.frame = Rectangle2D.create(s[Sprite.INDEX_LEFT], s[Sprite.INDEX_TOP], s[Sprite.INDEX_WIDTH], s[Sprite.INDEX_HEIGHT]);
      this.bbox = Rectangle2D.create(0, 0, s[Sprite.INDEX_WIDTH], s[Sprite.INDEX_HEIGHT]);
   },

	/**
	 * @private
	 */
	destroy: function() {
		this.bbox.destroy();
		this.frame.destroy();
		this.base();
	},

   /**
    * @private
    */
   release: function() {
      this.base();
      this.mode = -1;
      this.type = -1;
      this.count = -1;
      this.speed = -1;
      this.frame = null;
      this.image = null;
      this.bbox = null;
   },

   /**
    * Returns <tt>true</tt> if the sprite is an animation.
    * @return {Boolean} <tt>true</tt> if the sprite is an animation
    */
   isAnimation: function() {
      return (this.type == Sprite.TYPE_ANIMATION);
   },

   /**
    * Returns <tt>true</tt> if the sprite is an animation and loops.
    * @return {Boolean} <tt>true</tt> if the sprite is an animation and loops
    */
   isLoop: function() {
      return (this.isAnimation() && this.mode == Sprite.MODE_LOOP);
   },

   /**
    * Returns <tt>true</tt> if the sprite is an animation and toggles.
    * @return {Boolean} <tt>true</tt> if the sprite is an animation and toggles
    */
   isToggle: function() {
      return (this.isAnimation() && this.mode == Sprite.MODE_TOGGLE);
   },

   /**
    * Get the bounding box for the sprite.
    * @return {Rectangle2D} The bounding box which contains the entire sprite
    */
   getBoundingBox: function() {
      return this.bbox;
   },

   /**
    * Gets the frame of the sprite. The frame is the rectangle that defining what
    * portion of the image map the sprite frame occupies, given the specified time.
    *
    * @param time {Number} Current world time (can be obtained with {@link Engine#worldTime}
    * @return {Rectangle2D} A rectangle which defines the frame of the sprite in
    *         the source image map.
    */
   getFrame: function(time) {
      if (!this.isAnimation()) {
         return Rectangle2D.create(this.frame);
      } else {
         var f = Rectangle2D.create(this.frame);
         var fn;
         if (this.isLoop()) {
            fn = Math.floor(time / this.speed) % this.count;
         } else {
            fn = Math.floor(time / this.speed) % (this.count * 2);
            if (fn > this.count - 1) {
               fn = this.count - (fn - (this.count - 1));
            }
         }
         return f.offset(f.dims.x * fn, 0);
      }
   },

   /**
    * Set the speed, in milliseconds, that an animation runs at.  If the sprite is
    * not an animation, this has no effect.
    *
    * @param speed {Number} The number of milliseconds per frame of an animation
    */
   setSpeed: function(speed) {
      if (speed >= 0) {
         this.speed = speed;
      }
   },

   /**
    * Get the number of milliseconds each frame is displayed for an animation
    * @return {Number} The milliseconds per frame
    */
   getSpeed: function() {
      return this.speed;
   },

   /**
    * The source image loaded by the {@link SpriteLoader} when the sprite was
    * created.
    * @return {HTMLImage} The source image the sprite is contained within
    */
   getSourceImage: function() {
      return this.image;
   }

}, /** @scope Sprite.prototype */{
   /**
    * Gets the class name of this object.
    * @return {String} The string "Sprite"
    */
   getClassName: function() {
      return "Sprite";
   },

   /** The sprite animation loops
    * @type Number
    */
   MODE_LOOP: 0,

   /** The sprite animation toggles - Plays from the first to the last frame
    *  then plays backwards to the first frame and repeats.
    * @type Number
    */
   MODE_TOGGLE: 1,

   /** The sprite is a single frame
    * @type Number
    */
   TYPE_SINGLE: 0,

   /** The sprite is an animation
    * @type Number
    */
   TYPE_ANIMATION: 1,

   /** The field in the sprite definition file for the left pixel of the sprite frame
    * @private
    */
   INDEX_LEFT: 0,

   /** The field in the sprite definition file for the top pixel of the sprite frame
    * @private
    */
   INDEX_TOP: 1,

   /** The field in the sprite definition file for the width of the sprite frame
    * @private
    */
   INDEX_WIDTH: 2,

   /** The field in the sprite definition file for the height of the sprite frame
    * @private
    */
   INDEX_HEIGHT: 3,

   /** The field in the sprite definition file for the count of frames in the sprite
    * @private
    */
   INDEX_COUNT: 4,

   /** The field in the sprite definition file for the speed in milliseconds that the sprite animates
    * @private
    */
   INDEX_SPEED: 5,

   /** The field in the sprite definition file for the type of sprite animation
    * @private
    */
   INDEX_TYPE: 6
});

return Sprite;

});
