
/**
 * The Render Engine
 * A wooden Block LPObject
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

Engine.initObject("ForceSetter", "LPObject", function() {

   /**
    * @class A LPObject.  Uses the box body to physically animate the LPObject object.
    *
    * @constructor
    * @extends LPObject
    * @description Create a LPObject
    */
   var ForceSetter = LPObject.extend(/** @scope ForceSetter.prototype */{

        boxSize: null,
        ShootDirection: null,

        /**
         * @private
         */
        constructor: function() {
            this.base("gui", "guiblock", "over");
        },

        /**
         * Create the physical body component and assign it to the
         * LPObject.
         *
         * @param componentName {String} The name to assign to the component.
         * @param scale {Number} A scalar scaling value for the LPObject
         */
        createPhysicalBody: function(componentName, scale) {
            this.boxSize = Point2D.create(10, 20);
            this.boxSize.mul(scale);
            this.add(BoxBodyComponent.create(componentName, this.boxSize));
            
            // Set the friction and bounciness of the Block
            this.getComponent(componentName).setFriction(0.3);
            this.getComponent(componentName).setRestitution(0);
            this.getComponent(componentName).setDensity(8);

        },
        
        clicked: function(p) {
            //var force=Point2D(p.x,p.y);
            var AttackUnit=LastPlant.getAttackUnit();
            var distanceToUnit=p.dist(AttackUnit.getPosition());
            if(distanceToUnit<150){
                this.setPosition(p);
                this.ShootDirection=p.sub(AttackUnit.getPosition());
            }
                
            //console.log("ForceSetter clicked");
        },
            
        /**
         * called when button released
         */
        released: function(p) {
            var AttackUnit=LastPlant.getAttackUnit();
            //console.log("attacking unit in AttkUnit: " + LastPlant.getAttackUnit());
            var thisPos = this.getPosition();
            this.ShootDirection = thisPos.sub(AttackUnit.getPosition());
            var distanceToUnit = thisPos.dist(AttackUnit.getPosition());
            
            //if(distanceToUnit<150){
                //start sim of unit
                AttackUnit.startsim();
                //var Position=this.getPosition();
                //apply force to unit
                var v = Vector2D.create (this.ShootDirection.x*10000000, this.ShootDirection.y*10000000);
                //console.log(v);
                //console.log(Position);
                AttackUnit.applyForce(v,AttackUnit.getPosition());
                v.destroy();
                this.destroy();
            //}
            
        },
        

    }, /** @scope Block.prototype */{ // Static
    
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