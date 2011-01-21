
/**
 * The Render Engine
 * A physically animated "toy"
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
 * @author: $Author: bfattori $
 * @version: $Revision: 1400 $
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
Engine.include("/components/component.sprite.js");
Engine.include("/components/component.collider.js");
Engine.include("/objects/object.physicsactor.js");

Engine.initObject("Toy", "PhysicsActor", function() {

   /**
    * @class Base class for toys which can be added to the playfield.  Each toy
    *			 which extends from this must implement {@link #createPhysicalBody}
    *			 to generate the physical representation of the toy.
    *
    * @param spriteResource {String} The resource where the two sprites are found
    * @param spriteName {String} The name of the sprite, in the resource, that represents the default toy image
    * @param spriteOverName {String} The name of the sprite, in the resource, for when the mouse is over the toy
    * @extends PhysicsActor
    * @description Base class for a physical toy object
    * @constructor
    */
   var Toy = PhysicsActor.extend(/** @scope Toy.prototype */{

      sprites: null,
		renderScale: 1,

		/**
		 * @private
		 */
      constructor: function(spriteResource, spriteName, spriteOverName) {
         this.base("PhysicsToy");
         this.sprite = null;
			this.renderScale = (Math2.random() * 1) + 0.8;
			
         // Add components to draw and collide with the player
         this.add(ColliderComponent.create("collide", PhysicsDemo.cModel));
         
			// Create the physical body object which will move the toy object
			this.createPhysicalBody("physics", this.renderScale);
			this.getComponent("physics").setScale(this.renderScale);
			this.getComponent("physics").setRenderComponent(SpriteComponent.create("draw"));

         // The sprites
         this.sprites = [];
         this.sprites.push(PhysicsDemo.spriteLoader.getSprite(spriteResource, spriteName));
         this.sprites.push(PhysicsDemo.spriteLoader.getSprite(spriteResource, spriteOverName));
         this.setSprite(0);

			// Set the starting position of the toy
         this.setPosition(Point2D.create(25, 15));
      },

		/**
		 * [ABSTRACT] Create the physical body component and assign it to the
		 * toy.
		 *
		 * @param componentName {String} The name assigned to the component by this class.
		 * @param scale {Number} A scalar scaling value for the toy
		 */
		createPhysicalBody: function(componentName, scale) {
		},
		

      /**
       * Set the sprite to use with the "draw" component.
       * @param spriteIdx {Number} The sprite index
       */
      setSprite: function(spriteIdx) {
         var sprite = this.sprites[spriteIdx];
         this.setBoundingBox(sprite.getBoundingBox());
         this.getComponent("physics").getRenderComponent().setSprite(sprite);
      },
		
      /**
       * Set, or initialize, the position of the "physics" component
       *
       * @param point {Point2D} The position to draw the toy in the playfield
       */
      setPosition: function(point) {
         this.base(point);
         this.getComponent("physics").setPosition(point);
      },

		/**
		 * Apply a force to the physical body.
		 *
		 * @param amt {Vector2D} The force vector (direction of the force) to apply to the toy.
		 * @param loc {Point2D} The location at which the force is applied to the toy.
		 */
		applyForce: function(amt, loc) {
			this.getComponent("physics").applyForce(amt, loc);
		},

      /**
       * If the toy was clicked on, determine a force vector and apply it
       * to the toy so it can be dragged around the playfield.
       *
       * @param p {Point2D} The position where the mouse currently resides
       */
      clicked: function(p) {
			var force = Vector2D.create(p).sub(this.getPosition()).mul(20000);
         this.applyForce(force, p);
			force.destroy();
      },
		
		/**
		 * Currently unused
		 */
		released: function() {
		},

      /**
       * Determine if the toy was touched by the player and, if so,
       * change the sprite which represents it.
       */
      onCollide: function(obj) {
         if (Player.isInstance(obj) &&
             (this.getWorldBox().isIntersecting(obj.getWorldBox()))) {
            this.setSprite(1);
            return ColliderComponent.STOP;
         }
         
         this.setSprite(0);
         return ColliderComponent.CONTINUE;
      }

   }, /** @scope Toy.prototype */{ // Static

      /**
       * Get the class name of this object
       * @return {String} The string <tt>Toy</tt>
       */
      getClassName: function() {
         return "Toy";
      }
   });

return Toy;

});