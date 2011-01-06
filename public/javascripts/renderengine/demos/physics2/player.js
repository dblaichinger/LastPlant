
/**
 * The Render Engine
 * The player object
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
 * @author: $Author: bfattori $
 * @version: $Revision: 1399 $
 *
 * Copyright (c) 2010 Brett Fattori (brettf@renderengine.com)
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
Engine.include("/components/component.wiimoteinput.js");
Engine.include("/components/component.transform2d.js");
Engine.include("/engine/engine.object2d.js");

Engine.initObject("Player", "Object2D", function() {

   /**
    * @class The player object is a simple invisible box which surrounds the
    *			 mouse pointer.  The bounding box is used to determine collisions
    *			 between the mouse pointer and a physical toy object.
    *
    * @extends Object2D
    * @constructor
    * @description Create the "player" object
    */
   var Player = Object2D.extend(/** @scope Player.prototype */{

      // The toy the cursor is currently over or null
      overToy: null,
		mouseDown: false,
		clickToy: null,

		/**
		 * @private
		 */
      constructor: function() {
         this.base("Player");

         // Add components to move and collide the player.  Movement is controlled
         // with either the mouse, or with the Wii remote
         this.add(WiimoteInputComponent.create("input"));
         this.add(Transform2DComponent.create("move"));
         this.add(ColliderComponent.create("collide", PhysicsDemo2.cModel));
         
         // The player's bounding box
         this.setBoundingBox(Rectangle2D.create(0, 0, 20, 20));
         
         // Initialize the currently selected toy to null
         this.overToy = null;
			this.clickToy = null;
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

         // Use the metrics to let us know if we're over a toy object
         Engine.addMetric("overToy", this.overToy != null ? this.overToy : "");
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
         return bBox.offset(-10, -10);
      },

      /**
       * Set, or initialize, the position of the mover component.
       * @param point {Point2D} The position where the cursor is
       */
      setPosition: function(point) {
         this.base(point);
         this.getComponent("move").setPosition(point);

         // Add a metrics value to the display for cursor position
         Engine.addMetric("cursorPos", point);
      },

      /**
       * Respond to the Wii remote position or the mouse position when not
       * using a Wii.
       * 
       * @param c {Number} The controller number
       * @param sx {Number} The screen X position
       * @param sy {Number} The screen Y position
       */
      onWiimotePosition: function(c, sx, sy) {
         if (c == 0) {
            // If controller zero, update the position
				var p = Point2D.create(sx, sy);
            this.setPosition(p);
				if (this.mouseDown && this.clickToy) {
					var force = Vector2D.create(p).sub(this.clickToy.getRootBody().getPosition()).mul(30000);
					this.clickToy.getRootBody().applyForce(force, p);
					force.destroy();
				}
				p.destroy();
         }
      },

      /**
       * Respond to the A button being pressed on the Wii remote, or any mouse
       * button being pressed or released.
       *
       * @param c {Number} The controller number
       * @param state {Boolean} <tt>true</tt> if the button is pressed, <tt>false</tt> when released
       */
      onWiimoteButtonA: function(c, state) {
         if (c == 0 && state) {
				this.mouseDown = true;
				if (this.overToy) {
					this.clickToy = this.overToy;
				}
         } else if (c == 0 && !state) {
				this.mouseDown = false;
				this.clickToy = null;
			}
      },

      /**
       * Check for collision between a toy object and the player.
       *
       * @param obj {Object2D} The object being collided with
       * @return {Number} A status value
       * @see {ColliderComponent}
       */
      onCollide: function(obj) {
         if (PhysicsActor.isInstance(obj) &&
             (this.getWorldBox().isIntersecting(obj.getWorldBox()))) {
            this.overToy = obj;
            return ColliderComponent.STOP;
         }

         this.overToy = null;
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