/**
 * The Render Engine
 * ImageLoader
 *
 * @fileoverview A resource loader for images.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori $
 * @version: $Revision: 1449 $
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
Engine.include("/resourceloaders/loader.remote.js");
Engine.include("/engine/engine.timers.js");

Engine.initObject("ImageLoader", "RemoteLoader", function() {

/**
 * @class Loads images and stores the reference to those images.  Images
 *        are stored on the client-side in a simple cache for faster re-use.
 *        When loading images, you assign a name to the image.  This would allow
 *        you to re-use the image without having to load it again for another
 *        purpose.
 *        <p/>
 *        Loading images is fairly simple.  You only need to create an instance
 *        of an image loader (multiple images can be loaded by the same resource
 *        loader) and then use it to load the images:
 <pre>
          this.imageLoader = ImageLoader.create();
          
          // Load an image
          this.imageLoader.load("keys", this.getFilePath("resources/fingerboard.png"), 220, 171);
 </pre>
 *        In the example above, <tt>this</tt> refers to a {@link Game} object which
 *        implements the {@link Game#getFilePath getFilePath()} method which is
 *        used to get a path relative to where the game is located on the server.
 *
 * @constructor
 * @param name {String=ImageLoader} The name of the resource loader
 * @extends RemoteLoader
 */
var ImageLoader = RemoteLoader.extend(/** @scope ImageLoader.prototype */{

   /**
    * @private
    */
   constructor: function(name) {
      this.base(name || "ImageLoader");
   },

   /**
    * Load an image resource from a URL.  Images are cached within the page
    * in an invisible object for fast retrieval.
    *
    * @param name {String} The name of the resource
    * @param url {String} The URL where the resource is located
    * @param width {Number} The width of this resource, in pixels
    * @param height {Number} The height of this resource, in pixels
    */
   load: function(name, url, width, height) {

      // Create the area if it doesn't exist which will
      // be used to load the images from their URL
      if (this.getElement() == null)
      {
         var div = jQuery("<div/>")
            .css({ background: "black", display: "none" });

         this.setElement(div[0]);

         // Add it to the default context so it can be cleaned up
         Engine.getDefaultContext().add(this);
      }

      // Create an image element
      var imageInfo = null;
      if (url != null) {
         imageInfo = this.loadImageResource(name, url, width, height);
      }

      this.base(name, imageInfo);
   },

   /**
    * Lazy loads an image resource when the information for it becomes available.  It
    * is best to specify the width and height of the resource, but it isn't necessary
    * to load the image.
    *
    * @param name {String} The name of the resource
    * @param url {String} The URL where the resource is located
    * @param width {Number} The width of this resource, in pixels, or <tt>null</tt>
    * @param height {Number} The height of this resource, in pixels, or <tt>null</tt>
    * @return {HTMLImage} The image loaded
    */
   loadImageResource: function(name, url, width, height) {
      var image = null;
      if (width && height) {
         image = $("<img/>").attr("src", url).attr("width", width).attr("height", height);
      } else {
         image = $("<img/>").attr("src", url);
      }
      
      var thisObj = this;
      if (!$.browser.Wii) {
         image.bind("load", function() {
            thisObj.setReady(name, true);
         });
      } else {
         // Calculate an approximate wait time based on dimensions
         OneShotTimeout.create("readyImg", (width * height) * ImageLoader.loadAdjust, function() {
            thisObj.setReady(name, true); 
         });
      }

      // Append it to the container so it can load the image
      $(this.getElement()).append(image);
      var info = {
         width: width,
         height: height,
         image: image
      };
      return info;
   },

   /**
    * Get the image from the resource stored with the specified name, or <tt>null</tt>
    * if no such image exists.
    *
    * @param name {String} The name of the image resource
    * @return {HTMLImage} The image
    */
   get: function(name) {
      var imgInfo = this.base(name);
      return imgInfo ? imgInfo.image[0] : null;
   },
	
	/**
	 * Get an {@link Image} object from the resource which represents the image, or <tt>null</tt>
	 * if no such image exists.
	 * @param name {String} The name of the image resource
	 * @return {Image}
	 */
	getImage: function(name) {
		return Image.create("Image", name, this); 	
	},
   
   /**
    * Get the dimensions of an image from the resource stored with 
    * the specified name, or <tt>null</tt> if no such image exists.
    *
    * @param name {String} The name of the image resource
    * @return {Point2D} A point which represents the width and height of the image
    */
   getDimensions: function(name) {
      var imgInfo = this.getCachedObjects()[name] ? this.getCachedObjects()[name].data : null;
      return imgInfo ? Point2D.create(imgInfo.width, imgInfo.height) : null;
   },

   /**
    * The name of the resource this loader will get.
    * @return {String} The string "image"
    */
   getResourceType: function() {
      return "image";
   }
}, /** @scope ImageLoader.prototype */{
   /**
    * Get the class name of this object
    * @return {String} The string "ImageLoader"
    */
   getClassName: function() {
      return "ImageLoader";
   },
   
   /**
    * The ratio by which to scale image load times when loading on the Wii
    */
   loadAdjust: 0.05
});

return ImageLoader;

});

Engine.initObject("Image", "PooledObject", function() {

/**
 * @class A wrapper class for images.  Images contain a reference to their resource
 * 		 loader and the bitmap dimensions for the image.  Additionally, the dimensions
 * 		 are used to determine the bounding box around the image.
 *
 * @constructor
 * @param name {String} The name of the image object
 * @param imageName {String} The name of the image container in the resource loader
 * @param imageLoader {ImageLoader} The resource loader used to load the image
 * @extends PooledObject
 */
var Image = PooledObject.extend(/** @scope Image.prototype */{

	image: null,

   /**
    * @private
    */
   constructor: function(name, imageName, imageLoader) {
      this.base(name || "Image");
		this.image = imageLoader.get(imageName);
		var dims = imageLoader.getDimensions(imageName);
      this.bbox = Rectangle2D.create(0, 0, dims.x, dims.y);
   },
	
   /**
    * @private
    */
   release: function() {
      this.base();
      this.image = null;
      this.bbox = null;
   },

   /**
    * Get the bounding box for the image.
    * @return {Rectangle2D} The bounding box which contains the entire image
    */
   getBoundingBox: function() {
      return this.bbox;
   },

	/**
	 * Get the HTML image object which contains the image.
	 * @return {HTMLImage}
	 */
	getImage: function() {
		return this.image;
	}		
	
},{

   /**
    * Gets the class name of this object.
    * @return {String} The string "Image"
    */
   getClassName: function() {
      return "Image";
   }	
	
});

return Image;

});

