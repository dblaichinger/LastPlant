/**
 * LastPlant JS Game
 * Michael Webersdorfer 
 * 
 *
 * Created with Renderengine renderengine.com
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
Engine.include("/components/component.boxbody.js");
Engine.include("/engine/engine.math2d.js");

Engine.initObject("Block", "LPObject", function() {

   /**
    * @class A Block LPObject.  Uses the box body to physically animate
    *			 the LPObject.
    *
    * @constructor
    * @extends LPObject
    * @description Create a Block LPObject
    */
   var Block = LPObject.extend(/** @scope Block.prototype */{

		boxSize: null,
        isPlaced: false,

		/**
		 * @private
		 */
		constructor: function() {
			this.base("Block-long", "Block-long", "Block-longOver");
            this.isPlaced=false;
            this.LPOType="Block";
		},

		/**
		 * Create the physical body component and assign it to the
		 * LPObject.
		 *
		 * @param componentName {String} The name to assign to the component.
		 * @param scale {Number} A scalar scaling value for the LPObject
		 */
		createPhysicalBody: function(componentName, scale) {
			this.boxSize = Point2D.create(42, 197);
			this.boxSize.mul(scale);
			this.add(BoxBodyComponent.create(componentName, this.boxSize));
			
			// Set the friction and bounciness of the Block
			this.getComponent(componentName).setFriction(0.3);
			this.getComponent(componentName).setRestitution(0);
			this.getComponent(componentName).setDensity(8);
			//this.setRot(90);
		},
		
		clicked: function(p) {
            /*var force = Vector2D.create(p).sub(this.getPosition()).mul(20000);
             this.applyForce(force, p);
            force.destroy();*/

            if(this.isPlaced==false){
                this.stopsim();
                this.setPosition(p);
            }
            
        },
            
        /**
         * called when button released
         */
        released: function(p) {
            if(this.isPlaced==false){
                this.isPlaced=true;
                this.remove(this.Collider);
                this.setSprite(0);
                LastPlant.createLPObject(this);
                this.startsim();
            }
        },
		

    }, /** @scope Block.prototype */{ // Static
    
   /**
    * Get the class name of this object
    * @return {String} The string <tt>Block</tt>
    */
   getClassName: function() {
      return "Block";
   }

   });

return Block;

});