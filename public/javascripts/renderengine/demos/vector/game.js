
/**
 * The Render Engine
 * Example Game: Spaceroids - an Asteroids clone
 *
 * This is an example of using The Render Engine to create a simple
 * game.  This game is based off of the popular vector shooter, Asteroids,
 * which is (c)Copyright 1979 - Atari Corporation.
 *
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

// Load required engine components
Engine.include("/rendercontexts/context.canvascontext.js");
Engine.include("/spatial/container.spatialgrid.js");
Engine.include("/engine/engine.timers.js");
Engine.include("/textrender/text.vector.js");
Engine.include("/textrender/text.renderer.js");
Engine.include("/resourceloaders/loader.sound.js");

// Load game objects
Game.load("/rock.js");
Game.load("/player.js");
Game.load("/bullet.js");
Game.load("/particle.js");

Engine.initObject("Spaceroids", "Game", function() {

/**
 * @class The game.
 */
var Spaceroids = Game.extend({

   constructor: null,

   renderContext: null,

   fieldBox: null,
   centerPoint: null,
   areaScale: $.browser.Wii ? 0.7 : 1,

   engineFPS: 30,

   collisionModel: null,

   rocks: 0,

   fieldWidth: 500,
   fieldHeight: 580,

   hiScore: 0,
   playerScore: 0,

   debug: true,

   scoreObj: null,
   hscoreObj: null,
   playerObj: null,

   showStart: false,

   pEngine: null,

   level: 0,

   titlePos: null,
   
   rec: false,
   play: false,

   /**
    * Handle the keypress which starts the game
    *
    * @param event {Event} The event object
    */
   onKeyPress: function(event) {
      if (event.keyCode == EventEngine.KEYCODE_ENTER ||
          event.keyCode == 65 || event.keyCode == 97)
      {
         Spaceroids.startGame();
      }
   },

   /**
    * Clean up the playfield, removing any objects that are
    * currently within the render context.  Used to initialize the game
    * and to handle transitions between attract mode and play mode.
    */
   cleanupPlayfield: function() {

      // Remove any rocks still floating around
      var objs = this.renderContext.getObjects();
      while (objs.length > 0)
      {
         objs.shift().destroy();
      }

      this.rocks = 0;
      this.level = 0;

      this.scoreObj = null;
      this.hscoreObj = null;
   },

   /**
    * A simple mode where the title, highscore, game over message,
    * and start message are displayed with asteroids in the background
    */
   attractMode: function() {
      var titlePos = Point2D.create(150, 100);
      var copyPos = Point2D.create(160, 570);
      this.cleanupPlayfield();
      Spaceroids.isAttractMode = true;

      var pWidth = this.fieldWidth;
      var pHeight = this.fieldHeight;

      // Add some asteroids
      for (var a = 0; a < 3; a++)
      {
         var rock = SpaceroidsRock.create(null, null, pWidth, pHeight);
         this.renderContext.add(rock);
         rock.setup();
         rock.killTimer = Engine.worldTime + 2000;
      }

      var title = TextRenderer.create(VectorText.create(), "Asteroids", 2);
      title.setPosition(titlePos);
      title.setColor("#ffffff");
      this.renderContext.add(title);

      var copy = TextRenderer.create(VectorText.create(), "&copy;2009 Brett Fattori", 0.6);
      copy.setColor("#ffffff");
      copy.setPosition(copyPos);
      this.renderContext.add(copy);

      // Instructions
      var instruct = "left/right arrows to turn\nup arrow to thrust\nZ to fire missile\nA to hyperjump\nENTER to detonate nuke\n";
		instruct += EngineSupport.sysInfo().OS + " " + EngineSupport.sysInfo().browser + " " + EngineSupport.sysInfo().version;
		
      var inst = TextRenderer.create(VectorText.create(), instruct, 0.8);
      inst.setColor("#00ff00");
      inst.setPosition(Point2D.create(130, 485));
      this.renderContext.add(inst);

      var startText;
      startText = "[ Press =Enter= to Start ]";

		var evolved = TextRenderer.create(VectorText.create(), "Evolution", 1);
		evolved.setColor("#ff0000");
		evolved.setPosition(Point2D.create(290, 120));
		this.renderContext.add(evolved);

      Spaceroids.start = TextRenderer.create(VectorText.create(), startText, 1);
      Spaceroids.start.setPosition(Point2D.create(96, 450));
      Spaceroids.start.setColor("#ffffff");
      Spaceroids.renderContext.add(Spaceroids.start);

      var flash = function() {
         if (!Spaceroids.showStart)
         {
            Spaceroids.start.setDrawMode(TextRenderer.DRAW_TEXT);
            Spaceroids.showStart = true;
            Spaceroids.intv.restart();
         }
         else
         {
            Spaceroids.start.setDrawMode(TextRenderer.NO_DRAW);
            Spaceroids.showStart = false;
            Spaceroids.intv.restart();
         }
      };

      Spaceroids.intv = Timeout.create("startkey", 1000, flash);

      // Start up a particle engine
      this.pEngine = ParticleEngine.create();
      
      if (EngineSupport.sysInfo().browser == "chrome") {
         // Chrome can handle a lot of particles
         this.pEngine.setMaximum(5000);
      }
      
      this.renderContext.add(this.pEngine);

      this.addHiScore();
      this.gameOver();

      // Create a new rock every 20 seconds
      Spaceroids.attractTimer = Interval.create("attract", 20000,
         function() {
            var rock = SpaceroidsRock.create(null, null, Spaceroids.fieldWidth, Spaceroids.fieldHeight);
            Spaceroids.renderContext.add(rock);
            rock.setup();
            rock.killTimer = Engine.worldTime + 2000;
         });

   },

   /**
    * Add the highscore object to the playfield.
    */
   addHiScore: function() {
      this.hscoreObj = TextRenderer.create(VectorText.create(), this.hiScore, 2);
      this.hscoreObj.setPosition(Point2D.create(400, 20));
      this.hscoreObj.setColor("#ffffff");
      this.hscoreObj.setTextWeight(0.5);
      this.hscoreObj.setTextAlignment(AbstractTextRenderer.ALIGN_RIGHT);
      this.renderContext.add(this.hscoreObj);
   },

   /**
    * Add the score object to the playfield.
    */
   addScore: function() {
      this.scoreObj = TextRenderer.create(VectorText.create(), this.playerScore, 2);
      this.scoreObj.setPosition(Point2D.create(130, 20));
      this.scoreObj.setColor("#ffffff");
      this.scoreObj.setTextWeight(0.5);
      this.scoreObj.setTextAlignment(AbstractTextRenderer.ALIGN_RIGHT);
      this.renderContext.add(this.scoreObj);
   },

   /**
    * Called to add points to the player's score.
    *
    * @param howMany {Number} The number of points to add to the player's score.
    */
   scorePoints: function(howMany) {
      this.playerScore += howMany;
      if (this.playerScore > this.hiScore)
      {
         this.hiScore = this.playerScore;
         this.hscoreObj.setText(this.hiScore);
      }

      this.scoreObj.setText(this.playerScore);
   },

   recordDemo: function() {
      Spaceroids.rec = true;
      Spaceroids.demoScript = {};
      Spaceroids.demoScript.seed = Math2.randomInt();
      
      Math2.seed(Spaceroids.demoScript.seed);
      Spaceroids.startGame();
   },
   
   playDemo: function() {
      Spaceroids.play = true;
      var demoMode = Spaceroids.demoModes[0];
      Math2.seed(demoMode.seed);
      this.startGame();
      this.playerObj.getComponent("input").playScript(demoMode.player);
   },

   /**
    * Start the game, resetting the playfield and creating the player.
    * If the game is already running, has no effect.
    */
   startGame: function() {

      if (this.gameRunning)
      {
         return;
      }

      this.gameRunning = true;

      if (!Spaceroids.rec && !Spaceroids.play) {
         Spaceroids.attractTimer.destroy();
         Spaceroids.isAttractMode = false;
   
         Spaceroids.intv.destroy();
      }

      this.playerScore = 0;
      this.cleanupPlayfield();

      var pWidth = this.fieldWidth;
      var pHeight = this.fieldHeight;

      this.nextLevel();

      this.playerObj = SpaceroidsPlayer.create();
      this.renderContext.add(this.playerObj);
      this.playerObj.setup(pWidth, pHeight);

      // Start up a particle engine
      this.pEngine = ParticleEngine.create();
      if (EngineSupport.sysInfo().browser == "chrome") {
         // Chrome can handle a LOT!
         this.pEngine.setMaximum(5000);
      }
      this.renderContext.add(this.pEngine);

      this.addHiScore();
      this.addScore();
      this.scorePoints(0);

      // Start the "music" track
      Spaceroids.soundNum = 1;
      Spaceroids.gameSound = Interval.create("gameSound", 1000, function() {
         if (Spaceroids.soundNum == 1) {
            Spaceroids.soundLoader.get("lowboop").play();
            Spaceroids.soundNum = 2;
         } else {
            Spaceroids.soundLoader.get("hiboop").play();
            Spaceroids.soundNum = 1;
         }
      });
   },

	/**
	 * Advance to next level
	 */
   nextLevel: function() {
      Spaceroids.level++;

      if (Spaceroids.level > 7) {
         Spaceroids.level = 7;
      }

      // Add some asteroids
      var pWidth = this.fieldWidth;
      var pHeight = this.fieldHeight;
      if (this.playerObj) {
     		// Max of 3 nukes
         this.playerObj.nukes++;
         this.playerObj.nukes = this.playerObj.nukes > 3 ? 3 : this.playerObj.nukes;
      }

      for (var a = 0; a < Spaceroids.level + 1; a++)
      {
         var rock = SpaceroidsRock.create(null, null, pWidth, pHeight);
         this.renderContext.add(rock);
         rock.setup();
      }
   },

   /**
    * Called when the game is over to draw the game over message and
    * set a timer to return to attract mode.
    */
   gameOver: function() {

      if (Spaceroids.rec) {
         this.playerObj.getComponent("input").stopRecording();
         Spaceroids.demoScript.player = this.playerObj.getComponent("input").getScript();
         console.debug(JSON.stringify(Spaceroids.demoScript));
         return;  
      }

      var g = TextRenderer.create(VectorText.create(), "Game Over", 3);
      g.setPosition(Point2D.create(100, 260));
      g.setTextWeight(0.8);
      g.setColor("#ffffff");
      this.renderContext.add(g);

      if (!this.gameRunning)
      {
         return;
      }

      Spaceroids.gameSound.destroy();

      this.gameRunning = false;

      // Remove the player
      if (this.playerObj)
      {
         this.playerObj.destroy();
      }

      // Back to attract mode in 10sec
      var t = Timeout.create("gameover", 10000, function() { Spaceroids.attractMode(); });
   },

   /**
    * Called to set up the game, download any resources, and initialize
    * the game to its running state.
    */
   setup: function() {
      Engine.setFPS(this.engineFPS);

      // Create the 2D context
      this.fieldBox = Rectangle2D.create(0, 0, this.fieldWidth, this.fieldHeight);
      this.centerPoint = this.fieldBox.getCenter();
      this.renderContext = CanvasContext.create("playfield", this.fieldWidth, this.fieldHeight);
      this.renderContext.setWorldScale(this.areaScale);
      Engine.getDefaultContext().add(this.renderContext);
      this.renderContext.setBackgroundColor("#000000");

      // We'll need something to detect collisions
      this.collisionModel = SpatialGrid.create(this.fieldWidth, this.fieldHeight, 5);
      this.collisionModel.setAccuracy(SpatialGrid.BEST_ACCURACY);

      // Prepare for keyboard input to start the game
      EventEngine.setHandler(document, "keypress", Spaceroids.onKeyPress);

      // Load the sounds
      this.soundLoader = SoundLoader.create();
      this.soundLoader.load("explode", this.getFilePath("resources/explode1.mp3"));
      this.soundLoader.load("shoot", this.getFilePath("resources/shoot.mp3"));
      this.soundLoader.load("death", this.getFilePath("resources/explode2.mp3"));
      this.soundLoader.load("thrust", this.getFilePath("resources/thrust.mp3"));
      this.soundLoader.load("lowboop", this.getFilePath("resources/low.mp3"));
      this.soundLoader.load("hiboop", this.getFilePath("resources/hi.mp3"));

      // Demo recording and playback
      if (EngineSupport.checkBooleanParam("record")) {
         Spaceroids.recordDemo();
         return;
      }
      
      if (EngineSupport.checkBooleanParam("playback")) {
         Spaceroids.playDemo();
         return;
      }
      
      // Go into attract mode
      Spaceroids.attractMode();
   },

   /**
    * Called when the game is being shut down to allow the game
    * the chance to clean up any objects, remove event handlers, and
    * destroy the rendering context.
    */
   teardown: function() {
      this.scoreObj = null;
      this.hscoreObj = null;

      EventEngine.removeHandler(document, "keypress", Spaceroids.onKeyPress);

      this.renderContext.destroy();
   },
   
   /**
    * Cause the playfield to flash
    */
   blinkScreen: function(color) {
      if (!Spaceroids.isAttractMode) {
         $(this.renderContext.getSurface()).css("background", color || "white");
         var surf = this.renderContext.getSurface();
         OneShotTimeout.create("blink", 100, function() {
            $(surf).css("background", "black");
         });
      }
   },

   /**
    * A simple method that determines if the position is within the supplied bounding
    * box.
    *
    * @param pos {Point2D} The position to test
    * @param bBox {Rectangle2D} The bounding box of the playfield
    * @type Boolean
    */
   inField: function(pos, bBox) {
      var p = Point2D.create(pos);
      var newPos = this.wrap(p, bBox);
      var b = newPos.equals(pos);
      p.destroy();
      return b;
   },

   /**
    * Called to wrap an object around the edges of the playfield.
    *
    * @param pos {Point2D} The position of the object
    * @param bBox {Rectangle2D} The bounding box of the playfield
    */
   wrap: function(pos, bBox) {

      var rX = bBox.len_x();
      var rY = bBox.len_y();

      // Wrap if it's off the playing field
      var x = pos.x;
      var y = pos.y;
      var fb = this.renderContext.getViewport().get();

      if (pos.x < fb.x || pos.x > fb.r ||
          pos.y < fb.y || pos.y > fb.b)
      {
         if (pos.x > fb.r + rX)
         {
            x = (fb.x - (rX - 1));
         }
         if (pos.y > fb.b + rY)
         {
            y = (fb.y - (rY - 1));
         }
         if (pos.x < fb.x - rX)
         {
            x = (fb.r + (rX - 1));
         }
         if (pos.y < fb.y - rY)
         {
            y = (fb.b + (rY - 1));
         }
         pos.set(x,y);
      }
      return pos;
   },
   
   demoModes: [
      {"seed":3880520576,"player":[{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":1391,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":560,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":33,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":33,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":33,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":44,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":33,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":33,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":32,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":32,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":32,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":32,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":32,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":32,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":32,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":32,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":31,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":0,"type":"keyup"},{"shiftKey":false,"ctrlKey":true,"keyCode":17,"delay":326,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":17,"delay":115,"type":"keyup"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":1301,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":388,"type":"keyup"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":252,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":129,"type":"keyup"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":97,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":495,"type":"keyup"},{"shiftKey":false,"ctrlKey":true,"keyCode":17,"delay":964,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":17,"delay":127,"type":"keyup"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":860,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":541,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":63,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":28,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":56,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":28,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":27,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":27,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":28,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":30,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":29,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":29,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":29,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":59,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":29,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":32,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":0,"type":"keyup"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":220,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":255,"type":"keyup"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":666,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":489,"type":"keyup"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":444,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":128,"type":"keyup"},
      {"shiftKey":false,"ctrlKey":true,"keyCode":17,"delay":421,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":17,"delay":96,"type":"keyup"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":1520,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":587,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":33,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":33,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":33,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":33,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":32,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":26,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":27,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":26,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":26,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":55,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":29,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":30,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":32,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":33,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":0,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":66,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":0,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":32,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":33,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":33,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":33,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":32,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":64,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":30,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":30,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":30,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":60,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":30,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":31,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":31,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":31,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":31,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":31,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":31,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":31,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":33,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":33,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":33,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":33,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":0,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":33,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":32,"type":"keyup"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":428,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":0,"type":"keyup"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":1026,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":350,"type":"keyup"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":384,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":541,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":31,"type":"keyup"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":526,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":32,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":34,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":57,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":31,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":30,"type":"keyup"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":790,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":575,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":29,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":30,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":32,"type":"keyup"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":391,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":223,"type":"keyup"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":3637,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":563,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":31,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":31,"type":"keyup"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":288,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":192,"type":"keyup"},
      {"shiftKey":false,"ctrlKey":true,"keyCode":17,"delay":432,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":17,"delay":59,"type":"keyup"},{"shiftKey":false,"ctrlKey":true,"keyCode":17,"delay":1154,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":17,"delay":82,"type":"keyup"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":625,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":548,"type":"keyup"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":32,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":578,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":0,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":62,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":30,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":30,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":31,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":31,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":31,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":0,"type":"keyup"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":93,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":579,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":30,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":29,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":30,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":0,"type":"keyup"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":60,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":354,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":251,"type":"keyup"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":357,"type":"keyup"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":537,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":343,"type":"keyup"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":1158,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":576,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":31,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":32,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":31,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":31,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":31,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":31,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":32,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":32,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":32,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":32,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":32,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":32,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":31,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":32,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":32,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":33,"type":"keyup"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":293,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":566,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":31,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":31,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":33,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":34,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":34,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":33,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":34,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":33,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":33,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":0,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":132,"type":"keyup"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":336,"type":"keyup"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":530,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":297,"type":"keyup"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":0,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":246,"type":"keyup"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":488,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":35,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":0,"type":"keyup"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":0,"type":"keydown"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":555,"type":"keyup"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":395,"type":"keyup"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":0,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":552,"type":"keyup"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":602,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":39,"delay":410,"type":"keyup"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":0,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":38,"delay":391,"type":"keyup"},
      {"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":33,"type":"keydown"},{"shiftKey":false,"ctrlKey":false,"keyCode":37,"delay":198,"type":"keyup"}]}]

});

return Spaceroids;

});
