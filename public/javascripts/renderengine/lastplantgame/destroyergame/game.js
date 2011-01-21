/**
<<<<<<< HEAD
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
=======
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
>>>>>>> 12a6c858ca3a1f66ff36776792d0e57daca43736

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
<<<<<<< HEAD
Game.load("/player.js");
Game.load("/LPObject.js");
Game.load("/AttkUnit.js");
Game.load("/AttkUnitLegs.js");
Game.load("/Block.js");
Game.load("/Plant.js");
Game.load("/forcesetter.js");
Game.load("/Background.js");
=======
Game.load("../../javascripts/renderengine/lastplantgame/destroyergame/Player.js");
Game.load("../../javascripts/renderengine/lastplantgame/destroyergame/LPObject.js");
Game.load("../../javascripts/renderengine/lastplantgame/destroyergame/AttkUnit.js");
Game.load("../../javascripts/renderengine/lastplantgame/destroyergame/AttkUnitLegs.js");
Game.load("../../javascripts/renderengine/lastplantgame/destroyergame/Block.js");
Game.load("../../javascripts/renderengine/lastplantgame/destroyergame/Plant.js");
Game.load("../../javascripts/renderengine/lastplantgame/destroyergame/Forcesetter.js");
Game.load("../../javascripts/renderengine/lastplantgame/destroyergame/Background.js");
>>>>>>> 12a6c858ca3a1f66ff36776792d0e57daca43736


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
<<<<<<< HEAD
      forcesetter: null,
      
      //Blocks 
      OverallNumberOfBlocks: null,
=======
      Forcesetter: null,
      
      //Blocks 
      OverallNumberOfBlocks: null,
      destroyedBlocks: null,
>>>>>>> 12a6c858ca3a1f66ff36776792d0e57daca43736
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
<<<<<<< HEAD
         this.spriteLoader.load("AttkUnit", this.getFilePath("resources/AttkUnit.sprite"));
         this.spriteLoader.load("AttkUnitLegs", this.getFilePath("resources/AttkUnitLegs.sprite"));
         this.spriteLoader.load("Block-long", this.getFilePath("resources/Block-long.sprite"));
         this.spriteLoader.load("Plant", this.getFilePath("resources/Plant.sprite"));
         this.spriteLoader.load("ForceSetter", this.getFilePath("resources/ForceSetter.sprite"));
         this.spriteLoader.load("Background", this.getFilePath("resources/Background.sprite"));
=======
         this.spriteLoader.load("AttkUnit", this.getFilePath("../../javascripts/renderengine/lastplantgame/destroyergame/resources/AttkUnit.sprite"));
         this.spriteLoader.load("AttkUnitLegs", this.getFilePath("../../javascripts/renderengine/lastplantgame/destroyergame/resources/AttkUnitLegs.sprite"));
         this.spriteLoader.load("Block-long", this.getFilePath("../../javascripts/renderengine/lastplantgame/destroyergame/resources/Block-long.sprite"));
         this.spriteLoader.load("Block-square", this.getFilePath("../../javascripts/renderengine/lastplantgame/destroyergame/resources/Block-square.sprite"));
         this.spriteLoader.load("Plant", this.getFilePath("../../javascripts/renderengine/lastplantgame/destroyergame/resources/Plant.sprite"));
         this.spriteLoader.load("ForceSetter", this.getFilePath("../../javascripts/renderengine/lastplantgame/destroyergame/resources/ForceSetter.sprite"));
         this.spriteLoader.load("Background", this.getFilePath("../../javascripts/renderengine/lastplantgame/destroyergame/resources/Background.sprite"));
>>>>>>> 12a6c858ca3a1f66ff36776792d0e57daca43736
         
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
<<<<<<< HEAD
        this.renderContext.setBackgroundColor("#FFFFFF");
=======
        this.renderContext.setBackgroundColor("#241E1E");
>>>>>>> 12a6c858ca3a1f66ff36776792d0e57daca43736

        // Set up the physics simulation
        this.simulation = Simulation.create("simulation", this.fieldBox);
        this.simulation.setIntegrations(3);
        this.setupWorld();

        // Add the simulation to the scene graph so the physical
        // world is stepped (updated) in sync with each frame generated
        this.renderContext.add(this.simulation);

<<<<<<< HEAD
        // Draw an outline around the context
        this.renderContext.jQ().css({
            border: "1px solid black",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
        });
=======
>>>>>>> 12a6c858ca3a1f66ff36776792d0e57daca43736

        // Add the game context to the scene graph
        Engine.getDefaultContext().add(this.renderContext);

        // Create the collision model with 8x8 divisions
        this.cModel = SpatialGrid.create(this.fieldWidth, this.fieldHeight, 8);

<<<<<<< HEAD
        // Add some LPObjects to play around with
        /*MultiTimeout.create("AttkUnitmaker", 2, 150, function() {
          LastPlant.createLPObject(AttkUnit.create());
        });*/

        /*MultiTimeout.create("boxmaker", 1, 150, function() {
          LastPlant.createLPObject(Block.create(),0);
        });*/
        
        //add background img
        this.getRenderContext().add(Background.create());

        //this.renderContext.setFillStyle("yellow");
        //this.renderContext.drawFilledRectangle(Rectangle2D.create(195, 75, 200, 100));
        
        //var Position = Point2D.create(50, 370);

        
        this.loadBlocks();
        
        this.forcesetter = ForceSetter.create();
        this.forcesetter.setPosition(Point2D.create(120, 280));
        this.forcesetter.setStartPosandRot(Point2D.create(120, 280), -45);
        this.forcesetter.getComponent("physics").setRotation(-45*0.017453292519943);
        this.forcesetter.setSimulation(this.simulation);
        //console.log("rotation beim createn 1: " + forcesetter.getRotation());
        this.renderContext.add(this.forcesetter);
        this.forcesetter.simulate();
        this.forcesetter.stopsim();
=======
        
        // Add the Background
        this.getRenderContext().add(Background.create());
        
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
>>>>>>> 12a6c858ca3a1f66ff36776792d0e57daca43736

        // Add the player object
        var player = Player.create();
        this.getRenderContext().add(player);
<<<<<<< HEAD
        
        this.spawnAttackUnits();


        
        this.AttackUnitLegs = AttkUnitLegs.create();
        this.AttackUnitLegs.setPosition(Point2D.create(0, 364));
        //Position.destroy();        
        //console.log("attkunitlegs position: ");
        //console.log(AttackUnitLegs.getPos());
        this.getRenderContext().add(this.AttackUnitLegs);

        //this.gameOver();
        
        //Position.set(700, 360);
        //this.Plant=Plant.create();
        //LastPlant.createLPObject(this.Plant, Position, 0);
      },
      setNewAttackUnit: function(){
        //console.log("shots left: "+ this.AttackUnitLifes);
=======

        // Spawn the first Attack Unit
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
>>>>>>> 12a6c858ca3a1f66ff36776792d0e57daca43736
        if(this.AttackUnitLifes>0){
            this.AttackUnitLifes--;
            this.AttackUnitsArray.shift();
            this.CurrentAttackUnit=this.AttackUnitsArray[0];
            this.CurrentAttackUnit.setPosition(Point2D.create(45, 360));
        }
        else if(this.AttackUnitLifes==0){
            this.gameOver(false);
        }
      },
<<<<<<< HEAD
      gameOver: function(GameWon){
        //this.renderContext.remove(GameOverText);
        this.forcesetter.destroy();
=======
      
      /**
       * Write Gameover Texts and save score
       * @private
       */
      gameOver: function(GameWon){
        this.Forcesetter.destroy();
>>>>>>> 12a6c858ca3a1f66ff36776792d0e57daca43736
        this.getRenderContext().remove(this.AttackUnitLegs);
        
        this.getRenderContext().remove(this.AttackUnitLegs);
        var GameOverString;
<<<<<<< HEAD
        if(GameWon){
            //console.log("you win");
            this.CurrentAttackUnit.destroy();
            this.writeText(1.8, Point2D.create(200, 40), "You destroyed the LastPlant. All Hail the Maschine!");
            this.writeText(1.4, Point2D.create(200, 80), "You receive following points on your Destroyer-Profile");

            var BlocksInLvl = "Blocks in level: " + this.OverallNumberOfBlocks + " x 10 points";
            this.writeText(1.4, Point2D.create(200, 100), BlocksInLvl);
            
            var MonestersLeft = "Monsters left: " + this.AttackUnitLifes + " x 30 points";
            this.writeText(1.4, Point2D.create(200, 120), MonestersLeft);
            
            var OverallPoints=this.OverallNumberOfBlocks*10 + this.AttackUnitLifes*30;
            var OverallPointsText = "All in all you get: " + OverallPoints + " points";
            this.writeText(1.6, Point2D.create(200, 160), OverallPointsText);
        }else{
            //console.log("game over");
            this.writeText(1.8, Point2D.create(200, 40), "You couldn't destroy the LastPlant.");
            this.writeText(1.6, Point2D.create(200, 80), "You receive 10 points, for your effort.");
        }
      },
      
=======
        var OverallPoints;
		var MapBaseScore = document.getElementById("map_score");
        MapBaseScore=MapBaseScore.innerHTML;
        MapBaseScore=parseInt(MapBaseScore);
        var croppedBaseScore=MapBaseScore/4;
        var croppedBaseScore=parseInt(croppedBaseScore);

        if(GameWon){
            this.CurrentAttackUnit.destroy();
            this.writeText(1.8, Point2D.create(200, 40), "You destroyed the LastPlant. All Hail the Maschine!");
            this.writeText(1.4, Point2D.create(200, 80), "You receive following points on your Destroyer-Profile");
            
            var Quar
            var BaseScoreText = "1/4 Basescore of the map: " + croppedBaseScore;
            this.writeText(1.4, Point2D.create(200, 100), BaseScoreText);
			
            var BlocksInLvl = "Blocks destroyed: " + this.destroyedBlocks + " x 10 points";
            this.writeText(1.4, Point2D.create(200, 120), BlocksInLvl);
            
            var MonestersLeft = "Monsters left: " + this.AttackUnitLifes + " x 30 points";
            this.writeText(1.4, Point2D.create(200, 140), MonestersLeft);
            
            OverallPoints=croppedBaseScore + this.destroyedBlocks*10 + this.AttackUnitLifes*30;
            var OverallPointsText = "All in all you get: " + OverallPoints + " points";
            this.writeText(1.6, Point2D.create(200, 180), OverallPointsText);
        }else{
            this.writeText(1.8, Point2D.create(200, 40), "You couldn't destroy the LastPlant.");
			MapBaseScore=MapBaseScore/10;
			MapBaseScore=parseInt(MapBaseScore);
            this.writeText(1.6, Point2D.create(200, 80), "You receive " + MapBaseScore + "points (MapScore/10) for your effort.");
            OverallPoints=MapBaseScore;
        }
        this.writeText(1.6, Point2D.create(200, 200), "Please wait 3 seconds for your score to be saved");
        
        var map_id = document.getElementById("map_id");
        map_id = map_id.innerHTML;
        map_id = parseInt(map_id);
        Timeout.create("SaveDataTimer", 3000, function() {
			LastPlant.saveDataAJAX(OverallPoints, map_id, GameWon);
        });

        //this.saveDataAJAX(OverallPoints, map_id, GameWon);
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
        //console.log("mapid: " + mapid);
 
        this.writeAJAX("/gamehandler", "builderscore=" + builderScore + "&destroyerscore=" + destroyerScore + "&mapid=" + mapid);
        var target = "/protect";
        window.location.href = target;

      },
       
      /**
       * Write a Text to a  given Position
       * @param Position (Point2D): Position the object should be set to
       * @param Size (float): Size to write the text in
       * @param Text (string): the string to write
       * @private
       */
>>>>>>> 12a6c858ca3a1f66ff36776792d0e57daca43736
      writeText: function(Size, Position, Text){
        this.renderContext.remove(TextToWrite);
        var TextToWrite = TextRenderer.create(ContextText.create(), Text, Size);
        TextToWrite.setPosition(Position);
        TextToWrite.setTextFont("Verdana")
        TextToWrite.setColor("#ccff33");
        this.renderContext.add(TextToWrite);
      },
      
<<<<<<< HEAD
      spawnAttackUnits: function(){
        this.AttackUnitsArray = [];
        
        //for (var i = 0; i < this.AttackUnitLifes; i++){
=======
      /**
       * Create the Attackunits
       * @private
       */      
      spawnAttackUnits: function(){
        this.AttackUnitsArray = [];
        
>>>>>>> 12a6c858ca3a1f66ff36776792d0e57daca43736
        this.writeText(1.2, Point2D.create(30, 20), "Remaining Monsters");
        
        this.AttackUnit=AttkUnit.create();
        LastPlant.createLPObject(this.AttackUnit, Point2D.create(45, 360), 0);
        this.AttackUnit.stopsim();
        this.AttackUnitsArray.push(this.AttackUnit);
        
        this.AttackUnit=AttkUnit.create();
        LastPlant.createLPObject(this.AttackUnit, Point2D.create(100, 50), 0);
        this.AttackUnit.stopsim();
        this.AttackUnitsArray.push(this.AttackUnit);

        this.AttackUnit=AttkUnit.create();
        LastPlant.createLPObject(this.AttackUnit, Point2D.create(50, 50), 0);
        this.AttackUnit.stopsim();
        this.AttackUnitsArray.push(this.AttackUnit);
        
        this.CurrentAttackUnit=this.AttackUnitsArray[0];
<<<<<<< HEAD
        //console.log("shots left: "+ this.AttackUnitLifes);
        this.AttackUnitLifes--;

        /*if(this.AttackUnitLifes>0){
            this.AttackUnitLifes--;
            
            this.AttackUnit2.setPosition(Point2D.create(45, 360));
            console.log("this.AttackUnit vor destroy: " + this.AttackUnit);
            this.getRenderContext().remove(this.AttackUnit);
            this.AttackUnit.destroy();
            
            console.log("this.AttackUnit got destroyed: " + this.AttackUnit);
            this.AttackUnit2=AttkUnit.create();
            LastPlant.createLPObject(this.AttackUnit2, Point2D.create(45, 360), 0);
            this.AttackUnit2.stopsim();
            console.log("this.AttackUnit2: " + this.AttackUnit2);
            
            
            console.log("oldAttackUnit: " + oldAttackUnit);
            this.AttackUnit=AttkUnit.create();
            LastPlant.createLPObject(this.AttackUnit, Point2D.create(45, 360), 0);
            this.AttackUnit.stopsim();
            console.log("this.AttackUnit: " +this.AttackUnit);
            console.log(this.AttackUnit);
            //console.log("attackunit isDestroyed: " + this.AttackUnit.isDestroyed());
            
            if(this.FirstAttackUnitwasCreated==true){
                console.log("oldAttackUnit getting destroyed: " + oldAttackUnit);
                //this.getRenderContext().remove(this.AttackUnit);
                //this.AttackUnit.stopsim();
                oldAttackUnit.destroy();
                console.log("oldAttackUnit after getting destroyed: " + oldAttackUnit);
                //console.log(oldAttackUnit);
                //console.log("attackunit isDestroyed: " + this.AttackUnit.isDestroyed());
                //this.AttackUnit=null;
                //console.log(this.AttackUnit);
            }
            this.FirstAttackUnitwasCreated=true;*/
        //}
      },
      
      loadBlocks: function(){
        //console.log("loadBlocks called");
=======
        this.AttackUnitLifes--;
      },
      
      /**
       * Load the construct (Blocks and Plant)
       * @private
       */
      loadBlocks: function(){
>>>>>>> 12a6c858ca3a1f66ff36776792d0e57daca43736
        var JSONString = document.getElementById("storage");
        JSONString=JSONString.innerHTML;
        BlocksInfo=jQuery.parseJSON(JSONString);
        this.OverallNumberOfBlocks=BlocksInfo.OverallNumberOfBlocks;
        this.BlocksArray=BlocksInfo.Blocks;
        
        var LPObjPos = Point2D.create(0, 0);
        for (var i = 0; i < this.OverallNumberOfBlocks+1; i++){
<<<<<<< HEAD
            //console.log(this.BlocksArray[i].PosY);
            LPObjPos.set(this.BlocksArray[i].PosX, this.BlocksArray[i].PosY);
            if(this.BlocksArray[i].Type=="Block")
                LastPlant.createLPObject(Block.create(), LPObjPos, this.BlocksArray[i].Rot);
            else if(this.BlocksArray[i].Type=="Plant")
                LastPlant.createLPObject(Plant.create(), LPObjPos, this.BlocksArray[i].Rot);
        }
        LPObjPos.destroy();

=======
            LPObjPos.set(this.BlocksArray[i].PosX, this.BlocksArray[i].PosY);
            if(this.BlocksArray[i].Type=="Plant")
                LastPlant.createLPObject(Plant.create(), LPObjPos, this.BlocksArray[i].Rot);
            else
                LastPlant.createLPObject(Block.create(this.BlocksArray[i].Type), LPObjPos, this.BlocksArray[i].Rot);
        }
        LPObjPos.destroy();
>>>>>>> 12a6c858ca3a1f66ff36776792d0e57daca43736
      },
      
      
      /**
<<<<<<< HEAD
       * Set up the physical world.  Creates the bounds of the world by establishing
       * walls and a floor.  The actual objects have no visual respresentation but they
       * will exist in the simulation and prevent the LPObjects from leaving the playfield.
=======
       * Set up the physical world.  Creates "invisible walls" to prevent
       * Objects of leaving the canvas
>>>>>>> 12a6c858ca3a1f66ff36776792d0e57daca43736
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
<<<<<<< HEAD
         * Create a LPObject
         * @param LPObjectObject {LPObject} A LPObject object to add to the playfield and simulation
         * @param position: positions the object should be set to
         * @private
         */
        createLPObject: function(LPObjectObject, Position, Rotation) {
  			// Before we create a LPObject, check the engine load.  If it's > 80%
  			// just return.
  			//if (Engine.getEngineLoad() > 0.8) {
  				//return;
  			//}
  			/*if(id==0){
                this.AttackUnit=LPObjectObject;
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
                //LPObjectObject.setRotation(90);
                //console.log("rotation beim createn: " + LPObjectObject.getRotation());
            }*/
    		
            LPObjectObject.setPosition(Position);
            //LPObjectObject.setRot(Rotation*0.017453292519943); //conversion RAD->GRAD
            LPObjectObject.getComponent("physics").setRotation(Rotation*0.017453292519943);
  			
  			
    		// The simulation is used to update the position and rotation
    		// of the physical body.  Whereas the render context is used to 
    		// represent (draw) the shape.
            LPObjectObject.setSimulation(this.simulation);
            this.getRenderContext().add(LPObjectObject);
             
            // Start the simulation of the object so we can apply a force
            LPObjectObject.simulate();
            //LPObjectObject.setRotation(90);
            //console.log("rotation at creation: " + LPObjectObject.getRotation());
            
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
            //p.destroy();
=======
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
>>>>>>> 12a6c858ca3a1f66ff36776792d0e57daca43736
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
<<<<<<< HEAD
      getAttackUnit: function() {
         return this.CurrentAttackUnit;
      },
      getForceSetter: function() {
         return this.forcesetter;
      },
=======
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
>>>>>>> 12a6c858ca3a1f66ff36776792d0e57daca43736
      getAttackUnitLegs: function() {
         return this.AttackUnitLegs;
      }
      
   });
   
   return LastPlant;
   
});
