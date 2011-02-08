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

Engine.initObject("ForceSetter", "LPObject", function() {

   /**
    * @class A LPObject to Set the Force of the Attack Unit. It never actually gets simulated.
    *
    * @constructor
    * @extends LPObject
    */
   var ForceSetter = LPObject.extend(/** @scope ForceSetter.prototype */{

        boxSize: null,
        ShootDirection: null,
        width: 32,
        height: 17,
        startPosition: null,
        startRotation: null,
        isClicked: null,

        /**
         * @private
         */
        constructor: function() {
            this.base("ForceSetter", "ForceSetter", "ForceSetterOver");
        },

        /**
         * Create the physical body component and assign it to the ForceSetter
         *
         * @param componentName {String} The name to assign to the component.
         * @param scale {Number} A scalar scaling value for the ForceSetter
         */
        createPhysicalBody: function(componentName, scale) {
            this.boxSize = Point2D.create(this.width, this.height);
            this.boxSize.mul(scale);
            this.add(BoxBodyComponent.create(componentName, this.boxSize));
            
            // Set the friction and bounciness of the Block
            this.getComponent(componentName).setFriction(0.3);
            this.getComponent(componentName).setRestitution(0);
            this.getComponent(componentName).setDensity(8);

        },

        /**
         * Set the startposition and startrotaion of the ForceSetter
         *
         * @param StartPos (Point2D): the Startposition
         * @param StartRot(float): the Startrotation
         */
        setStartPosandRot: function(StartPos, StartRot) {
            this.startPosition=StartPos;
            this.startRotation=StartRot;
        },
        
        continuePosAndRotSetting: function(currentCursorPos) {
            if(this.isClicked){
                this.setSprite(1);
                var AttackUnit=LastPlant.getAttackUnit();
                var CursorPos=Point2D.create(currentCursorPos);

                var distanceToUnit=CursorPos.dist(AttackUnit.getPosition());
                
                this.ShootDirection=CursorPos.sub(AttackUnit.getPosition());
                var ShootDirectionVec = Vector2D.create(this.ShootDirection.get().x, this.ShootDirection.get().y);
                var AngleToSet = ShootDirectionVec.angleBetween(Vector2D.create(-1, 0));
                var AngleToYAxis = ShootDirectionVec.angleBetween(Vector2D.create(0, 1));
                
                //clamp forcesetter to a max of 150 length
                var AttkUnitToForceSetterVec = Vector2D.create(currentCursorPos.get().x - AttackUnit.getPosition().get().x ,
                                                               currentCursorPos.get().y - AttackUnit.getPosition().get().y);
                var length = AttkUnitToForceSetterVec.len();
                if(length > 150)
                    length=150;
                else if(length < 35)
                    length=35;

                AttkUnitToForceSetterVec = AttkUnitToForceSetterVec.normalize();
                var clampedForceVec = AttackUnit.getPosition();
                clampedForceVec = clampedForceVec.add(AttkUnitToForceSetterVec.mul(length));
                
                //if(distanceToUnit<150 && distanceToUnit>35){
                    if(AngleToSet>90 && AngleToYAxis>90 ){
                        this.setPosition(Point2D.create(clampedForceVec.get().x, clampedForceVec.get().y));
                        this.getComponent("physics").setRotation( (AngleToSet+180)*0.017453292519943 );
                        //need to start/stop simulation for rotation to be updated
                        this.startsim();
                        this.stopsim();
                    }
                //}
            }
            
        },
        
        clicked: function(currentCursorPos) {
            this.isClicked = true;
            this.setSprite(1);
        },
        
        
        
        /**
         * called when button released
         */
        released: function(p) {
            this.isClicked = false;
            this.setSprite(0);
            var AttackUnit=LastPlant.getAttackUnit();
            var AttackUnitLegs=LastPlant.getAttackUnitLegs();
            var thisPos = this.getPosition();

            this.ShootDirection = thisPos.sub(AttackUnit.getPosition());
            var distanceToUnit = thisPos.dist(AttackUnit.getPosition());
            

            if(!AttackUnit.getWasShot()){
                // Start simulation of unit
                AttackUnit.startsim();
                
                //calulate force to shoot unit with
                var Shootforce = Vector2D.create (this.ShootDirection.x*12000000, this.ShootDirection.y*12000000);

                //shoot AttackUnit = apply force to unit
                AttackUnit.applyForce(Shootforce,AttackUnit.getPosition());
                AttackUnit.SetWasShot(true);
                AttackUnit.SetTimeWhenShot(Engine.worldTime);

                //Play sprite throw animation once
                AttackUnitLegs.getComponent("draw").setSprite(LastPlant.spriteLoader.getSprite("AttkUnitLegs", "Legs-throw"));
                //Reset the sprite to stand after 6(frames)*20(millisec)
                Timeout.create("wait", 120, function() {
                        AttackUnitLegs.getComponent("draw").setSprite(LastPlant.spriteLoader.getSprite("AttkUnitLegs", "Legs-stand"));
                });
                Shootforce.destroy();

            }
            
        },

        /**
         * Set the reset the position and rotation of the ForceSetter
         */
        resetPosRot: function() {
            this.setPosition(this.startPosition);
            this.getComponent("physics").setRotation(this.startRotation*0.017453292519943 );
            this.startsim();
            this.stopsim();
        },
        getWorldBox: function() {
            var pos=this.getComponent("physics").getPosition();
            var bBox = Rectangle2D.create(pos.x,pos.y,this.width,this.height);
            return bBox.offset(-bBox.getHalfWidth(), -bBox.getHalfHeight());
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