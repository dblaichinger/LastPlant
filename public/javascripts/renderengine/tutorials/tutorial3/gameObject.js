// Load the components and engine objects
Engine.include("/components/component.transform2d.js");
Engine.include("/components/component.keyboardinput.js");
Engine.include("/engine/engine.object2d.js");

Engine.initObject("GameObject", "Object2D", function() {

   var GameObject = Object2D.extend({

		// The width of the object
		width: 50,				// The width of the object
		height: 50,				// The height of the object
		color: "#ff0000",		// The color of the object
		moveVec: null,			// The movement vector
		shape: null,			// Our object's shape

      constructor: function() {
         this.base("GameObject");

         // Add the component to move the object
         this.add(Transform2DComponent.create("move"));
			
			// Add the component which handles keyboard input
			this.add(KeyboardInputComponent.create("input"));

         // Start at the center of the playfield
         var start = Tutorial3.getFieldBox().getCenter();
			start.sub(Point2D.create(25, 25));
			
			// Set our object's shape
			this.shape = Rectangle2D.create(0, 0, this.width, this.height);
			
         // Position the object
         this.setPosition(start);
			
			// Set the velocity to zero
			this.moveVec = Vector2D.create(0,0);
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
			
			// Draw the object on the render context
			this.draw(renderContext);

			renderContext.popTransform();
      },
		
		/**
		 * Handle a "keydown" event from the <tt>KeyboardInputComponent</tt>.
		 * @param charCode {Number} Unused
		 * @param keyCode {Number} The key which was pressed down.
		 */
		onKeyDown: function(charCode, keyCode) {
	      switch (charCode) {
	         case EventEngine.KEYCODE_LEFT_ARROW:
	            this.moveVec.setX(-4);
	            break;
	         case EventEngine.KEYCODE_RIGHT_ARROW:
	            this.moveVec.setX(4);
	            break;
	         case EventEngine.KEYCODE_UP_ARROW:
	            this.moveVec.setY(-4);
	            break;
	         case EventEngine.KEYCODE_DOWN_ARROW:
	            this.moveVec.setY(4);
	            break;
	      }
			return false;
		},
		
		/**
		 * Handle a "keyup" event from the <tt>KeyboardInputComponent</tt>.
		 * @param charCode {Number} Unused
		 * @param keyCode {Number} The key which was released
		 */
		onKeyUp: function(charCode, keyCode) {
	      switch (charCode) {
	         case EventEngine.KEYCODE_LEFT_ARROW:
	         case EventEngine.KEYCODE_RIGHT_ARROW:
	            this.moveVec.setX(0);
	            break;
	         case EventEngine.KEYCODE_UP_ARROW:
	         case EventEngine.KEYCODE_DOWN_ARROW:
	            this.moveVec.setY(0);
	            break;
	      }
			return false;
		},

      /**
       * Get the position of the object from the transform component.
       * @return {Point2D}
       */
      getPosition: function() {
         return this.getComponent("move").getPosition();
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
		 * Calculate and perform a move for our object.  We'll use
		 * the field dimensions from our playfield to determine when to
		 * "bounce".
		 */
		move: function() {
			var pos = this.getPosition();

			// Determine if we hit a "wall" of our playfield
			var fieldBox = Tutorial3.getFieldBox().get();
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
		},

		/**
		 * Draw our game object onto the specified render context.
		 * @param renderContext {RenderContext} The context to draw onto
		 */
		draw: function(renderContext) {
			// Generate a rectangle to represent our object
			var pos = this.getPosition();
			
			// Set the color to draw with
			renderContext.setFillStyle(this.color);
         renderContext.drawFilledRectangle(this.shape);
		}

   }, { // Static

      /**
       * Get the class name of this object
       * @return {String} The string MyObject
       */
      getClassName: function() {
         return "GameObject";
      }
   });

return GameObject;

});
