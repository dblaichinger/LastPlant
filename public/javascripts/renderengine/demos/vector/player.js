
/**
 * The Render Engine
 * Example Game: Spaceroids - an Asteroids clone
 *
 * The player object
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
 * @author: $Author: bfattori $
 * @version: $Revision: 1449 $
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

Engine.include("/components/component.mover2d.js");
Engine.include("/components/component.vector2d.js");
Engine.include("/components/component.keyboardinput.js");
Engine.include("/components/component.collider.js");
Engine.include("/engine/engine.object2d.js");
Engine.include("/engine/engine.timers.js");
Engine.include("/engine/engine.container.js");

Engine.initObject("SpaceroidsPlayer", "Object2D", function() {

/**
 * @class The player object.  Creates the player and assigns the
 *        components which handle collision, drawing, drawing the thrust
 *        and moving the object.
 */
var SpaceroidsPlayer = Object2D.extend({

   size: 4,
   field: null,
   rotDir: 0,
   thrusting: false,
   bullets: 0,
   tip: null,
   players: 3,
   alive: false,
   playerShape: null,
   nukes: null,
   nuking: null,
   pBox: null,
   
   rec: false,

   constructor: function() {
      this.base("Player");
      this.rec = false;

      this.field = Spaceroids;

      // Add components to move and draw the player
		this.add(KeyboardInputComponent.create("input"));

      if (Spaceroids.rec) {
         this.getComponent("input").startRecording();
      }


      this.add(Mover2DComponent.create("move"));
      this.add(Vector2DComponent.create("draw"));
      this.add(Vector2DComponent.create("thrust"));
      this.add(ColliderComponent.create("collider", this.field.collisionModel));
		this.getComponent("collider").setCollisionMask(Math2.parseBin("010"));

      this.tip = Point2D.create(0, -1);
      this.players--;

      this.alive = true;
      this.rotDir = 0;
      this.thrusting = false;
      this.getComponent("move").setCheckRestState(false);
      this.getComponent("move").setCheckLag(false);
      this.nukes = 0;	// Have to earn your nukes
      this.nuking = false;
      this.pBox = Rectangle2D.create(0,0,1,1);
   },

   destroy: function() {
   	Spaceroids.collisionModel.removeObject(this);
      this.tip.destroy();
      this.pBox.destroy();
      this.base();
   },

   release: function() {
      this.base();
      this.size = 4;
      this.rotDir = 0;
      this.thrusting = false;
      this.bullets = 0;
      this.tip = null;
      this.players = 3;
      this.alive = false;
      this.playerShape = null;
      this.nukes = null;
      this.nuking = null;
      this.pBox = null;
   },

   /**
    * Update the player within the rendering context.  This draws
    * the shape to the context, after updating the transform of the
    * object.  If the player is thrusting, draw the thrust flame
    * under the ship.
    *
    * @param renderContext {RenderContext} The rendering context
    * @param time {Number} The engine time in milliseconds
    */
   update: function(renderContext, time) {
      var c_mover = this.getComponent("move");
      var p = Point2D.create(c_mover.getPosition());
      c_mover.setPosition(this.field.wrap(p, this.getBoundingBox()));
      c_mover.setRotation(c_mover.getRotation() + this.rotDir);
      p.destroy();

      if (this.thrusting)
      {
         var r = c_mover.getRotation();
         var dir = Math2D.getDirectionVector(Point2D.ZERO, this.tip, r);

         c_mover.setAcceleration(dir.mul(0.3));

         // Particle trail
			var inv = Point2D.create(this.getPosition()).add(dir.neg().mul(1.5));
			var colr = SpaceroidsPlayer.TRAIL_COLORS[Math.floor(Math2.random() * 3)];
			this.field.pEngine.addParticle(TrailParticle.create(inv, this.getRotation(), 20, colr, 5000));
			inv.destroy();
         dir.destroy();
      } else {
         c_mover.setAcceleration(Point2D.ZERO);
      }

      renderContext.pushTransform();
      this.base(renderContext, time);
      renderContext.popTransform();

      // Debug the collision node
      if (Engine.getDebugMode() && this.getComponent("collider").getSpatialNode())
      {
         renderContext.setLineStyle("red");
         renderContext.drawRectangle(this.getComponent("collider").getSpatialNode().getRect());
      }

      // Draw the remaining lives
      renderContext.setLineStyle("white");
      var posX = 170;
      for (var l = 0; l <= this.players; l++) {
         renderContext.pushTransform();
         renderContext.setScale(0.7);
         var dp = Point2D.create(posX, 60);
         renderContext.setPosition(dp);
         renderContext.drawPolygon(this.playerShape);
         renderContext.popTransform();
         posX -= 20;
         dp.destroy();
      }
      
      // If they have their nukes, draw them too
      if (this.nukes > 0) {
			renderContext.pushTransform();
			renderContext.setLineStyle("yellow");
			var dr = Rectangle2D.create(70, 35, 6, 6);
			for (var n = 0; n < this.nukes; n++) {
				renderContext.drawRectangle(dr);
				dr.offset(-8, 0);
			}
			renderContext.popTransform();
			dr.destroy();
		}
   },

   /**
    * Get the position of the ship from the mover component.
    * @type Point2D
    */
   getPosition: function() {
      return this.getComponent("move").getPosition();
   },

   getRenderPosition: function() {
      return this.getComponent("move").getRenderPosition();
   },

   /**
    * Get the last position the ship was at before the current move.
    * @type Point2D
    */
   getLastPosition: function() {
      return this.getComponent("move").getLastPosition();
   },

   /**
    * Set, or initialize, the position of the mover component
    *
    * @param point {Point2D} The position to draw the ship in the playfield
    */
   setPosition: function(point) {
      this.base(point);
      this.getComponent("move").setPosition(point);
   },

   /**
    * Get the rotation of the ship from the mover component.
    * @type Number
    */
   getRotation: function() {
      return this.getComponent("move").getRotation();
   },

   /**
    * Set the rotation of the ship on the mover component.
    *
    * @param angle {Number} The rotation angle of the ship
    */
   setRotation: function(angle) {
      this.base(angle);
      this.getComponent("move").setRotation(angle);
   },

   getScale: function() {
      return this.getComponent("move").getScale();
   },

   setScale: function(scale) {
      this.base(scale);
      this.getComponent("move").setScale(scale);
   },

   /**
    * Set up the player object on the playfield.  The width and
    * heigh of the playfield are used to determine the center point
    * where the player starts.
    *
    * @param pWidth {Number} The width of the playfield in pixels
    * @param pHeight {Number} The height of the playfield in pixels
    */
   setup: function(pWidth, pHeight) {

      // Playfield bounding box for quick checks
      this.pBox.set(0, 0, pWidth, pHeight);

      // Randomize the position and velocity
      var c_mover = this.getComponent("move");
      var c_draw = this.getComponent("draw");
      var c_thrust = this.getComponent("thrust");

      // The player shapes
      var shape = SpaceroidsPlayer.points;

      // Scale the shape
      var s = [];
      for (var p = 0; p < shape.length; p++)
      {
         var pt = Point2D.create(shape[p][0], shape[p][1]);
         pt.mul(this.size);
         s.push(pt);
      }

      // Assign the shape to the vector component
      c_draw.setPoints(s);
      c_draw.setLineStyle("white");

      // Save the shape so we can draw lives remaining
      this.playerShape = s;

      var thrust = SpaceroidsPlayer.thrust;
      s = [];
      for (var p = 0; p < thrust.length; p++)
      {
         var pt = Point2D.create(thrust[p][0], thrust[p][1]);
         pt.mul(this.size);
         s.push(pt);
      }
      c_thrust.setPoints(s);
      c_thrust.setLineStyle("white");
      c_thrust.setClosed(false);
      c_thrust.setDrawMode(RenderComponent.NO_DRAW);

      // Put us in the middle of the playfield
      c_mover.setPosition( this.pBox.getCenter() );
      c_mover.setVelocityDecay(0.03);
   },

   /**
    * Called when the player shoots a bullet to create a bullet
    * in the playfield and keep track of the active number of bullets.
    */
   shoot: function() {
      var b = SpaceroidsBullet.create(this);
      this.getRenderContext().add(b);
      this.bullets++;
      this.field.soundLoader.get("shoot").play({volume: 15});
   },

   /**
    * Called when a bullet collides with another object or leaves
    * the playfield so the player can fire more bullets.
    */
   removeBullet: function() {
      // Clean up
      this.bullets--;
   },

   /**
    * Called after a player has been killed.  If the node where the player
    * was last located does not contain any objects, the player will respawn.
    * Otherwise, the routine will wait until the area is clear to respawn
    * the player.
    */
   respawn: function() {
      // Are there rocks in our area?
      if (this.getComponent("collider").getSpatialNode())
      {
         if (this.getComponent("collider").getSpatialNode().getObjects().size() > 1)
         {
            var pl = this;
            OneShotTimeout.create("respawn", 250, function() { pl.respawn(); });
            return;
         }
      }

      // Nope, respawn
      this.getComponent("draw").setDrawMode(RenderComponent.DRAW);
      this.alive = true;
   },

   /**
    * Returns the state of the player object.
    * @type Boolean
    */
   isAlive: function() {
      return this.alive;
   },

   /**
    * Kills the player, creating the particle explosion and removing a
    * life from the extra lives.  Afterwards, it determines if the
    * player can respawn (any lives left) and either calls the
    * respawn method or signals that the game is over.
    */
   kill: function() {
      this.alive = false;

      this.getComponent("draw").setDrawMode(RenderComponent.NO_DRAW);
      this.getComponent("thrust").setDrawMode(RenderComponent.NO_DRAW);
      this.field.soundLoader.get("thrust").stop();

      // Make some particles
      var p = Container.create();
      for (var x = 0; x < SpaceroidsPlayer.KILL_PARTICLES; x++)
      {
			p.add(TrailParticle.create(this.getPosition(), this.getRotation(), 45, "#ffffaa", 2000));
         p.add(SimpleParticle.create(this.getPosition(), 3000));
      }
      this.field.pEngine.addParticles(p);

      this.getComponent("move").setVelocity(Point2D.ZERO);
      this.getComponent("move").setPosition(this.getRenderContext().getBoundingBox().getCenter());
      this.getComponent("move").setRotation(0);
      this.rotDir = 0;
      this.thrusting = false;

      this.field.soundLoader.get("death").play({volume: 80});

      // Remove one of the players
      if (this.players-- > 0)
      {
         // Set a timer to spawn another player
         var pl = this;
         OneShotTimeout.create("respawn", 3000, function() { pl.respawn(); });
      }
      else
      {
         this.field.gameOver();
      }

   },

   /**
    * Randomly jump the player somewhere when they get into a tight spot.
    * The point is NOT guaranteed to be free of a collision.
    */
   hyperSpace: function() {

      if (this.hyperjump) {
         return;
      }

      // Hide the player
      this.alive = false;
      this.getComponent("thrust").setDrawMode(RenderComponent.NO_DRAW);
      this.field.soundLoader.get("thrust").stop();
      this.thrusting = false;
      this.hyperjump = true;

      var self = this;
		OneShotTrigger.create("hyper", 250, function() {
			self.getComponent("draw").setDrawMode(RenderComponent.NO_DRAW);
		}, 10, function() {
			self.setScale(self.getScale() - 0.09);
		});

      // Give it some time and move the player somewhere random
      OneShotTimeout.create("hyperspace", 800, function() {
         self.getComponent("move").setVelocity(Point2D.ZERO);
         var randPt = Math2D.randomPoint(self.getRenderContext().getBoundingBox());
         self.getComponent("move").setPosition(randPt);
         self.setScale(1);
         self.getComponent("draw").setDrawMode(RenderComponent.DRAW);
         self.alive = true;
         self.hyperjump = false;
         randPt.destroy();
      });
   },
   
   /**
    * Returns true if the player has initiated their nuke
    */
   isNuking: function() {
      return this.nuking;
   },
   
   /**
    * Nuke everything on the screen, causing any rocks to split if they
    * are above the smallest size.
    */
   nuke: function() {
      if (this.nukes-- <= 0 || this.nuking) {
         return;
      }

      // Add a shield of protection around the player and
      // cause the nearby rocks to gravitate toward the player
      this.nuking = true;

      // Get all of the asteroids and adjust their direction
      // So they are pulled toward the player gradually
      var self = this;

      // Make some particles for the effect
      var t = MultiTimeout.create("particles", 3, 280, function(rep) {
         var n = Container.create();
         for (var x = 0; x < 60; x++)
         {
            n.add(TrailParticle.create(self.getPosition(), self.getRotation(), 350, SpaceroidsPlayer.NUKE_COLORS[rep], 1500));
         }
         Spaceroids.pEngine.addParticles(n);
      });

      var t = Timeout.create("nukerocks", 850, function() {
         this.destroy();

         var rocks = Spaceroids.collisionModel.getObjectsOfType(SpaceroidsRock);
         rocks.forEach(function(r) {
            r.kill();
         });
			rocks.destroy();

         self.nuking = false;
      });

   },

   /**
    * Called by the keyboard input component to handle a key down event.
    *
    * @param event {Event} The event object
    */
   onKeyDown: function(charCode, keyCode, ctrlKey, altKey, shiftKey, event) {
      if (!this.alive)
      {
         return;
      }

      if (event.keyCode == EventEngine.keyCodeForChar("a")) {
         this.hyperSpace();
      }
      
      if (event.keyCode == EventEngine.keyCodeForChar("z")) {
         if (this.bullets < 5) {
            this.shoot();
         }
      }
      
      switch (event.keyCode) {
         case EventEngine.KEYCODE_LEFT_ARROW:
            this.rotDir = -5;
            break;
         case EventEngine.KEYCODE_RIGHT_ARROW:
            this.rotDir = 5;
            break;
         case EventEngine.KEYCODE_UP_ARROW:
            this.getComponent("thrust").setDrawMode(RenderComponent.DRAW);
            if (!this.thrusting) {
               this.field.soundLoader.get("thrust").play({volume: 30});
            }
            this.thrusting = true;
            break;
         case EventEngine.KEYCODE_ENTER:
				this.nuke();
            break;
      }
      
      return false;
   },

   /**
    * Called by the keyboard input component to handle a key up event.
    *
    * @param event {Event} The event object
    */
   onKeyUp: function(charCode, keyCode, ctrlKey, altKey, shiftKey, event) {
      if (!this.alive)
      {
         return;
      }

      switch (event.keyCode) {
         case EventEngine.KEYCODE_LEFT_ARROW:
         case EventEngine.KEYCODE_RIGHT_ARROW:
            this.rotDir = 0;
            break;
         case EventEngine.KEYCODE_UP_ARROW:
            this.getComponent("thrust").setDrawMode(RenderComponent.NO_DRAW);
            this.thrusting = false;
            this.field.soundLoader.get("thrust").stop();
            break;

      }
      
      return false;
   },

   /*
    * WiiMote support -------------------------------------------------------------------------------------
    */

   onWiimoteLeft: function(controller, pressed) {
      this.rotDir = pressed ? -10 : 0;;
   },

   onWiimoteRight: function(controller, pressed) {
      this.rotDir = pressed ? 10 : 0;;
   },

   onWiimoteUp: function(controller, pressed) {
      this.getComponent("thrust").setDrawMode(pressed ? RenderComponent.DRAW : RenderComponent.NO_DRAW);
      this.thrusting = pressed;
      if (pressed) {
         this.field.soundLoader.get("thrust").play({volume: 30});
      } else {
         this.field.soundLoader.get("thrust").stop();
      }
   },

   onWiimoteButtonB: function(controller, pressed) {
      if (pressed && this.bullets < 5) {
         this.shoot();
      }
   }

   /*
    * WiiMote support -------------------------------------------------------------------------------------
    */


}, { // Static

   /**
    * Get the class name of this object
    *
    * @type String
    */
   getClassName: function() {
      return "SpaceroidsPlayer";
   },

   /** The player shape
    * @private
    */
   points: [ [-2,  2], [0, -3], [ 2,  2], [ 0, 1] ],

   /** The player's thrust shape
    * @private
    */
   thrust: [ [-1,  2], [0,  3], [ 1,  2] ],


   TRAIL_COLORS: ["red", "orange", "yellow", "white", "lime"],
   NUKE_COLORS: ["#1111ff", "#8833ff", "#ffff00"],
   KILL_PARTICLES: 40
   
});

return SpaceroidsPlayer;

});