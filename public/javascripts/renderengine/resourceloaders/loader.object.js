/**
 * The Render Engine
 * ObjectLoader
 *
 * @fileoverview An extension of the remote resource loader for loading
 * 				  JSON objects.
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
Engine.include("/resourceloaders/loader.remote.js");

Engine.initObject("ObjectLoader", "RemoteLoader", function() {

/**
 * @class Loads JSON objects from a specified URL.  The object uses a sligtly modified
 * 		 format which allows for single-line comments in the object definition.  The
 * 		 object must follow the rest of the JSON spec, with key names in quotes.
 *
 * @constructor
 * @param name {String=ObjectLoader} The name of the resource loader
 * @extends RemoteLoader
 */
var ObjectLoader = RemoteLoader.extend(/** @scope ObjectLoader.prototype */{

   objects: null,

   /**
    * private
    */
   constructor: function(name) {
      this.base(name || "ObjectLoader");
      this.objects = {};
   },

   /**
    * Load a JSON object from a URL.
    *
    * @param name {String} The name of the resource
    * @param url {String} The URL where the resource is located
    * @param obj {Object} The object that was loaded
    */
   load: function(name, url, obj) {

      if (url) {
         var loc = window.location;
         if (url.indexOf(loc.protocol) != -1 && url.indexOf(loc.host) == -1) {
            Assert(false, "Objects must be located on this server");
         }

         var thisObj = this;

         // Get the file from the server
			Engine.loadJSON(url, function(data) {
            // 2nd pass - store the object
            thisObj.load(name, null, data);
         });
      } else {
         // The object has been loaded and is ready for use
         this.base(name, obj);
         this.setReady(name, true);
      }
   },

   /**
    * The name of the resource this loader will get.
    * @returns {String} The string "object"
    */
   getResourceType: function() {
      return "object";
   }

}, /** @scope ObjectLoader.prototype */{
   /**
    * Get the class name of this object.
    * @return {String} The string "SpriteLoader"
    */
   getClassName: function() {
      return "ObjectLoader";
   }
});

return ObjectLoader;

});
