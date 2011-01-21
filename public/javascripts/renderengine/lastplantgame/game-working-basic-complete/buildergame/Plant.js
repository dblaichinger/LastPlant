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
        health: 20,
        isPlaced: false,
        canBeSaved: true,
        
		/**
		 * @private
		 */
		constructor: function() {
			this.base("Plant", "Plant", "PlantOver");
            this.isPlaced=false;
            this.LPOType="Plant";
		},

		/**
		 * Create the physical body component and assign it to the
		 * LPObject.
		 *
		 * @param componentName {String} The name to assign to the component.
		 * @param scale {Number} A scalar scaling value for the LPObject
		 */
		createPhysicalBody: function(componentName, scale) {
			this.boxSize = Point2D.create(24, 76);
			this.boxSize.mul(scale);
			this.add(BoxBodyComponent.create(componentName, this.boxSize));
			
			// Set the friction and bounciness of the Plant
			this.getComponent(componentName).setFriction(0.3);
			this.getComponent(componentName).setRestitution(0);
			this.getComponent(componentName).setDensity(8);
            
			//this.getComponent(componentName).setRotation(90);
		},
		
        //called every frame
        update: function(renderContext, time){
            renderContext.pushTransform();
            this.base(renderContext, time);
            renderContext.popTransform();
            
            if(this.isPlaced==true && this.getComponent("physics").isSleeping()==true && this.canBeSaved==true){
                this.canBeSaved=false;
                Timeout.create("SaveTimer", 2000, function() {
                    LastPlant.gameOver();
                    LastPlant.saveConstruct();
                });
            }
		},
        
		clicked: function(p) {
            /*var force = Vector2D.create(p).sub(this.getPosition()).mul(20000);
             this.applyForce(force, p);
            force.destroy();*/
            
            //this.stopsim();
            //this.setPosition(p);
            //console.log("plant clicked");
            
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
                this.startsim();
                LastPlant.showPlantWasSetText();
            }
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