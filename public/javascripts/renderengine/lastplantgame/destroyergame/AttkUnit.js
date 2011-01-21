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
		},

		/**
		 * Create the physical body component and assign it to the
		 * LPObject.
		 *
		 * @param componentName {String} The name to assign to the component.
		 * @param scale {Number} A scalar scaling value for the LPObject
		 */
		createPhysicalBody: function(componentName, scale) {
			this.size *= scale;
			this.add(CircleBodyComponent.create(componentName, this.size));
			
			// Set the friction and bounciness and density of the AttkUnit
			this.getComponent(componentName).setFriction(8);
			this.getComponent(componentName).setRestitution(2); //bounciness
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
        
        /**
         * Update the AttkUnit within the rendering context. 
         * If it's shot check if it's sleeping, then destroy it
         * of check if it's been alive longer then 6 seconds, then destroy it
         *
         * @param renderContext {RenderContext} The rendering context
         * @param time {Number} The engine time in milliseconds
        */
        update: function(renderContext, time){
            renderContext.pushTransform();
            this.base(renderContext, time);
            renderContext.popTransform();
            if(this.wasShot && this.getComponent("physics").isSleeping()){
                LastPlant.getForceSetter().resetPosRot();
                LastPlant.setNewAttackUnit();
                this.destroy();
            }
            if(this.wasShot){
                var TimeAlive=time-this.TimeWhenShot;
                if(TimeAlive>6000){
                    LastPlant.getForceSetter().resetPosRot();
                    LastPlant.setNewAttackUnit();
                    this.destroy();
                }
            }
        },
        /**
         * called when Attkunit is clicked
         */
        clicked: function(p) {
            // nothing for now
        },
            
        /**
         * called when button released
         */
        released: function(p) {
            // nothing for now
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