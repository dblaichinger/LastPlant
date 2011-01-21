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
    * @class A wooden Block LPObject to play with.  Uses the box body to physically animate
    *			 the LPObject object.
    *
    * @constructor
    * @extends LPObject
    * @description Create a wooden Block LPObject
    */
   var Block = LPObject.extend(/** @scope Block.prototype */{

		boxSize: null,
        destroyable: false,
        timeOfCreation: null,
        timeOfCreationSet: false,
        health: 150,
        
		/**
		 * @private
		 */
		constructor: function(BlockType) {
            this.LPOType=BlockType;
            if(BlockType=="Block-long")
                this.base("Block-long", "Block-long", "Block-longOver");
            else if(BlockType=="Block-square")
                this.base("Block-square", "Block-square", "Block-squareOver");
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
			
			// Set the friction and bounciness of the Block
			this.getComponent(componentName).setFriction(1);
			this.getComponent(componentName).setRestitution(-1);
			this.getComponent(componentName).setDensity(10);
		},
        
		/**
        * Update the Plant within the rendering context. Also it's checked
        * if the Plant was hit and health is set according
        * Called every frame
        *
        * @param renderContext {RenderContext} The rendering context
        * @param time {Number} The engine time in milliseconds
        */

        update: function(renderContext, time){
            renderContext.pushTransform();
            this.base(renderContext, time);
            renderContext.popTransform();
            
            if(!this.timeOfCreationSet){
                this.timeOfCreation=time;
                this.timeOfCreationSet=true;
            }
            if(time-this.timeOfCreation > 1000)
                this.destroyable=true;
            
            if(this.getComponent("physics").isSleeping()==false){
                if(this.destroyable==true){
                    var AngVelocity=this.getComponent("physics").getAngVelocity();
                    
                    if(AngVelocity>=0.06 || AngVelocity<=-0.06){ //to prevent very small repetitive movements to kill the plant
                        if(AngVelocity > 0)
                            this.health-=AngVelocity;
                        else
                            this.health+=AngVelocity;
                            
                    var LinearVelocity = Vector2D.create(this.getComponent("physics").getLinVelocity().x,this.getComponent("physics").getLinVelocity().y);
                    LinearVelocityLength=LinearVelocity.len()/10;
                    if(LinearVelocityLength > 0.05)
                        this.health-=LinearVelocityLength;
                    }
                }
            }
            
            if(this.health<=0){
                LastPlant.destroyedBlocks++;
                this.destroy();
            }
        },
		clicked: function(p) {
            //[ABSTRACT]        
        },
            
        /**
         * called when button released
         */
        released: function(p) {
            //[ABSTRACT]
        },
        onCollide: function(obj) {
            //[ABSTRACT]
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