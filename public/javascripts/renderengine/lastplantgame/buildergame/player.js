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
Engine.include("/components/component.collider.js");
Engine.include("/components/component.mouseinput.js");
Engine.include("/components/component.transform2d.js");
Engine.include("/engine/engine.object2d.js");


Engine.initObject("Player", "Object2D", function() {

   /**
    * @class The player object is a simple invisible box which surrounds the
    *			 mouse pointer.  The bounding box is used to determine collisions
    *			 between the mouse pointer and a physical LPObject.
    *
    * @extends Object2D
    * @constructor
    * @description Create the "player" object
    */
   var Player = Object2D.extend(/** @scope Player.prototype */{

      // The LPObject the cursor is currently over or null
      overLPObject: null,
	  mouseDown: false,
   	  clickLPObject: null,

	  /**
	  * @private
	  */
      constructor: function() {
         this.base("Player");

         // Add components to move and collide the player.  
         this.add(MouseInputComponent.create("input"));
         this.add(Transform2DComponent.create("move"));
         this.add(ColliderComponent.create("collide", LastPlant.cModel));
         
         // The player's bounding box
         this.setBoundingBox(Rectangle2D.create(0, 0, 10, 10));
         
         // Initialize the currently selected LPObject to null
         this.overLPObject = null;
		 this.clickLPObject = null;
		 this.mouseDown = false;
      },

      /**
       * Update the player within the rendering context.  The player doesn't actually have
       * any shape, so this just update the position and collision model.
       *
       * @param renderContext {RenderContext} The rendering context
       * @param time {Number} The engine time in milliseconds
       */
      update: function(renderContext, time) {
         renderContext.pushTransform();
         this.base(renderContext, time);
         renderContext.popTransform();

         // Use the metrics to let us know if we're over a LPObject object
         Engine.addMetric("overLPObject", this.overLPObject != null ? this.overLPObject : "");
      },

      /**
       * Get the position of the player from the "move" component.
       * @return {Point2D} The position of the cursor
       */
      getPosition: function() {
         return this.getComponent("move").getPosition();
      },

      /**
       * Get the render position of the player
       * @return {Point2D} The rendering position of the cursor
       */
      getRenderPosition: function() {
         return this.getPosition();
      },

      /**
       * Get the box which surrounds the player in the world.
       * @return {Rectangle2D} The world bounding box
       */
      getWorldBox: function() {
         var bBox = this.base();
         //console.log("bBox von player: " + bBox);
         return bBox.offset(-5, -5);
         //return bBox.offset(-5-worldoffset, -5-worldoffset);
      },

      /**
       * Set, or initialize, the position of the mover component.
       * @param point {Point2D} The position where the cursor is
       */
      setPosition: function(point,mouseInfo) {
        //clamp position into screen coordinates
        //var clampedPosition=Point2D.create;
        if(point.get().x < 0){
            point.setX(0);
            this.onMouseUp(mouseInfo);
        }
        if(point.get().x > LastPlant.fieldWidth){
            point.setX(LastPlant.fieldWidth);
            this.onMouseUp(mouseInfo);
        }
        if(point.get().y < 0){
            point.setY(0);
            this.onMouseUp(mouseInfo);
        }
        if(point.get().y > LastPlant.fieldHeight){
            point.setY(LastPlant.fieldHeight);
            this.onMouseUp(mouseInfo);
        }
        //console.log(" clamped point: " + point);

        this.base(point);
        this.getComponent("move").setPosition(point);

        // Add a metrics value to the display for cursor position
        Engine.addMetric("cursorPos", point);
      },
      //Convert the cursor position to the canvas coordinates
      convertToWorldCoord: function(point) {
         var InsideCanvasPos=Point2D.create(point);
         //console.log(InsideCanvasPos);
         var WorldOffSet=Point2D.create(LastPlant.renderContext.jQ().offset().left, LastPlant.renderContext.jQ().offset().top);
         //console.log("offset x: " + LastPlant.renderContext.jQ().offset().left );
         //console.log("offset y: " + LastPlant.renderContext.jQ().offset().top );
         //var WorldOffSet=Point2D.create(0, 0);
         InsideCanvasPos.sub(WorldOffSet);
         return InsideCanvasPos;
      },
      
      /**
       * Respond to the Mouse position 
       * 
       * @param mouseInfo {object } has position, lastpos, button
       */
      onMouseMove: function(mouseInfo) {
        //if(mouseInfo.position!=mouseInfo.lastPosition)
            //console.log("mouse moved");
        //console.log("mouseInfo.position: " + mouseInfo.position);
        //console.log("getRenderPosition: " + this.getRenderPosition());
        //console.log("mouseInfo.position: " + mouseInfo.position);
        //console.log("mouseInfo.lastPosition: " + mouseInfo.lastPosition);
        //if(mouseInfo.position!=mouseInfo.lastPosition){
        this.setPosition(this.convertToWorldCoord(mouseInfo.position),mouseInfo);
            //console.log("getPosition: " + this.getPosition());
        //}
        //if (this.mousedown && this.clickLPObject) {
            
            //this.clickLPObject.clicked(mouseInfo.position);
        //}
        //console.log("getPosition: " + this.getPosition());
      },

      onMouseDown: function(mouseInfo) {
        //console.log(mouseInfo);
        //console.log("1 mouseInfo.position: " + mouseInfo.position);
        
        //console.log("2 mouseInfo.position: " + mouseInfo.position);
        this.mouseDown = true;
        if (this.overLPObject) {
            this.clickLPObject = this.overLPObject;
            this.clickLPObject.clicked(this.convertToWorldCoord(mouseInfo.position));
        }
      },
      
      onMouseUp: function(mouseInfo) {
        //console.log(mouseInfo);
        this.mouseDown = false;
        if(this.clickLPObject != null){
            this.clickLPObject.released(this.convertToWorldCoord(mouseInfo.position));
        }
        this.clickLPObject = null;

      },      

      /**
       * Check for collision between a LPObject object and the player.
       *
       * @param obj {Object2D} The object being collided with
       * @return {Number} A status value
       * @see {ColliderComponent}
       */
      onCollide: function(obj) {
         if (LPObject.isInstance(obj) &&
            (this.getWorldBox().isIntersecting(obj.getWorldBox()))) {
            this.overLPObject = obj;
            return ColliderComponent.STOP;
         }

         this.overLPObject = null;
         return ColliderComponent.CONTINUE;
      }

   }, /** @scope Player.prototype */{ // Static

      /**
       * Get the class name of this object
       * @return {String} The string <tt>Player</tt>
       */
      getClassName: function() {
         return "Player";
      }
   });

   return Player;

});