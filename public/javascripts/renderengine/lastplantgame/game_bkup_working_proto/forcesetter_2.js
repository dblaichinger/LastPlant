
/**
 * The Render Engine
 * A beachball toy
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
 * @author: $Author: bfattori@gmail.com $
 * @version: $Revision: 1361 $
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

// Load engine objects
Engine.include("/components/component.transform2d.js");
Engine.include("/components/component.collider.js");
Engine.include("/engine/engine.object2d.js");

Engine.initObject("ForceSetter", "Object2D", function() {

   var ForceSetter = Object2D.extend(/** @scope ForceSetter.prototype */{

		width: 10,
		height: 10,
		posX: 100,
		posY: 300,
		/**
		 * @private
		 */
		constructor: function() {
             this.base("ForceSetter");
             //this.base("gui", "guiblock", "over");			
	         this.add(Transform2DComponent.create("move"));
	         this.shape = Rectangle2D.create(this.posX, this.posY, this.width, this.height);
            
             this.add(ColliderComponent.create("collide", PhysicsDemo.cModel));

		},
        update: function(renderContext, time) {
           renderContext.pushTransform();
           this.base(renderContext, time);
           renderContext.setFillStyle("#0000ff");
           renderContext.drawFilledRectangle(this.shape);
           renderContext.popTransform();

        },
              
        clicked: function(p) {
            
        },
            
        /**
         * called when button released
         */
        released: function() {
            
        },
		

   }, /** @scope ForceSetter.prototype */{ // Static

      /**
       * Get the class name of this object
       * @return {String} The string <tt>ForceSetter</tt>
       */
      getClassName: function() {
         return "ForceSetter";
      }
   });

return ForceSetter;

});