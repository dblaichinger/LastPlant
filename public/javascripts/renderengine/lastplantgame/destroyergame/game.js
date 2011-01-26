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
Engine.include("/spatial/container.spatialgrid.js");
Engine.include("/engine/engine.timers.js");
Engine.include("/physics/physics.simulation.js")
Engine.include("/textrender/text.context.js");
Engine.include("/textrender/text.renderer.js");

Engine.include("/physics/collision/shapes/b2BoxDef.js");

// Load game objects
Game.load("../../javascripts/renderengine/lastplantgame/destroyergame/Player.js");
Game.load("../../javascripts/renderengine/lastplantgame/destroyergame/LPObject.js");
Game.load("../../javascripts/renderengine/lastplantgame/destroyergame/AttkUnit.js");
Game.load("../../javascripts/renderengine/lastplantgame/destroyergame/AttkUnitLegs.js");
Game.load("../../javascripts/renderengine/lastplantgame/destroyergame/Block.js");
Game.load("../../javascripts/renderengine/lastplantgame/destroyergame/Plant.js");
Game.load("../../javascripts/renderengine/lastplantgame/destroyergame/Forcesetter.js");
Game.load("../../javascripts/renderengine/lastplantgame/destroyergame/Background.js");


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
      
      //the object setting the shot strengh
      Forcesetter: null,
      
      //Blocks 
      OverallNumberOfBlocks: null,
      destroyedBlocks: null,
      currentNumberOfBlocks: 0,
      BlocksArray: null,
      BlocksArrayIndex: 0,
      
      // Sprite resource loader
      spriteLoader: null,
      
      // The collision model
      cModel: null,
      
      // the attacking unit
      AttackUnitsArray: null,
      CurrentAttackUnit: null,
      AttackUnitLegs: null,
      AttackUnitLifes: 3,
      FirstAttackUnitwasCreated: false,
      shootOffPosition: null,
      
	  GameBackground: null,
	  
      // the Plant unit
      Plant: null,      
      
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
         this.spriteLoader.load("AttkUnit", this.getFilePath("../../javascripts/renderengine/lastplantgame/destroyergame/resources/AttkUnit.sprite"));
         this.spriteLoader.load("AttkUnitLegs", this.getFilePath("../../javascripts/renderengine/lastplantgame/destroyergame/resources/AttkUnitLegs.sprite"));
         this.spriteLoader.load("Block-long", this.getFilePath("../../javascripts/renderengine/lastplantgame/destroyergame/resources/Block-long.sprite"));
         this.spriteLoader.load("Block-square", this.getFilePath("../../javascripts/renderengine/lastplantgame/destroyergame/resources/Block-square.sprite"));
         this.spriteLoader.load("Plant", this.getFilePath("../../javascripts/renderengine/lastplantgame/destroyergame/resources/Plant.sprite"));
         this.spriteLoader.load("ForceSetter", this.getFilePath("../../javascripts/renderengine/lastplantgame/destroyergame/resources/ForceSetter.sprite"));
         this.spriteLoader.load("Background", this.getFilePath("../../javascripts/renderengine/lastplantgame/destroyergame/resources/Background.sprite"));
         
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

        
        // Add the Background
        this.GameBackground=Background.create();
        this.getRenderContext().add(this.GameBackground);
        
        // Load the Blocks and the Plant
        this.loadBlocks();
        
        // Setup the ForceSetter
        this.Forcesetter = ForceSetter.create();
        this.Forcesetter.setPosition(Point2D.create(120, 280));
        this.Forcesetter.setStartPosandRot(Point2D.create(120, 280), -45);
        this.Forcesetter.getComponent("physics").setRotation(-45*0.017453292519943);
        this.Forcesetter.setSimulation(this.simulation);
        this.renderContext.add(this.Forcesetter);
        this.Forcesetter.simulate();
        this.Forcesetter.stopsim();

        // Add the player object
        var player = Player.create();
        this.getRenderContext().add(player);
        
        
        // Spawn the first Attack Unit
        this.shootOffPosition=Point2D.create(55, 359);
        this.spawnAttackUnits();

        // Spawn the Attack unit Legs
        this.AttackUnitLegs = AttkUnitLegs.create();
        this.AttackUnitLegs.setPosition(Point2D.create(0, 364));
        this.getRenderContext().add(this.AttackUnitLegs);
      },
      
      /**
       * Set the next Attackunit to the shooting Position
       * @private
       */        
      setNewAttackUnit: function(){
        if(this.AttackUnitLifes>0){
            this.AttackUnitLifes--;
            this.AttackUnitsArray.shift();
            this.CurrentAttackUnit=this.AttackUnitsArray[0];
            this.CurrentAttackUnit.setPosition(this.shootOffPosition);
        }
        else if(this.AttackUnitLifes==0){
            this.gameOver(false);
        }
      },
      
      /**
       * Write Gameover Texts and save score
       * @private
       */
      gameOver: function(GameWon){
        this.Forcesetter.destroy();
        this.Forcesetter=null;
		this.GameBackground.setBGtoGameOver();
        
        this.getRenderContext().remove(this.AttackUnitLegs);
        var GameOverString;
        var OverallPoints;
		var MapBaseScore = document.getElementById("map_score");
        MapBaseScore=MapBaseScore.innerHTML;
        MapBaseScore=parseInt(MapBaseScore);
        var croppedBaseScore=MapBaseScore/4;
        var croppedBaseScore=parseInt(croppedBaseScore);

        if(GameWon){
			if(this.AttackUnitLifes>0){
				for(var i=0; i < this.AttackUnitLifes+1; i++){
					this.AttackUnitsArray[i].destroy();
				}
			}
            this.writeText(1.6, Point2D.create(30, 45), "All Hail the Machine!", "bold");
            var BaseScoreText = "1/4 Basescore of the map: " + croppedBaseScore;
            this.writeText(1.0, Point2D.create(30, 80), BaseScoreText, "bold");
			
            var BlocksInLvl = "Blocks destroyed: " + this.destroyedBlocks + " x 10 points";
            this.writeText(1.0, Point2D.create(30, 100), BlocksInLvl, "bold");
            
            var MonestersLeft = "Monsters left: " + this.AttackUnitLifes + " x 30 points";
            this.writeText(1.0, Point2D.create(30, 120), MonestersLeft, "bold");
            
            OverallPoints=croppedBaseScore + this.destroyedBlocks*10 + this.AttackUnitLifes*30;
            var OverallPointsText = "Total: " + OverallPoints + " points";
            this.writeText(1.1, Point2D.create(30, 140), OverallPointsText, "bold");
			this.writeText(1.5, Point2D.create(30, 180), "Your Score was saved", "bold");
        }else{
            this.writeText(2.3, Point2D.create(30, 55), "You failed!", "bold");
			MapBaseScore=MapBaseScore/10;
			MapBaseScore=parseInt(MapBaseScore);
            this.writeText(1.0, Point2D.create(30, 120), "You receive " + MapBaseScore + " points for your effort", "bold");
            OverallPoints=MapBaseScore;
			this.writeText(1.1, Point2D.create(30, 140), "Your Score was saved", "bold");
        }
        var map_id = document.getElementById("map_id");
        map_id = map_id.innerHTML;
        map_id = parseInt(map_id);
        this.saveDataAJAX(OverallPoints, map_id, GameWon);
      },
             
      /**
       * Write a Text to a  given Position
       * @param Position (Point2D): Position the object should be set to
       * @param Size (float): Size to write the text in
       * @param Text (string): the string to write
       * @private
       */
      writeText: function(Size, Position, Text, boldness){
        this.renderContext.remove(TextToWrite);
        var TextToWrite = TextRenderer.create(ContextText.create(), Text, Size);
        TextToWrite.setPosition(Position);
        TextToWrite.setTextFont("Helvetica, Arial")
        TextToWrite.setColor("#666666");
		TextToWrite.setTextWeight(boldness);
        this.renderContext.add(TextToWrite);
      },
	  
	  
      writeAJAX: function(url, score){
        var xhr = createXHR();
        xhr.onreadystatechange=function() {
            if(xhr.readyState == 4) {		
                // nothing for now
                // alert("sent " + url + " " + content);
            }
        };
        
        xhr.open("POST", url, false);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(score);
      },

      saveDataAJAX: function(score, mapid, destroyerWon){
        var builderScore;
        var destroyerScore = score;
        if(destroyerWon){
            builderScore = score/50;
            builderScore=parseInt(builderScore);
        }else{
            builderScore = score/2;
        }
 
        this.writeAJAX("/gamehandler", "builderscore=" + builderScore + "&destroyerscore=" + destroyerScore + "&mapid=" + mapid);
        //var target = "/protect";
        //window.location.href = target;
      },
      
      /**
       * Create the Attackunits
       * @private
       */      
      spawnAttackUnits: function(){
        this.AttackUnitsArray = [];
        
        this.AttackUnit=AttkUnit.create();
        LastPlant.createLPObject(this.AttackUnit, this.shootOffPosition, 0);
        this.AttackUnit.stopsim();
        this.AttackUnitsArray.push(this.AttackUnit);
        
        this.AttackUnit=AttkUnit.create();
        LastPlant.createLPObject(this.AttackUnit, Point2D.create(150, 40), 0);
        this.AttackUnit.stopsim();
        this.AttackUnitsArray.push(this.AttackUnit);

        this.AttackUnit=AttkUnit.create();
        LastPlant.createLPObject(this.AttackUnit, Point2D.create(95, 40), 0);
        this.AttackUnit.stopsim();
        this.AttackUnitsArray.push(this.AttackUnit);
        
        this.CurrentAttackUnit=this.AttackUnitsArray[0];
        this.AttackUnitLifes--;
      },
      
      /**
       * Load the construct (Blocks and Plant)
       * @private
       */
      loadBlocks: function(){
        var JSONString = document.getElementById("storage");
        JSONString=JSONString.innerHTML;
        BlocksInfo=jQuery.parseJSON(JSONString);
        this.OverallNumberOfBlocks=BlocksInfo.OverallNumberOfBlocks;
        this.BlocksArray=BlocksInfo.Blocks;
        
        var LPObjPos = Point2D.create(0, 0);
        for (var i = 0; i < this.OverallNumberOfBlocks+1; i++){
            LPObjPos.set(this.BlocksArray[i].PosX, this.BlocksArray[i].PosY);
            if(this.BlocksArray[i].Type=="Plant")
                LastPlant.createLPObject(Plant.create(), LPObjPos, this.BlocksArray[i].Rot);
            else
                LastPlant.createLPObject(Block.create(this.BlocksArray[i].Type), LPObjPos, this.BlocksArray[i].Rot);
        }
        LPObjPos.destroy();
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
  			pos.set(-200, 100);
  			ext.set(200, this.fieldBox.get().h + 1500);
  			this.simulation.addSimpleBoxBody(pos, ext);
  
  			// Right wall
  			pos.set(this.fieldBox.get().w+200, 100);
  			ext.set(200, this.fieldBox.get().h + 1500);
  			this.simulation.addSimpleBoxBody(pos, ext);
  			
            // Clean up temporary objects
  			pos.destroy();
  			ext.destroy();
        },
        
        /**
         * Initialise a LPObject
         * @param NewLPObject {LPObject} A LPObject object to add to the playfield and simulation
         * @param Position (Point2D): Position the object should be set to
         * @param Rotation (int): Rotation of the Object in grad
         * @private
         */
        createLPObject: function(NewLPObject, Position, Rotation) {
            NewLPObject.setPosition(Position);
            NewLPObject.getComponent("physics").setRotation(Rotation*0.017453292519943); //Box2D works with RAD
  			
    		// The simulation is used to update the position and rotation
    		// of the physical body.  Whereas the render context is used to draw the shape.
            NewLPObject.setSimulation(this.simulation);
            this.getRenderContext().add(NewLPObject);
             
            // Start the simulation of the object
            NewLPObject.simulate();
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
      /**
       * Returns a reference to the current attack unit
       * @return {AttkUnit}
       */
      getAttackUnit: function() {
         return this.CurrentAttackUnit;
      },
      /**
       * Returns a reference to the ForceSetter
       * @return {ForceSetter}
       */      
      getForceSetter: function() {
         return this.Forcesetter;
      },
      /**
       * Returns a reference to the attack unit legs
       * @return {AttkUnitLegs}
       */        
      getAttackUnitLegs: function() {
         return this.AttackUnitLegs;
      }
      
   });
   
   return LastPlant;
   
});
