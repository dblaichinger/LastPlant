/**
 * The Render Engine
 *
 * Simulation object
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
 * @author: $Author: bfattori $
 * @version: $Revision: 1402 $
 *
 * Copyright (c) 2008 Brett Fattori (brettf@renderengine.com)
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

Engine.include("/physics/common/b2Settings.js");
Engine.include("/physics/collision/b2AABB.js");
Engine.include("/physics/dynamics/b2World.js");
Engine.include("/components/component.basebody.js");

Engine.initObject("Simulation", "BaseObject", function() {

   /**
    * @class A representation of a physical world.  This object is used to
    *        introduce Box2dJS physics into your game by creating a world
    *        which supports the physical structures provided by Box2dJS.  You
    *        will need to create a <tt>Simulation</tt> before you can utilize
    *        physics in a game.
    *        <p/>
    *        See either "/demos/physics/" or "/demos/physics2" for examples
    *        of utilizing the <tt>Simulation</tt> object with rigid body components.
    *         
    * @param name {String} The name of the object
    * @param worldBoundary {Rectangle2D} The physical world boundary
    * @param [gravity] {Vector2D} The world's gravity vector. default: [0, 650]
    * @extends BaseObject
    * @constructor
    * @description Create a physical world for Box2dJS
    */
   var Simulation = BaseObject.extend(/** @scope Simulation.prototype */{

      worldAABB: null,
      world: null,
      gravity: null,
      doSleep: true,
      worldBoundary: null,
      integrations: 0,

      constructor: function(name, worldBoundary, gravity) {
         this.base(name);
         this.gravity = gravity || Vector2D.create(0, 650);
         this.worldAABB = new b2AABB();
         
         this.worldBoundary = worldBoundary;
         var wb = worldBoundary.get();
         this.worldAABB.minVertex.Set(-1000, -1000);
         this.worldAABB.maxVertex.Set(2000, 2000);
         this.doSleep = true;
         this.integrations = Simulation.DEFAULT_INTEGRATIONS;

         var g = this.gravity.get();
         var grav = new b2Vec2(g.x, g.y);

         // Create the world
         this.world = new b2World(this.worldAABB, grav, this.doSleep);     
      },
      
      destroy: function() {
         this.worldBoundary.destroy();
         this.gravity.destroy();
         this.base();
      },
      
      release: function() {
         this.worldAABB = null;
         this.gravity = null,
         this.worldBoundary = null;
         this.world = null;
         this.base();
      },
      
      update: function(renderContext, time) {
         this.world.Step(1/Engine.getFPS(), this.integrations);   
      },
      
      /**
       * Support method to get the ground body for the world.
       * @return {b2Body} The world's ground body
       * @private
       */
      getGroundBody: function() {
         return this.world.GetGroundBody();
      },
      
      /**
       * Support method to add a body to the simulation.  The body must be one of the
       * box2d-js body types.  This method is intended to be used by {@link SimulationObject}.
       * 
       * @param b2jsBodyDef {b2BodyDef} A box2d-js Body definition object
       * @private
       */
      addBody: function(b2jsBodyDef) {
         return this.world.CreateBody(b2jsBodyDef);
      },
      
      /**
       * Support method to add a joint to the simulation.  The joint must be one of the
       * box2d-js joint types.  This method is intended to be used by {@link SimulationObject}.
       * 
       * @param b2jsJointDef {b2JointDef} A box2d-js Joint definition object
       * @private
       */
      addJoint: function(b2jsJointDef) {
         return this.world.CreateJoint(b2jsJointDef);
      },
      
      /**
       * Support method to remove a body from the simulation.  The body must be one of the
       * box2d-js body types.  This method is intended to be used by {@link SimulationObject}.
       * 
       * @param b2jsBody {b2Body} A box2d-js Body object
       * @private
       */
      removeBody: function(b2jsBody) {
         this.world.DestroyBody(b2jsBody);
      },
      
      /**
       * Support method to remove a joint from the simulation.  The joint must be one of the
       * box2d-js joint types.  This method is intended to be used by {@link SimulationObject}.
       * 
       * @param b2jsJoint {b2Joint} A box2d-js Joint object
       * @private
       */
      removeJoint: function(b2jsJoint) {
         this.world.DestroyJoint(b2jsJoint);
      },
      
      /**
       * Set the number of integrations per frame.  A higher number will result
       * in more accurate collisions, but will result in slower performance.
       * 
       * @param integrations {Number} The number of integrations per frame
       */
      setIntegrations: function(integrations) {
         this.integrations = integrations || Simulation.DEFAULT_INTEGRATIONS;   
      },
      
      /**
       * Get the number of integrations per frame.
       * @return {Number}
       */
      getIntegrations: function() {
         return this.integrations;   
      },
      
      /**
       * Add a simple box body to the simulation.  The body doesn't have a visual
       * representation, but exists in the simulation and can be interacted with.
       *
       * @param pos {Point2D} The position where the body's top/left is located
       * @param extents {Point2D} The width and height of the body
       * @param properties {Object} An object with up to three properties: <ul>
       * 		<li>restitution - The bounciness of the body</li>
       *			<li>friction - Friction against this body</li>
       *			<li>density - The density of the object, defaults to zero (fixed in place)</li></ul>
       *
       * @return {b2BodyDef} A Box2D-JS body definition object representing the box
       */
      addSimpleBoxBody: function(pos, extents, properties) {
         var e = extents.get(), p = pos.get();
         properties = properties || {};
         
         var boxDef = new b2BoxDef();
         boxDef.extents.Set(e.x, e.y);

			// Set the properties
         boxDef.restitution = properties.restitution || BaseBodyComponent.DEFAULT_RESTITUTION;
			boxDef.friction = properties.friction || BaseBodyComponent.DEFAULT_FRICTION;
			boxDef.density = properties.density || 0;

         var b2body = new b2BodyDef();
         b2body.AddShape(boxDef);
         b2body.position.Set(p.x, p.y);
         return this.addBody(b2body);
      },
      
      /**
       * Add a simple circle body to the simulation.  The body doesn't have a visual
       * representation, but exists in the simulation and can be interacted with.
       *
       * @param pos {Point2D} The position where the body's center is located
       * @param radius {Point2D} The radius of the circle body
       * @param properties {Object} An object with up to three properties: <ul>
       * 		<li>restitution - The bounciness of the body</li>
       *			<li>friction - Friction against this body</li>
       *			<li>density - The density of the object, defaults to zero (fixed in place)</li></ul>
       *
       * @return {b2BodyDef} A Box2D-JS body definition object representing the circle
       */
      addSimpleCircleBody: function(pos, radius, properties) {
         var p = pos.get();
         properties = properties || {};
         
         var circleDef = new b2CircleDef();
         circleDef.radius = radius;

			// Set the properties
         circleDef.restitution = properties.restitution || BaseBodyComponent.DEFAULT_RESTITUTION;
			circleDef.friction = properties.friction || BaseBodyComponent.DEFAULT_FRICTION;
			circleDef.density = properties.density || 0;

         var b2body = new b2BodyDef();
         b2body.AddShape(circleDef);
         b2body.position.Set(p.x, p.y);
         return this.addBody(b2body);
      }
      
   }, /** @scope Simulation.prototype */{
      
      /**
       * Get the class name as a string.
       * @return {String} "Simulation"
       */
      getClassName: function() {
         return "Simulation";
      },
      
      /**
       * The default number of integrations per frame
       */
      DEFAULT_INTEGRATIONS: 10
      
   });

   return Simulation;
   
});
