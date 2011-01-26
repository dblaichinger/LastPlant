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
        isClicked: null,
        wasOverLeftBorder: null,
        rotateDirection: null,

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
            this.isClicked=false;
            this.wasOverLeftBorder=false;
            this.rotateDirection=0;
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
			this.getComponent(componentName).setFriction(0.7);
			this.getComponent(componentName).setRestitution(0);
			
            if(this.LPOType=="Block-long")
                this.getComponent(componentName).setDensity(20);
            else if(this.LPOType=="Block-square")
                this.getComponent(componentName).setDensity(10);
		},
        //called every frame
        update: function(renderContext, time){
            renderContext.pushTransform();
            this.base(renderContext, time);
            renderContext.popTransform()
            
            if(this.wasOverLeftBorder==false)
                if(this.getPosition().get().x > 162)
                    this.wasOverLeftBorder=true;

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
            
        },
        setRotateDirection: function(direction) {
            this.rotateDirection=direction;
        },
        
        rotateCW: function(p) {
            this.getComponent("physics").setRotation( this.getRot()*0.017453292519943+0.034906585039887 );
            this.startsim();
            this.stopsim();
        },
        rotateCCW: function(p) {
            this.getComponent("physics").setRotation( this.getRot()*0.017453292519943-0.034906585039887 );
            this.startsim();
            this.stopsim();
        },
        
		clicked: function(cursorPosition) {
            if(this.isPlaced==false){
                this.isClicked=true;
                // this.startsim();
                // this.setPosition(cursorPosition);                                     
                // this.stopsim();
            }
            
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