/**
 * The Render Engine
 * ImageComponent
 *
 * @fileoverview An extension of the render component which handles 
 *               image resource rendering.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori $
 * @version: $Revision: 1408 $
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
Engine.include("/engine/engine.math2d.js");
Engine.include("/components/component.render.js");

Engine.initObject("ImageComponent", "RenderComponent", function() {

/**
 * @class A {@link RenderComponent} that draws an image to the render context.
 *        Images used by this component are loaded via an {@link ImageLoader}
 *        so that client-side caching can be implemented.
 *
 * @param name {String} The name of the component
 * @param [priority=0.1] {Number} The render priority
 * @param image {Image} The image object, acquired with {@link ImageLoader#getImage}.
 * @extends RenderComponent
 * @constructor
 * @description Creates a component which renders images from an {@link ImageLoader}.
 */
var ImageComponent = RenderComponent.extend(/** @scope ImageComponent.prototype */{

   currentImage: null,
   bbox: null,
   imageLoader: null,

   /**
    * @private
    */
   constructor: function(name, priority, image) {
      if (Image.isInstance(priority)) {
         image = priority;
         priority = 0.1;
      }
      this.base(name, priority);
      if (image != null) {
         this.currentImage = image;
         this.bbox = this.currentImage.getBoundingBox();
      }
   },

   /**
    * Releases the component back into the object pool. See {@link PooledObject#release}
    * for more information.
    */
   release: function() {
      this.base();
      this.currentImage = null;
      this.bbox = null;
   },

   /**
    * Calculates the bounding box which encloses the image.
    * @private
    */
   calculateBoundingBox: function() {
      return this.bbox;
    },

   /**
    * Set the image the component will render from the {@link ImageLoader}
    * specified when creating the component.  This allows the user to change
    * the image on the fly.
    *
    * @param image {Image} The image to render
    */
   setImage: function(image) {
      this.currentImage = image;
      this.bbox = image.getBoundingBox();
   },

   /**
    * Get the image the component is rendering.
    * @return {HTMLImage}
    */
   getImage: function() {
      return this.currentImage;
   },

   /**
    * Draw the image to the render context.
    *
    * @param renderContext {RenderContext} The context to render to
    * @param time {Number} The engine time in milliseconds
    */
   execute: function(renderContext, time) {

      if (!this.base(renderContext, time))
      {
         return;
      }

      if (this.currentImage) {
			this.transformOrigin(renderContext, true);
         renderContext.drawImage(this.bbox, this.currentImage.getImage(), null, this.getHostObject());
			this.transformOrigin(renderContext, false);
      }
   }
}, /** @scope ImageComponent.prototype */{ 
   /**
    * Get the class name of this object
    * @return {String} "ImageComponent"
    */
   getClassName: function() {
      return "ImageComponent";
   }
});

return ImageComponent;

});
