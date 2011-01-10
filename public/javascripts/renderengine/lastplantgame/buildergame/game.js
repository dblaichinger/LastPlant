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

//load game objects
Game.load("../../javascripts/renderengine/lastplantgame/buildergame/Player.js");
Game.load("../../javascripts/renderengine/lastplantgame/buildergame/LPObject.js");
Game.load("../../javascripts/renderengine/lastplantgame/buildergame/Block.js");
Game.load("../../javascripts/renderengine/lastplantgame/buildergame/Plant.js");
Game.load("../../javascripts/renderengine/lastplantgame/buildergame/Background.js");




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
      OverallNumberOfBlocks: 7,
      currentNumberOfBlocks: 0,
      BlocksArray: null,
      BlocksArrayIndex: 0,
      
      //Counter Text Object
      NumberBlocksLeftText: null,
      PlantWasSetText: null,
	  
	  TotalScore: null,

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
         
         // Load sprites
         this.spriteLoader.load("Block-long", this.getFilePath("../../javascripts/renderengine/lastplantgame/buildergame/resources/Block-long.sprite"));
         this.spriteLoader.load("Block-square", this.getFilePath("../../javascripts/renderengine/lastplantgame/buildergame/resources/Block-square.sprite"));
         this.spriteLoader.load("Plant", this.getFilePath("../../javascripts/renderengine/lastplantgame/buildergame/resources/Plant.sprite"));
         this.spriteLoader.load("Background", this.getFilePath("../../javascripts/renderengine/lastplantgame/buildergame/resources/Background.sprite"));
         
         // Don't start until all of the resources are loaded
         Timeout.create("wait", 250, function() {
				if (LastPlant.spriteLoader.isReady()) {
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
        this.renderContext.setBackgroundColor("#241E1E");

        // Set up the physics simulation
        this.simulation = Simulation.create("simulation", this.fieldBox);
        this.simulation.setIntegrations(3);
        this.setupWorld();
         
        // Add the simulation to the scene graph so the physical
        // world is stepped (updated) in sync with each frame generated
        this.renderContext.add(this.simulation);

        // Add the game context to the scene graph
        Engine.getDefaultContext().add(this.renderContext);

        // Create the collision model with 8x8 divisions
        this.cModel = SpatialGrid.create(this.fieldWidth, this.fieldHeight, 8);

        // Add the Background to the context
        this.getRenderContext().add(Background.create());

        this.BlocksArray = [];
        LastPlant.createLPObject();
         
        // Add the player object
        var player = Player.create();
        this.getRenderContext().add(player);
          
        // Write the "Blocks Left" Text
        var BlocksLeftText = TextRenderer.create(ContextText.create(), "Blocks left", 1.8);
        BlocksLeftText.setPosition(Point2D.create(20, 50));
        BlocksLeftText.setTextFont("Verdana")
        BlocksLeftText.setColor("#ccff33");
        this.renderContext.add(BlocksLeftText);
      },
        
      /**
       * Set up the physical world.  Creates "invisible walls" to prevent
       * Objects of leaving the canvas
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
      
        saveConstruct: function(){
            var JSONToSave = {}; 
            JSONToSave.OverallNumberOfBlocks = this.OverallNumberOfBlocks;
            JSONToSave.Blocks = [];
            for (var i = 0; i < this.OverallNumberOfBlocks+1; i++){
                JSONToSave.Blocks.push( {"Type":this.BlocksArray[i].getLPOType(), 
                                         "PosX":parseInt(this.BlocksArray[i].getPos().x), 
                                         "PosY":parseInt(this.BlocksArray[i].getPos().y), 
                                         "Rot":parseInt(this.BlocksArray[i].getRot())
                                        } );
            }
            var ElementToStoreIn = document.getElementById("storage");
            var JSONtext= JSON.stringify(JSONToSave);
            ElementToStoreIn.innerHTML = JSONtext;
            
            var ElementToStoreScoreIn = document.getElementById("score");
            var ScoreText= this.TotalScore;
            ElementToStoreScoreIn.innerHTML = ScoreText;
            
            var ElementToStoreMap_Img = document.getElementById("map_img");
            var imgData= this.renderContext.getDataURL();
            ElementToStoreMap_Img.innerHTML = imgData;
        },

        getHeightOfConstruct: function(){
            var maxPosY=this.fieldHeight;
            for (var i = 0; i < this.OverallNumberOfBlocks+1; i++){
                if(this.BlocksArray[i].getPos().y<maxPosY)
                    maxPosY=this.BlocksArray[i].getPos().y
            }
            maxPosY=this.fieldHeight-maxPosY;
            return parseInt(maxPosY);
        },
        
        gameOver: function(){
            this.renderContext.remove(this.PlantWasSetText);
			
			this.TotalScore=0;
			
            this.writeText(1.8, Point2D.create(190, 50), "You did your best to save the LastPlant!");
            this.writeText(1.4, Point2D.create(190, 83), 'Press "Save Construct" now to receive following points on your Builder-Profile');
            
            var BlocksInLvl = "Blocks in level: " + this.OverallNumberOfBlocks + " x 30 points";
			this.TotalScore=this.OverallNumberOfBlocks*30;
            this.writeText(1.4, Point2D.create(210, 105), BlocksInLvl);
            var height=this.getHeightOfConstruct();
            var BlocksInLvl = "Height of the defense: " + height + " points";
			this.TotalScore=this.TotalScore+height;
            this.writeText(1.4, Point2D.create(210, 125), BlocksInLvl);
            var TotalScoreText = "All in all this makes: " + this.TotalScore + " points";
            this.writeText(1.4, Point2D.create(210, 145), TotalScoreText);
        },
        writeText: function(Size, Position, Text){
            this.renderContext.remove(TextToWrite);
            var TextToWrite = TextRenderer.create(ContextText.create(), Text, Size);
            TextToWrite.setPosition(Position);
            TextToWrite.setTextFont("Verdana")
            TextToWrite.setColor("#655655");
            this.renderContext.add(TextToWrite);
        },
        showPlantWasSetText: function(){
            var PlantWasSetTextString="Please wait for the Plant to settle down";
            
            this.PlantWasSetText = TextRenderer.create(ContextText.create(), PlantWasSetTextString, 1.8);
            this.PlantWasSetText.setPosition(Point2D.create(190, 50));
            this.PlantWasSetText.setTextFont("Verdana")
            this.PlantWasSetText.setColor("#655655");
            this.renderContext.add(this.PlantWasSetText);
        },
        
        /**
         * Create a LPObject to add to the playfield and simulation
         * @private
         */
        createLPObject: function() {
            var blocksleft=this.OverallNumberOfBlocks-this.currentNumberOfBlocks;
            
            if(blocksleft<0)
                return;
            else if(blocksleft==0){  //Spawn Plant
                this.writeBlocksCounter("0");
                

                NewLPObject=Plant.create();
                
                var p = Point2D.create(50, 200);
                NewLPObject.setPosition(p);
                p.destroy();
                
                NewLPObject.setSimulation(this.simulation);
                this.getRenderContext().add(NewLPObject);

                NewLPObject.simulate();
                NewLPObject.startsim();
                NewLPObject.stopsim();

                this.BlocksArray[this.BlocksArrayIndex]=NewLPObject;
            } else { //spawn a new Block
                
                var TypeofBlock=Math2.randomRange(0,2,true);
                if(TypeofBlock==0)
                    NewLPObject=Block.create("Block-square");
                else
                    NewLPObject=Block.create("Block-long");
                    

                this.writeBlocksCounter(blocksleft)
                this.currentNumberOfBlocks=this.currentNumberOfBlocks+1;

                var startPos = Point2D.create(60, 200);
                
                NewLPObject.setPosition(startPos);
                var rot=Math2.randomRange(0,180,true);
                NewLPObject.saveRot(rot*0.017453292519943); //conversion RAD->GRAD
                NewLPObject.getComponent("physics").setRotation(rot*0.017453292519943);
                
                
                // The simulation is used to update the position and rotation
                // of the physical body.  Whereas the render context is used to draw the shape
                NewLPObject.setSimulation(this.simulation);
                this.getRenderContext().add(NewLPObject);
                 
                // Start the simulation of the object
                // And stop again so the player can set it without physical limitations
                NewLPObject.simulate();
                NewLPObject.startsim();
                NewLPObject.stopsim();

                this.BlocksArray[this.BlocksArrayIndex]=NewLPObject;
                this.BlocksArrayIndex++;

                startPos.destroy();
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

