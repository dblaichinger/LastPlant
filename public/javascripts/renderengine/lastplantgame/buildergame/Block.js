/**
    * Copyright (c) 2010 Michael Webersdorfer (mwebersdorfer@hotmail.com)
    * The LastPlant Javascript Game was created with "The Renderengine" (www.renderengine.com) by Brett Fattori (brettf@renderengine.com)
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

		/**
		 * @private
		 */
		constructor: function(BlockType) {
            this.LPOType=BlockType;
            if(BlockType=="Block-long")
                this.base("Block-long", "Block-long", "Block-longOver");
            else if(BlockType=="Block-square")
                this.base("Block-square", "Block-square", "Block-squareOver");
            
            this.isPlaced=false;
		},

		/**
		 * Create the physical body component and assign it to the
		 * LPObject.
		 *
		 * @param componentName {String} The name to assign to the component.
		 * @param scale {Number} A scalar scaling value for the LPObject
		 */
		createPhysicalBody: function(componentName, scale) {
			if(this.LPOType=="Block-long")
                this.boxSize = Point2D.create(34, 160);
			else if(this.LPOType=="Block-square")
                this.boxSize = Point2D.create(63, 63);
                
			this.boxSize.mul(scale);
			this.add(BoxBodyComponent.create(componentName, this.boxSize));
			
			// Set the friction, bounciness and density of the Block
            // Mass depends on objects size
			this.getComponent(componentName).setFriction(1);
			this.getComponent(componentName).setRestitution(-1);
			this.getComponent(componentName).setDensity(10);
		},
		
		clicked: function(p) {
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
        /**
         * Determine if the LPObject was touched by the player and, if so,
         * change the sprite which represents it.
        */
        onCollide: function(obj) {
            if(this.isPlaced==false){
                if (Player.isInstance(obj) &&
                  (this.getWorldBox().isIntersecting(obj.getWorldBox() ))) {
                  this.setSprite(1);
                  return ColliderComponent.STOP;
                }

                this.setSprite(0);
                return ColliderComponent.CONTINUE;
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