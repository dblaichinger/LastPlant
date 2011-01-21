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

Engine.initObject("Plant", "LPObject", function() {

   /**
    * @class A Plant LPObject.  Uses the box body to physically animate
    *			 the LPObject object.
    *
    * @constructor
    * @extends LPObject
    * @description Create a Plant LPObject
    */
   var Plant = LPObject.extend(/** @scope Plant.prototype */{

		boxSize: null,
        destroyable: false,
        timeOfCreation: null,
        timeOfCreationSet: false,
        health: 60,

		/**
		 * @private
		 */
		constructor: function() {
			this.base("Plant", "Plant", "PlantOver");
		},

		/**
		 * Create the physical body component and assign it to the
		 * LPObject.
		 *
		 * @param componentName {String} The name to assign to the component.
		 * @param scale {Number} A scalar scaling value for the LPObject
		 */
		createPhysicalBody: function(componentName, scale) {
			this.boxSize = Point2D.create(21, 66);
			this.boxSize.mul(scale);
			this.add(BoxBodyComponent.create(componentName, this.boxSize));
			
			// Set the friction and bounciness of the Plant
			this.getComponent(componentName).setFriction(0.3);
			this.getComponent(componentName).setRestitution(0);
			this.getComponent(componentName).setDensity(8);
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
                LastPlant.gameOver(true);
                this.destroy();
            }
        },
        
		clicked: function(p) {
            //nothing now
        },
            
        /**
         * called when button released
         */
        released: function(p) {
            //nothing now
        },
        onCollide: function(obj) {
            //nothing now
        },  

    }, /** @scope Plant.prototype */{ // Static
    
   /**
    * Get the class name of this object
    * @return {String} The string <tt>Plant</tt>
    */
   getClassName: function() {
      return "Plant";
   }

   });

return Plant;

});