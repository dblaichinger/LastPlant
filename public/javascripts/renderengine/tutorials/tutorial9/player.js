// Load the components and engine objects
Engine.include("/components/component.transform2d.js");
Engine.include("/components/component.keyboardinput.js");
Engine.include("/components/component.boxcollider.js");
Engine.include("/components/component.sprite.js");
Engine.include("/engine/engine.object2d.js");

Engine.initObject("Player", "Object2D", function() {

   var Player = Object2D.extend({

		moveVec: null,			// The movement vector
		dead: false,			// Dead flag
		hasShields: false,	// The shields flag

      constructor: function() {
         this.base("Player");

         // Add the component to move the object
         this.add(Transform2DComponent.create("move"));
			
			// Add the component which handles keyboard input
			this.add(KeyboardInputComponent.create("input"));

			// Add the component for collisions
			this.add(BoxColliderComponent.create("collide", Tutorial9.collisionModel));

			// Set the collision flags
			this.getComponent("collide").setCollisionMask(Math2.parseBin("11"));

		   // Add the component for rendering
			var playerSprite = Tutorial9.spriteLoader.getSprite("sprites", "stand");
		   this.add(SpriteComponent.create("draw", playerSprite));

			// Add the shield sprite
			var shieldSprite = Tutorial9.spriteLoader.getSprite("sprites", "shield");
		   this.add(SpriteComponent.create("shield", shieldSprite));
			this.hasShields = false;
			
			// Don't draw the shield, just yet
			this.getComponent("shield").setDrawMode(RenderComponent.NO_DRAW);

         // Start at the center of the playfield
         var start = Tutorial9.getFieldBox().getCenter();
			start.sub(Point2D.create(25, 25));
			
			// Position the object
         this.setPosition(start);
			
			// Set the velocity to zero and a heading angle
			this.moveVec = Vector2D.create(0,0);
			
			// Set our bounding box so collision tests work
			this.setBoundingBox(playerSprite.getBoundingBox());
			
			// Move the player's origin to the center of the bounding box
			this.setOrigin(this.getBoundingBox().getCenter());
			
			// The player isn't dead
			this.dead = false;
			
			// Set our Z-index over everything else in the scene
			this.setZIndex(100);
      },
		
      /**
       * Update the object within the rendering context.  This calls the transform
       * components to position the object on the playfield.
       *
       * @param renderContext {RenderContext} The rendering context
       * @param time {Number} The engine time in milliseconds
       */
      update: function(renderContext, time) {
			renderContext.pushTransform();
			
			// The the "update" method of the super class
			this.base(renderContext, time);
			
			// Move the object, according to the keyboard
			this.move();
			
			renderContext.popTransform();
      },
		
		/**
		 * Callback method which is used to respond to collisions.
		 * 
		 * @param collisionObj {BaseObject} The object we've collided with
		 * @param time {Number} The time at which the collision occurred
		 * @param targetMask {Number} The collision mask for <tt>collisionObj</tt>
		 */
		onCollide: function(collisionObj, time, targetMask) {
		   if (targetMask == Math2.parseBin("10")) {
		      // Colliding with a shield powerup.  Do they already have shields?
				if (!this.hasShields) {
					// Remove the powerup and
					// turn on the shields
					collisionObj.destroy();
					this.getComponent("shield").setDrawMode(RenderComponent.DRAW);
					this.hasShields = true;
				}
				
				// This was a safe collision, so check for others... 
		      return ColliderComponent.COLLIDE_AND_CONTINUE;
		   }
			
			if (targetMask == Math2.parseBin("01")) {
			
				// Does the player have shields?
				if (this.hasShields) {
					// Colliding with a bomb - remove it
					collisionObj.destroy();

					// Turn off the shields
					this.getComponent("shield").setDrawMode(RenderComponent.NO_DRAW);
					this.hasShields = false; 
					
					// The player had shields, but maybe they are touching something else
			      return ColliderComponent.COLLIDE_AND_CONTINUE;
				} else {
					collisionObj.explode();
					
					// Deadly bomb, show the skull and crossbones
					this.setSprite("dead");
					this.dead = true;
					
					// Rotate back to zero
					this.setRotation(0);

					// Stop moving
					this.moveVec.set(Point2D.ZERO);

					return ColliderComponent.STOP;
				}
			}
			
			// No collision occurred
			return ColliderComponent.CONTINUE;
		},

		/**
		 * Callback method which is lets our object know that existing
		 * collisions have stopped.
		 * 
		 * @param collisionObj {BaseObject} The object we've collided with
		 * @param time {Number} The time at which the collision occurred
		 * @param targetMask {Number} The collision mask for <tt>collisionObj</tt>
		 */
		onCollideEnd: function(time) {
		   // Not colliding anymore
		},
		
		/**
		 * Handle a "keydown" event from the <tt>KeyboardInputComponent</tt>.  We'll use
		 * this to determine which yaw angle to apply to the player.  Also, switch the
		 * player's sprite to "walk".
		 * 
		 * @param charCode {Number} Unused
		 * @param keyCode {Number} The key which was pressed down.
		 */
		onKeyDown: function(charCode, keyCode) {
			if (this.dead) {
				// Can't move if the player is dead
				return;
			}
			
	      switch (charCode) {
	         case EventEngine.KEYCODE_LEFT_ARROW:
					this.setSprite("walk");
					this.setRotation(180);
	            this.moveVec.setX(-4);
	            break;
	         case EventEngine.KEYCODE_RIGHT_ARROW:
					this.setSprite("walk");
					this.setRotation(0);
	            this.moveVec.setX(4);
	            break;
	         case EventEngine.KEYCODE_UP_ARROW:
					this.setSprite("walk");
					this.setRotation(270);
	            this.moveVec.setY(-4);
	            break;
	         case EventEngine.KEYCODE_DOWN_ARROW:
					this.setSprite("walk");
					this.setRotation(90);
	            this.moveVec.setY(4);
	            break;
	      }
			return false;
		},
		
		/**
		 * Handle a "keyup" event from the <tt>KeyboardInputComponent</tt>.  This will
		 * also switch back to the "stand" sprite for the player.
		 * 
		 * @param charCode {Number} Unused
		 * @param keyCode {Number} The key which was released
		 */
		onKeyUp: function(charCode, keyCode) {
			if (this.dead) {
				// Can't move if the player is dead
				return;
			}

	      switch (charCode) {
	         case EventEngine.KEYCODE_LEFT_ARROW:
	         case EventEngine.KEYCODE_RIGHT_ARROW:
					this.setSprite("stand");
	            this.moveVec.setX(0);
	            break;
	         case EventEngine.KEYCODE_UP_ARROW:
	         case EventEngine.KEYCODE_DOWN_ARROW:
					this.setSprite("stand");
	            this.moveVec.setY(0);
	            break;
	      }
			return false;
		},

      /**
       * Set the sprite used to draw the component on the render component
       * @param spriteName {String} The name of the sprite
       */
		setSprite: function(spriteName) {
			this.getComponent("draw").setSprite(Tutorial9.spriteLoader.getSprite("sprites", spriteName));
		},

      /**
       * We need this for the collision model.
       * @return {Point2D}
       */
      getPosition: function() {
         return this.getComponent("move").getPosition();
      },

		/**
		 * We need this for the world bounding box calculation
		 * @return {Point2D}
		 */
		getRenderPosition: function() {
			return this.getPosition();
		},

      /**
       * Set the position of the object through transform component
       * @param point {Point2D} The position to draw the text in the playfield
       */
      setPosition: function(point) {
         this.base(point);
         this.getComponent("move").setPosition(point);
      },
		
      /**
       * Set the rotation of the object through transform component
       * @param angle {Number} The yaw angle, in degrees
       */
		setRotation: function(angle) {
			this.base(angle);
			this.getComponent("move").setRotation(angle);
		},

		/**
		 * Calculate and perform a move for our object.  We'll use
		 * the field dimensions from our playfield to determine when to
		 * "bounce".
		 */
		move: function() {
			var pos = this.getPosition();

			// Determine if we hit a "wall" of our playfield
			var fieldBox = Tutorial9.getFieldBox().get();
			if ((pos.x + this.width > fieldBox.r) || (pos.x < 0)) {
				// Stop X movement and back off
				this.moveVec.setX(0);
				if (pos.x + this.width > fieldBox.r) {
					pos.setX(fieldBox.r - this.width - 1);
				}
				if (pos.x < 0) {
					pos.setX(1);
				}
			}	
			if ((pos.y + this.height > fieldBox.b) || (pos.y < 0)) {
				// Stop Y movement and back off
				this.moveVec.setY(0);
				if (pos.y + this.height > fieldBox.b) {
					pos.setY(fieldBox.b - this.height - 1);
				}
				if (pos.y < 0) {
					pos.setY(1);
				}
			}

			pos.add(this.moveVec);
			this.setPosition(pos);
		}
		
   }, { // Static

      /**
       * Get the class name of this object
       * @return {String} The string GameObject
       */
      getClassName: function() {
         return "Player";
      }
   });

return Player;

});
