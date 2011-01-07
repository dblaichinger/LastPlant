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

// Load engine objects
Engine.include("/components/component.sprite.js");
Engine.include("/components/component.collider.js");
Engine.include("/objects/object.physicsactor.js");
//Engine.include("/components/component.mover2d.js");

Engine.initObject("LPObject", "PhysicsActor", function() {

 /**
  * @class Base class for LPObjects which can be added to the playfield.  Each LPObject
  *			 which extends from this must implement {@link #createPhysicalBody}
  *			 to generate the physical representation of the LPObject.
  *
  * @param spriteResource {String} The resource where the two sprites are found
  * @param spriteName {String} The name of the sprite, in the resource, that represents the default LPObject image
  * @param spriteOverName {String} The name of the sprite, in the resource, for when the mouse is over the LPObject
  * @extends PhysicsActor
  * @description Base class for a physical LPObject object
  * @constructor
  */
 var LPObject = PhysicsActor.extend(/** @scope LPObject.prototype */{

    sprites: null,
	renderScale: 1,
    rotation: null,
    LPOType: null,
    Collider: null,

	/**
	 * @private
	 */
    constructor: function(spriteResource, spriteName, spriteOverName) {
      this.base("PhysicsLPObject");
      this.sprite = null;
      this.renderScale = 1;//(Math2.random() * 1) + 0.8;
      
      // Add components to draw and collide with the player
      this.Collider = ColliderComponent.create("collide", LastPlant.cModel);
      this.add(this.Collider);


       
      // Create the physical body object which will move the LPObject object
      this.createPhysicalBody("physics", this.renderScale);
      this.getComponent("physics").setScale(this.renderScale);
      this.getComponent("physics").setRenderComponent(SpriteComponent.create("draw"));

      // Add move component
      //this.add(Mover2DComponent.create("move"));       //versuch für rotation
      
      // The sprites
      this.sprites = [];
      this.sprites.push(LastPlant.spriteLoader.getSprite(spriteResource, spriteName));
      this.sprites.push(LastPlant.spriteLoader.getSprite(spriteResource, spriteOverName));
      this.setSprite(0);
      
      // Set the starting position of the LPObject
      this.setPosition(Point2D.create(0, 0));
    },

	/**
	 * [ABSTRACT] Create the physical body component and assign it to the
	 * LPObject.
	 *
	 * @param componentName {String} The name assigned to the component by this class.
	 * @param scale {Number} A scalar scaling value for the LPObject
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
    
    getLPOType: function() {
       return this.LPOType;
    },
    /**
     * Set, or initialize, the position of the "physics" component
     *
     * @param point {Point2D} The position to draw the LPObject in the playfield
     */
    setPosition: function(point) {
       this.base(point);
       this.getComponent("physics").setPosition(point);
    },
    getPos: function() {
       return this.getComponent("physics").getPosition();
    },
    getRot: function() {
       return this.getComponent("physics").getRotation();
    },
    
    setRot: function(angle) {
       //console.log("rotation SOLL werden: " + degrees);
       //this.getComponent("physics").setRotation(degrees)
       //this.setRotation(degrees);
       //console.log("rotation IST danach: " + this.getComponent("physics").getRotation());
       this.rotation=angle;
       //this.getComponent("physics").setRotation(angle);
    },
    stopsim: function() {
       this.getComponent("physics").stopSimulation();
    },    
    startsim: function() {
       this.getComponent("physics").startSimulation();
    },    
	/**
	 * Apply a force to the physical body.
	 *
	 * @param amt {Vector2D} The force vector (direction of the force) to apply to the LPObject.
	 * @param loc {Point2D} The location at which the force is applied to the LPObject.
	 */
	applyForce: function(amt, loc) {
		this.getComponent("physics").applyForce(amt, loc);
	},

    /**
     * @param p {Point2D} The position where the mouse currently resides
     */
    clicked: function(p) {
  		/*var force = Vector2D.create(p).sub(this.getPosition()).mul(20000);
         this.applyForce(force, p);
  		force.destroy();*/
  		
  		// this.stopsim();
  		// this.setPosition(p);
  		
  		// this.setRot(90);
  		
    },
		
	/**
	 * called when button released
	 */
	released: function(p) {
	    //console.log("rotation wurde: " + this.getComponent("physics").getRotation());
        // this.startsim();
        //console.log("rotation wurde nach start: " + this.getRotation());
	    /*this.getComponent("physics").setRotation(this.rot);*/
	},

    /**
     * Determine if the LPObject was touched by the player and, if so,
     * change the sprite which represents it.
     */
    onCollide: function(obj) {
       if (Player.isInstance(obj) &&
          (this.getWorldBox().isIntersecting(obj.getWorldBox() ))) {
          this.setSprite(1);
          return ColliderComponent.STOP;
       }
       
       this.setSprite(0);
       return ColliderComponent.CONTINUE;
    },
    
    getWorldBox: function() {
        //var bBox = this.base();
        //console.log(bBox);
        //bBox.setRotation(this.getRot());
        //return bBox;
        
        var pos=this.getComponent("physics").getPosition();
        var bBox = Rectangle2D.create(pos.x,pos.y,10,10);
        return bBox.offset(-bBox.getHalfWidth(), -bBox.getHalfHeight());
        
        //var bBox = this.getComponent("physics").getBoundingBox();
        //console.log(bBox);
        //return bBox.offset(-bBox.getHalfWidth(), -bBox.getHalfHeight());
    },


    }, /** @scope LPObject.prototype */{ // Static
    
    /**
     * Get the class name of this object
     * @return {String} The string <tt>LPObject</tt>
     */
    getClassName: function() {
       return "LPObject";
      }
      
    });

return LPObject;

});