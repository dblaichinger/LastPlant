/**
 * LastPlant JS Game
 * Michael Webersdorfer 
 * 
 *
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

// Load all required engine components
Engine.include("/rendercontexts/context.canvascontext.js");
Engine.include("/rendercontexts/context.htmldivcontext.js");
Engine.include("/resourceloaders/loader.sprite.js");
Engine.include("/spatial/container.spatialgrid.js");
Engine.include("/engine/engine.timers.js");
Engine.include("/physics/physics.simulation.js")

Engine.include("/physics/collision/shapes/b2BoxDef.js");

// Load game objects
Game.load("/player.js");
Game.load("/toy.js");
Game.load("/beachball.js");
Game.load("/crate.js");
Game.load("/forcesetter.js");

Engine.initObject("PhysicsDemo", "Game", function(){

   /**
    * @class A physics demonstration to show off Box2D-JS integration.  Creates
    *			 a set of "toys" and drops them into the simulation.  The "player"
    *			 can drag objects around and watch them interact.
    *
    * @extends Game
    */
   var PhysicsDemo = Game.extend({
   
      constructor: null,
      
      // The rendering context
      renderContext: null,
      
      // Engine frames per second
      engineFPS: 60,
      
      // The play field
      fieldBox: null,
      fieldWidth: 800,
      fieldHeight: 400,

      // Sprite resource loader
      spriteLoader: null,
      
      // The collision model
      cModel: null,
      
      // the attacking unit
      AttackUnit: null,
      
      
      // The physical world simulation
      simulation: null,
      
      /**
       * Called to set up the game, download any resources, and initialize
       * the game to its running state.
       */
      setup: function(){
         // Set the FPS of the game
         Engine.setFPS(this.engineFPS);
         
         this.spriteLoader = SpriteLoader.create();
         
         // Load the sprites
         this.spriteLoader.load("beachball", this.getFilePath("resources/beachball.sprite"));
         this.spriteLoader.load("crate", this.getFilePath("resources/block.sprite"));
         this.spriteLoader.load("gui", this.getFilePath("resources/gui.sprite"));
         
         // Don't start until all of the resources are loaded
         Timeout.create("wait", 250, function() {
				if (PhysicsDemo.spriteLoader.isReady()) {
						this.destroy();
						PhysicsDemo.run();
				}
				else {
					// Continue waiting
					this.restart();
				}
         });
      },
      
      /**
       * Called when a game is being shut down to allow it to clean up
       * any objects, remove event handlers, destroy the rendering context, etc.
       */
      teardown: function(){
         this.fieldBox.destroy();
         this.renderContext.destroy();
      },
      
      /**
       * Run the game
       * @private
       */
      run: function(){
         // Set up the playfield dimensions
         this.fieldWidth = 800;
	     this.fieldHeight = 400;
         this.fieldBox = Rectangle2D.create(0, 0, this.fieldWidth, this.fieldHeight);
         
         // Create the game context
	     this.renderContext = CanvasContext.create("Playfield", this.fieldWidth, this.fieldHeight);
         this.renderContext.setBackgroundColor("#FFFFFF");

		 // Set up the physics simulation
         this.simulation = Simulation.create("simulation", this.fieldBox);
		 this.simulation.setIntegrations(3);
         this.setupWorld();
         
         // Add the simulation to the scene graph so the physical
         // world is stepped (updated) in sync with each frame generated
         this.renderContext.add(this.simulation);

         // Draw an outline around the context
         this.renderContext.jQ().css({
            border: "1px solid red",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0});

		 // Add the game context to the scene graph
         Engine.getDefaultContext().add(this.renderContext);

         // Create the collision model with 8x8 divisions
         this.cModel = SpatialGrid.create(this.fieldWidth, this.fieldHeight, 8);

         // Add some toys to play around with
         /*MultiTimeout.create("ballmaker", 2, 150, function() {
              PhysicsDemo.createToy(BeachBall.create());
         });*/
         
         /*MultiTimeout.create("boxmaker", 1, 150, function() {
              PhysicsDemo.createToy(Crate.create(),0);
         });*/
         
         
         PhysicsDemo.createToy(BeachBall.create(),0);
         PhysicsDemo.createToy(Crate.create(),1);
         PhysicsDemo.createToy(Crate.create(),2);
         PhysicsDemo.createToy(Crate.create(),3);

         
         var forcesetter = ForceSetter.create();
         forcesetter.setPosition(Point2D.create(100, 320));
         forcesetter.setSimulation(this.simulation);
         //console.log("rotation beim createn 1: " + forcesetter.getRotation());
         this.renderContext.add(forcesetter);
         forcesetter.simulate();
         forcesetter.stopsim();
         
         // Add the player object
         var player = Player.create();
         this.getRenderContext().add(player);
      },
      
      /**
       * Set up the physical world.  Creates the bounds of the world by establishing
       * walls and a floor.  The actual objects have no visual respresentation but they
       * will exist in the simulation and prevent the toys from leaving the playfield.
       * @private
       */
      setupWorld: function() {
          	var pos = Point2D.create(0,0), ext = Point2D.create(0,0);
          	
          	// Ground
          	pos.set(0, this.fieldHeight+50);
          	ext.set(2000, 50);
          	this.simulation.addSimpleBoxBody(pos, ext, {
          		restitution: 0.2,
          		friction: 3.0
          	});
			
  			// Left wall
  			pos.set(-10, 100);
  			ext.set(20, this.fieldBox.get().h + 1500);
  			this.simulation.addSimpleBoxBody(pos, ext);
  
  			// Right wall
  			pos.set(this.fieldBox.get().w, 100);
  			ext.set(20, this.fieldBox.get().h + 1500);
  			this.simulation.addSimpleBoxBody(pos, ext);
  			
            // Clean up temporary objects
  			pos.destroy();
  			ext.destroy();
        },
        
        /**
         * Create a toy and apply a force to give it some random motion.
         * @param toyObject {Toy} A toy object to add to the playfield and simulation
         * @private
         */
        createToy: function(toyObject,id) {
  			// Before we create a toy, check the engine load.  If it's close to 100%
  			// just return.  We want this demo to stay interactive.
  			if (Engine.getEngineLoad() > 0.8) {
  				return;
  			}
  			if(id==0){
                this.AttackUnit=toyObject;
                //console.log("AttackUnit: " + this.AttackUnit)
                var p = Point2D.create(50, 370);
            }
  			if(id==1){
    			// Set a location
    			var p = Point2D.create(500, 200);
  			}
  			if(id==2){
                // Set a location
                var p = Point2D.create(600, 200);
            }
            if(id==3){
                // Set a location
                var p = Point2D.create(700, 100);
                toyObject.setRotation(90);
                //console.log("rotation beim createn: " + toyObject.getRotation());
            }
    		toyObject.setPosition(p);
  			//toyObject.setRotation(90);
  			
  			
    		// The simulation is used to update the position and rotation
    		// of the physical body.  Whereas the render context is used to 
    		// represent (draw) the shape.
            toyObject.setSimulation(this.simulation);
            this.getRenderContext().add(toyObject);
             
            // Start the simulation of the object so we can apply a force
            toyObject.simulate();
            //toyObject.setRotation(90);
            //console.log("rotation at creation: " + toyObject.getRotation());
            
            if(id==3 || id==0){
                //toyObject.setRotation(90);
                //console.log("rotation beim createn: " + toyObject.getRotation());
                
                toyObject.startsim();
                toyObject.setRotation(90);
                toyObject.stopsim();
                toyObject.setRotation(90);
                //toyObject.update();
            }
            
            //var v = Vector2D.create (0,0);//((1000 + (Math2.random() * 5000)) * 2000, 10);
            //toyObject.applyForce(v, p);
             
            // Clean up temporary objects
            //v.destroy();
            p.destroy();
      },
      
      /**
       * Returns a reference to the render context
       * @return {RenderContext}
       */
      getRenderContext: function(){
         return this.renderContext;
      },
      
      /**
       * Returns a reference to the playfield box
       * @return {Rectangle2D}
       */
      getFieldBox: function() {
         return this.fieldBox;
      },
      
      /**
       * Returns a reference to the collision model
       * @return {SpatialContainer}
       */
      getCModel: function() {
         return this.cModel;
      },
      getAttackUnit: function() {
         return this.AttackUnit;
      }
      
   });
   
   return PhysicsDemo;
   
});
