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
Engine.include("/components/component.circlebody.js");

Engine.initObject("AttkUnit", "LPObject", function() {

   /**
    * @class The Attacking Unit
    *
    * @constructor
    * @extends LPObject
    * @description Create a AttkUnit LPObject
    */
   var AttkUnit = LPObject.extend(/** @scope AttkUnit.prototype */{

		size: 20,
		//cursorPosition: Point2D.create(0,0),
        wasShot: false,
        TimeWhenShot: null,
        CreateTime: null,
        

		/**
		 * @private
		 */
		constructor: function() {
			this.base("AttkUnit", "AttkUnit", "AttkUnitOver");
            this.wasShot=false;
            this.CreateTime=Engine.worldTime;
            //console.log(this.CreateTime);
		},

		/**
		 * Create the physical body component and assign it to the
		 * LPObject.
		 *
		 * @param componentName {String} The name to assign to the component.
		 * @param scale {Number} A scalar scaling value for the LPObject
		 */
		createPhysicalBody: function(componentName, scale) {
			//this.size = 20;
			this.size *= scale;
			this.add(CircleBodyComponent.create(componentName, this.size));
			
			// Set the friction and bounciness of the AttkUnit
			this.getComponent(componentName).setFriction(8);
			this.getComponent(componentName).setRestitution(2); //bounciness
			//this.getComponent(componentName).setMass(10);
			this.getComponent(componentName).setDensity(20);
		},
        SetWasShot: function(thisWasShot) {
            this.wasShot=thisWasShot;
        },
        getWasShot: function() {
            return this.wasShot;
        }, 
        SetTimeWhenShot: function(Time) {
            this.TimeWhenShot=Time;
        }, 
        

        //called every frame
        update: function(renderContext, time){
            renderContext.pushTransform();
            this.base(renderContext, time);
            renderContext.popTransform();
            if(this.wasShot && this.getComponent("physics").isSleeping()){
                //console.log("sleeping: " + this.getComponent("physics").isSleeping());
                //console.log("geht nu");
                LastPlant.getForceSetter().resetPosRot();
                LastPlant.setNewAttackUnit();
                this.destroy();
            }
            if(this.wasShot){
                var TimeAlive=time-this.TimeWhenShot;
                //console.log("TimeAlive:" + TimeAlive);
                if(TimeAlive>6000){
                    LastPlant.getForceSetter().resetPosRot();
                    LastPlant.setNewAttackUnit();
                    this.destroy();
                }
            }
            /*if(TimeAlive>6000){
                LastPlant.setNewAttackUnit();
                this.destroy();
            }*/
            
        },
        /*release: function(p) {
            
        },*/        
        clicked: function(p) {
            //cursorPosition=p;
            
        },
            
        /**
         * called when button released
         */
        released: function(p) {
            //this.startsim();
            //var v = Vector2D.create (1000000000, 1000000000);
            //console.log(v);
            //console.log(this.getPosition());
            //this.applyForce(v,this.getPosition());
            //v.destroy();
        },
		

   }, /** @scope AttkUnit.prototype */{ // Static

      /**
       * Get the class name of this object
       * @return {String} The string <tt>AttkUnit</tt>
       */
      getClassName: function() {
         return "AttkUnit";
      }
   });

return AttkUnit;

});