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
        isClicked: null,
        wasOverLeftBorder: null,
        canBeSaved: true,
        
		/**
		 * @private
		 */
		constructor: function() {
			this.base("Plant", "Plant", "PlantOver");
            this.isPlaced=false;
            this.LPOType="Plant";
            this.canBeSaved=true;
            this.isClicked=false;
            this.wasOverLeftBorder=false;
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
			
			// Set the friction, bounciness and density of the Plant
            // Mass depends on objects size
			this.getComponent(componentName).setFriction(0.3);
			this.getComponent(componentName).setRestitution(0);
			this.getComponent(componentName).setDensity(8);
		},
		
        //called every frame
        update: function(renderContext, time){
            renderContext.pushTransform();
            this.base(renderContext, time);
            renderContext.popTransform();
                        if(this.wasOverLeftBorder==false)
                if(this.getPosition().get().x > 162)
                    this.wasOverLeftBorder=true;
            // Don't let Plant out of the Canvas
            if(this.isClicked==true){
                var cursorPosition = LastPlant.getPlayer().getPosition();
                var newBlockPos= cursorPosition;

                if(cursorPosition.get().x > LastPlant.fieldWidth-140)
                    newBlockPos.setX(LastPlant.fieldWidth-140);

                if(this.wasOverLeftBorder==true){
                    if(cursorPosition.get().x < 162)
                        newBlockPos.setX(162);
                }else{
                    if(cursorPosition.get().x < 5){
                        newBlockPos.setX(5);
                    }
                }
                    
                if(cursorPosition.get().y < 5)
                    newBlockPos.setY(5);
                if(cursorPosition.get().y > LastPlant.fieldHeight-5)
                    newBlockPos.setY(LastPlant.fieldHeight);
                
                //this.startsim();
                this.setPosition(newBlockPos); 
                //this.stopsim();
            }
            if(this.rotateDirection==1)
                this.rotateCW();
            else if(this.rotateDirection==2)
                this.rotateCCW();
                
            if(this.isPlaced==true && this.getComponent("physics").isSleeping()==true && this.canBeSaved==true){
                this.canBeSaved=false;
                Timeout.create("SaveTimer", 1000, function() {
                    LastPlant.gameOver();
                    LastPlant.saveConstruct();
                });
            }
		},
        
		clicked: function(p) {
            if(this.isPlaced==false){
                this.isClicked=true;
                // this.startsim();
                // this.setPosition(cursorPosition);                                     
                // this.stopsim();
            }
            /*if(this.isPlaced==false){
                this.stopsim();
                this.setPosition(p);
            }*/
        },
            
        /**
         * called when button released
         */
        released: function(p) {
            if(this.isPlaced==false){
                this.isPlaced=true;
                this.isClicked=false;
                this.remove(this.Collider);
                this.setSprite(0);
                this.startsim();
                LastPlant.showPlantWasSetText();
                // Backup timer if the safe function isnt called via update
                /*if(this.canBeSaved==true){
                    this.canBeSaved=false;
                    Timeout.create("BackupSaveTimer", 10000, function() {
                        console.log("inside BackupSaveTimer");
                        LastPlant.gameOver();
                        LastPlant.saveConstruct();
                    });
                }*/
                
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
        getWorldBox: function() {
            var pos=this.getComponent("physics").getPosition();
            var bBox = Rectangle2D.create(pos.x,pos.y,21,66);
            return bBox.offset(-bBox.getHalfWidth(), -bBox.getHalfHeight());;
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