/**
<<<<<<< HEAD
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
=======
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
>>>>>>> 12a6c858ca3a1f66ff36776792d0e57daca43736

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
<<<<<<< HEAD
        health: 40,
=======
        health: 60,
>>>>>>> 12a6c858ca3a1f66ff36776792d0e57daca43736

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
<<<<<<< HEAD
			this.boxSize = Point2D.create(24, 76);
=======
			this.boxSize = Point2D.create(21, 66);
>>>>>>> 12a6c858ca3a1f66ff36776792d0e57daca43736
			this.boxSize.mul(scale);
			this.add(BoxBodyComponent.create(componentName, this.boxSize));
			
			// Set the friction and bounciness of the Plant
			this.getComponent(componentName).setFriction(0.3);
			this.getComponent(componentName).setRestitution(0);
			this.getComponent(componentName).setDensity(8);
<<<<<<< HEAD
            
			//this.getComponent(componentName).setRotation(90);
		},
		
        //called every frame
        update: function(renderContext, time){
            /*if(this.getComponent("physics").isSleeping()==false){
                //this.getComponent("physics").getRenderComponent().setDrawMode(1);
                this.getComponent("physics").getRenderComponent().execute(renderContext, time);
                console.log("drawmode:" + this.getComponent("physics").getRenderComponent().getDrawMode());
                console.log("isSleeping: " + this.getComponent("physics").isSleeping() );
                //console.log("destr: " + this.destroyable);
            } else {
                if(this.destroyable==true)
                    //this.destroy();
                    console.log("me getting destr: ");
            }*/
            //console.log(this.getComponent("physics").getRenderComponent());
            //this.getComponent("physics").getRenderComponent().execute(renderContext, time);
            //console.log(renderContext);
            
            //console.log("time: " + time);
            //console.log(this.getProperties());
            //this.execute(renderContext, time);
            
            /*this.getComponent("physics").update();
            this.getComponent("physics").execute(renderContext, time);
            this.getComponent("collide").update();
            this.getComponent("collide").execute(renderContext, time);
            this.getComponent("physics").getRenderComponent().update();
            this.getComponent("physics").getRenderComponent().execute(renderContext, time);*/
=======
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
>>>>>>> 12a6c858ca3a1f66ff36776792d0e57daca43736
            renderContext.pushTransform();
            this.base(renderContext, time);
            renderContext.popTransform();
            
            if(!this.timeOfCreationSet){
                this.timeOfCreation=time;
                this.timeOfCreationSet=true;
            }
            if(time-this.timeOfCreation > 1000)
                this.destroyable=true;
            
<<<<<<< HEAD
            //var asd=time-this.timeOfCreation;
            //console.log("time-timeOfCreation: " + asd);
            
            if(this.getComponent("physics").isSleeping()==false){
                //console.log("isSleeping: " + this.getComponent("physics").isSleeping() );
                //console.log("destr: " + this.destroyable);
                if(this.destroyable==true){
                    //console.log(this.getComponent("physics").getRotation());
                    var AngVelocity=this.getComponent("physics").getAngVelocity();
                    //to prevent very small repetitive movements to kill the plant
                    if(AngVelocity>=0.06 || AngVelocity<=-0.06){
=======
            if(this.getComponent("physics").isSleeping()==false){
                if(this.destroyable==true){
                    var AngVelocity=this.getComponent("physics").getAngVelocity();
                    
                    if(AngVelocity>=0.06 || AngVelocity<=-0.06){ //to prevent very small repetitive movements to kill the plant
>>>>>>> 12a6c858ca3a1f66ff36776792d0e57daca43736
                        if(AngVelocity > 0)
                            this.health-=AngVelocity;
                        else
                            this.health+=AngVelocity;
<<<<<<< HEAD
                        //console.log(AngVelocity);
                        //console.log("hp: " + this.health);
=======
                            
                    var LinearVelocity = Vector2D.create(this.getComponent("physics").getLinVelocity().x,this.getComponent("physics").getLinVelocity().y);
                    LinearVelocityLength=LinearVelocity.len()/10;
                    if(LinearVelocityLength > 0.05)
                        this.health-=LinearVelocityLength;
>>>>>>> 12a6c858ca3a1f66ff36776792d0e57daca43736
                    }
                }
            }
            
<<<<<<< HEAD
            /*} else {
                if(this.destroyable==true)
                    this.destroy();
                    //console.log("me getting destr: ");
            }*/
=======
>>>>>>> 12a6c858ca3a1f66ff36776792d0e57daca43736
            if(this.health<=0){
                LastPlant.gameOver(true);
                this.destroy();
            }
        },
        
		clicked: function(p) {
<<<<<<< HEAD
            /*var force = Vector2D.create(p).sub(this.getPosition()).mul(20000);
             this.applyForce(force, p);
            force.destroy();*/
            
            this.stopsim();
            this.setPosition(p);
            //console.log("plant clicked");
            
=======
            //nothing now
>>>>>>> 12a6c858ca3a1f66ff36776792d0e57daca43736
        },
            
        /**
         * called when button released
         */
        released: function(p) {
<<<<<<< HEAD
            this.startsim();
            //this.getComponent("physics").applyTorque(4500000000)
        },
		
=======
            //nothing now
        },
        onCollide: function(obj) {
            //nothing now
        },  
>>>>>>> 12a6c858ca3a1f66ff36776792d0e57daca43736

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