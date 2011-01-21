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

// Load all required engine components
Engine.include("/rendercontexts/context.canvascontext.js");
Engine.include("/rendercontexts/context.htmldivcontext.js");
Engine.include("/resourceloaders/loader.sprite.js");
Engine.include("/resourceloaders/loader.image.js");
Engine.include("/components/component.image.js");
Engine.include("/spatial/container.spatialgrid.js");
Engine.include("/engine/engine.timers.js");
Engine.include("/physics/physics.simulation.js")
Engine.include("/textrender/text.context.js");
Engine.include("/textrender/text.renderer.js");

Engine.include("/physics/collision/shapes/b2BoxDef.js");

// Load game objects
Game.load("/player.js");
Game.load("/LPObject.js");
Game.load("/Block.js");
Game.load("/Plant.js");
Game.load("/Background.js");

Engine.initObject("LastPlant", "Game", function(){

   /**
    * @class The main Class of the LastPlant Game
    *
    * @extends Game
    */
   var LastPlant = Game.extend({
   
      constructor: null,
      
      // The rendering context
      renderContext: null,
      
      // Engine frames per second
      engineFPS: 60,
      
      // The play field
      fieldBox: null,
      fieldWidth: 800,
      fieldHeight: 400,
      
      //Blocks
      OverallNumberOfBlocks: 4,
      currentNumberOfBlocks: 0,
      BlocksArray: null,
      BlocksArrayIndex: 0,
      
      //Counter Text Object
      NumberBlocksLeftText: null,
      PlantWasSetText: null,

      // Sprite & image resource loader
      spriteLoader: null,
      imageLoader: null,
      
      // The collision model
      cModel: null,
      
      
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
         this.spriteLoader.load("Block-long", this.getFilePath("resources/Block-long.sprite"));
         this.spriteLoader.load("Plant", this.getFilePath("resources/Plant.sprite"));
         this.spriteLoader.load("Background", this.getFilePath("resources/Background.sprite"));
         
         //load background image
         //this.imageLoader = ImageLoader.create();
         //this.imageLoader.load("background", this.getFilePath("resources/Background.png"), 800, 400);
        

         
         // Don't start until all of the resources are loaded
         Timeout.create("wait", 250, function() {
				if (LastPlant.spriteLoader.isReady() /*&& LastPlant.imageLoader.isReady()*/) {
						this.destroy();
						LastPlant.run();
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
        
        //draw background image
        //this.add(ImageComponent.create("draw", Tutorial4.imageLoader, "keys"));
        //var backgroundIMG = ImageComponent.create("background", 1, this.imageLoader.getImage("background"));
        //this.renderContext.drawImage(this.fieldBox, this.imageLoader.getImage("background"))
        //console.log(this.spriteLoader.getSprite("BGSprite", "Background"));
        /*var canvas=HTMLElementContext.create("thiscanvas", this.renderContext.getElement());
        canvas.pushTransform();
        canvas.setPosition(Point2D.create(200, 200))
        canvas.popTransform();
        console.log( canvas.getPosition() );*/
        //console.log( this.renderContext.jQ().offset() );
        //this.renderContext.drawSprite(this.spriteLoader.getSprite("BGSprite", "Background"),0)
        

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
         
        //this.renderContext.drawSprite(this.spriteLoader.getSprite("BGSprite", "Background"))
        /*var BGSpritee = SpriteComponent.create("BGSpriteComp", 1, this.spriteLoader.getSprite("BGSprite", "Background"));
        console.log(BGSpritee);
        this.renderContext.add(BGSpritee);*/
        //console.log(this.spriteLoader.getSprite("BGSprite", "Background"));
        //this.renderContext.drawSprite(this.spriteLoader.getSprite("BGSprite", "Background"))
        
        //var backgroundIMG = ImageComponent.create("background", 1, this.imageLoader.getImage("background"));
        //this.renderContext.add(backgroundIMG);
        //this.renderContext.drawImage(this.fieldBox, this.imageLoader.getImage("background"));

        //console.log(Background.create());
        this.getRenderContext().add(Background.create());
        //Background.create();
        
        this.BlocksArray = [];
        LastPlant.createLPObject();
        //LastPlant.createLPObject(Block.create(),2);
        //LastPlant.createLPObject(Block.create(),3);
         
        // Add the player object
        var player = Player.create();
        this.getRenderContext().add(player);
          
        // Texts
        var BlocksLeftText = TextRenderer.create(ContextText.create(), "Blocks left", 1.8);
        BlocksLeftText.setPosition(Point2D.create(20, 50));
        BlocksLeftText.setTextFont("Verdana")
        BlocksLeftText.setColor("#ccff33");
        this.renderContext.add(BlocksLeftText);
        
        
        //console.log(this.renderContext.getRenderPosition());
        /*var pos=Point2D.create(200, 200);
        this.renderContext.setPosition(pos);
        console.log(this.renderContext.getPosition());
        console.log(this.renderContext.getWorldPosition());
        var pos=Point2D.create(100, 100);
        this.renderContext.setWorldPosition(pos);
        console.log(this.renderContext.getWorldPosition());*/
      },
      
      saveConstruct: function(){
        var JSONToSave = {}; //'{"OverallNumberOfBlocks": "' +this.OverallNumberOfBlocks+'",';
        JSONToSave.OverallNumberOfBlocks = this.OverallNumberOfBlocks;
        JSONToSave.Blocks = [];
        for (var i = 0; i < this.OverallNumberOfBlocks+1; i++){
            //TODO
            //UNITTYPE mitspeichern

            JSONToSave.Blocks.push( {"Type":this.BlocksArray[i].getLPOType(), 
                                     "PosX":parseInt(this.BlocksArray[i].getPos().x), 
                                     "PosY":parseInt(this.BlocksArray[i].getPos().y), 
                                     "Rot":parseInt(this.BlocksArray[i].getRot())
                                    } );
            
            /*JSONToSave+=' "BLOCK": { '
            
            JSONToSave+='   "TYPE": "1",';
            JSONToSave+='   "PosX": "'+parseInt(this.BlocksArray[i].getPos().x)+'",';
            JSONToSave+='   "PosY": "'+parseInt(this.BlocksArray[i].getPos().y)+'",';
            JSONToSave+='   "Rot": "' +parseInt(this.BlocksArray[i].getRot())+'"';
            JSONToSave+="}";*/
            
            //JSONToSave+="Y:"+this.BlocksArray[i].getPos();
            //console.log(this.BlocksArray[i].getRot());
        }
        //JSONToSave+="}";
        
        //console.log(JSONToSave);
        var ElementToStoreIn = document.getElementById("storage");
        var JSONtext= JSON.stringify(JSONToSave);
        //console.log(JSONtext);
        ElementToStoreIn.innerHTML = JSONtext;
        
        /*var JSONtryout = {};
        JSONtryout.testfeld = 'halloo';
        console.log("JSONtryout.testfeld: " + JSONtryout.testfeld);*/
        
      },

        
        
      /**
       * Set up the physical world.  Creates the bounds of the world by establishing
       * walls and a floor.  The actual objects have no visual respresentation but they
       * will exist in the simulation and prevent the LPObjects from leaving the playfield.
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
  			pos.set(-238, 100);
  			ext.set(400, this.fieldBox.get().h + 1500);
  			this.simulation.addSimpleBoxBody(pos, ext);
  
  			// Right wall
  			pos.set(this.fieldBox.get().w+200, 100);
  			ext.set(200, this.fieldBox.get().h + 1500);
  			this.simulation.addSimpleBoxBody(pos, ext);
  			
            // Clean up temporary objects
  			pos.destroy();
  			ext.destroy();
        },
        
        gameOver: function(){
            this.renderContext.remove(this.PlantWasSetText);

            this.writeText(1.8, Point2D.create(180, 40), "You did your best to save the LastPlant!");
            this.writeText(1.4, Point2D.create(180, 80), 'Press "SAVE" now to receive following points on your Builder-Profile');
            
            var BlocksInLvl = "Blocks in level: " + this.OverallNumberOfBlocks + " x 30 points";
            this.writeText(1.4, Point2D.create(200, 100), BlocksInLvl);
            var BlocksInLvl = "Height of the defense: " + "1337Fakenumber" + " points";
            this.writeText(1.4, Point2D.create(200, 120), BlocksInLvl);
        },
        writeText: function(Size, Position, Text){
            this.renderContext.remove(TextToWrite);
            var TextToWrite = TextRenderer.create(ContextText.create(), Text, Size);
            TextToWrite.setPosition(Position);
            TextToWrite.setTextFont("Verdana")
            TextToWrite.setColor("#ccff33");
            this.renderContext.add(TextToWrite);
        },
        showPlantWasSetText: function(){
            var PlantWasSetTextString="Please wait for the Plant to settle down";
            
            this.PlantWasSetText = TextRenderer.create(ContextText.create(), PlantWasSetTextString, 1.8);
            this.PlantWasSetText.setPosition(Point2D.create(180, 40));
            this.PlantWasSetText.setTextFont("Verdana")
            this.PlantWasSetText.setColor("#ccff33");
            this.renderContext.add(this.PlantWasSetText);
        },
        
        /**
         * Create a LPObject
         * @param LPObjectObject {LPObject} A LPObject object to add to the playfield and simulation
         * @private
         */
        createLPObject: function() {
  			// Before we create a LPObject, check the engine load.  If it's > 80%
  			// just return.
  			//if (Engine.getEngineLoad() > 0.8) {
  				//return;
  			//}
  			// if(id==0){
                // this.AttackUnit=LPObjectObject;
                // //console.log("AttackUnit: " + this.AttackUnit)
                // var p = Point2D.create(50, 370);
            // }
  			// if(id==1){
    			// // Set a location
    			// var p = Point2D.create(500, 200);
  			// }
  			// if(id==2){
                // // Set a location
                // var p = Point2D.create(600, 200);
            // }
            // if(id==3){
                // // Set a location
                // var p = Point2D.create(700, 100);
                // //LPObjectObject.setRotation(90);
                // //console.log("rotation beim createn: " + LPObjectObject.getRotation());
            // }
            
            //return if blocks number is reache
            var blocksleft=this.OverallNumberOfBlocks-this.currentNumberOfBlocks;
            
            if(blocksleft<0)
                return;
            else if(blocksleft==0){
                this.writeBlocksCounter("0");
                LPObjectObject=Plant.create();
                
                var p = Point2D.create(50, 200);
                LPObjectObject.setPosition(p);
                p.destroy();
                
                LPObjectObject.setSimulation(this.simulation);
                this.getRenderContext().add(LPObjectObject);

                LPObjectObject.simulate();
                LPObjectObject.startsim();
                LPObjectObject.stopsim();

                this.BlocksArray[this.BlocksArrayIndex]=LPObjectObject;
            } else {
                
                LPObjectObject=Block.create();
                this.writeBlocksCounter(blocksleft)
                
                this.currentNumberOfBlocks=this.currentNumberOfBlocks+1;
                
                //console.log("LPObjectObject: " + LPObjectObject);
                //console.log(LPObjectObject);
                var p = Point2D.create(60, 200);
                
                LPObjectObject.setPosition(p);
                //console.log(Math2.randomRange(0,180,true));
                var rot=Math2.randomRange(0,180,true);
                LPObjectObject.setRot(rot*0.017453292519943); //conversion RAD->GRAD
                LPObjectObject.getComponent("physics").setRotation(rot*0.017453292519943);
                
                
                // The simulation is used to update the position and rotation
                // of the physical body.  Whereas the render context is used to 
                // represent (draw) the shape.
                LPObjectObject.setSimulation(this.simulation);
                this.getRenderContext().add(LPObjectObject);
                 
                // Start the simulation of the object so we can apply a force
                LPObjectObject.simulate();
                //LPObjectObject.setRotation(90);
                //console.log("rotation at creation: " + LPObjectObject.getRotation());

                LPObjectObject.startsim();
                LPObjectObject.stopsim();

                this.BlocksArray[this.BlocksArrayIndex]=LPObjectObject;
                this.BlocksArrayIndex++;
                
                //if(id==3 || id==0){
                    //LPObjectObject.setRotation(90);
                    //console.log("rotation beim createn: " + LPObjectObject.getRotation());
                    
                    //LPObjectObject.startsim();
                    //LPObjectObject.setRotation(90);
                    //LPObjectObject.stopsim();
                    //LPObjectObject.setRot(90);
                    //LPObjectObject.update();
                //}
                
                //var v = Vector2D.create (0,0);//((1000 + (Math2.random() * 5000)) * 2000, 10);
                //LPObjectObject.applyForce(v, p);
                 
                // Clean up temporary objects
                //v.destroy();
                p.destroy();
            }
      },
      /** 
      * Write somethign into the NumberBlocksLeftText
      * @counter text written
      */
      writeBlocksCounter: function(counter){
            this.renderContext.remove(this.NumberBlocksLeftText);
            this.NumberBlocksLeftText = TextRenderer.create(ContextText.create(), counter, 1.8);
            this.NumberBlocksLeftText.setPosition(Point2D.create(60, 80));
            this.NumberBlocksLeftText.setTextFont("Verdana")
            this.NumberBlocksLeftText.setColor("#ccff33");
            this.renderContext.add(this.NumberBlocksLeftText);
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
      
   });
   
   return LastPlant;
   
});

