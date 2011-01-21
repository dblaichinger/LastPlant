/**
 * The Render Engine
 * BaseBodyComponent
 *
 * @fileoverview The base component type for all physical bodies which can be used
 * 				  in a {@link Simulation}.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
 * @author: $Author: bfattori $
 * @version: $Revision: 1402 $
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

// Includes
Engine.include("/engine/engine.math2d.js");
Engine.include("/components/component.transform2d.js");
Engine.include("/physics/dynamics/b2BodyDef.js");

Engine.initObject("BaseBodyComponent", "Transform2DComponent", function() {

/**
 * @class The base rigid body component which initializes rigid bodies
 * 		 for use in a {@link Simulation}.  
 *
 * @param name {String} Name of the component
 * @param shapeDef {b2ShapeDef} The shape definition. Either {@link b2CircleDef}, {@link b2BoxDef}, or
 * 			{@link b2PolyDef}.
 *
 * @extends Transform2DComponent
 * @constructor
 * @description All physical body components should extend from this component type
 * 				 to inherit such values as density and friction, and gain access to position and rotation.
 */
var BaseBodyComponent = Transform2DComponent.extend(/** @scope BaseBodyComponent.prototype */{

	bodyDef: null,
	shapeDef: null,
	simulation: null,
	body: null,
	rotVec: null,
	bodyPos: null,
	renderComponent: null,
	origin: null,

   /**
    * @private
    */
	constructor: function(name, shapeDef) {
		this.base(name || "BaseBody");	

		this.shapeDef = shapeDef;
		this.shapeDef.restitution = BaseBodyComponent.DEFAULT_RESTITUTION;
		this.shapeDef.density = BaseBodyComponent.DEFAULT_DENSITY;
		this.shapeDef.friction = BaseBodyComponent.DEFAULT_FRICTION;
		this.simulation = null;
		this.rotVec = Vector2D.create(0,0);
		this.bodyPos = Point2D.create(0,0);
		this.origin = Point2D.create(0,0);
	},

	destroy: function() {
		if (this.renderComponent != null) {
			this.renderComponent.destroy();
		}
		
		this.rotVec.destroy();
		this.bodyPos.destroy();
		this.origin.destroy();
		
		this.base();
	},
	
	release: function() {
		this.base();

		this.rotVec = null;
		this.bodyPos = null;
		this.origin = null;
	},

	/**
	 * Start simulating the body.  If the body isn't a part of the simulation,
	 * it is added and simulation occurs.  Position and rotation will be updated.
	 */
	startSimulation: function() {
		if (!this.simulation) {
			this.simulation = this.getHostObject().getSimulation();
			this.body = this.simulation.addBody(this.getBodyDef());
		}
	},
	
	/**
	 * Stop simulating the body.  If the body is a part of a simulation,
	 * it is removed and simulation stops.  The position and rotation of
	 * the body will not be updated.
	 */
	stopSimulation: function() {
		if (this.simulation) {
			this.simulation.removeBody(this.getBody());			
			this.simulation = null;
		}
	},

	/**
	 * Set the associated render component for this body.  This is typically used by the
	 * {@link PhysicsActor} to link a body to a renderer so that each body can have an
	 * associated renderer applied.
	 * 
	 * @param renderComponent {RenderComponent} The render component to associate with this body
	 */
	setRenderComponent: function(renderComponent) {
		this.renderComponent = renderComponent;
		if (renderComponent != null) {
			this.renderComponent.setHostObject(this.getHostObject());
		}
	},
	
	/**
	 * Get the associated render component for this body.
	 * @return {RenderComponent} or <code>null</code>
	 */
	getRenderComponent: function() {
		return this.renderComponent;
	},
	
	/**
	 * Set the origin of the rigid body.  By default, the origin is the top left corner of
	 * the bounding box for the body.  Most times the origin should be set to the center
	 * of the body.
	 * 
	 * @param x {Number|Point2D} The X coordinate or a <tt>Point2D</tt>
	 * @param y {Number} The Y coordinate or <tt>null</tt> if X is a <tt>Point2D</tt>
	 */
	setLocalOrigin: function(x, y) {
		this.origin.set(x, y);
	},
	
	/**
	 * Get the local origin of the body.
	 * @return {Point2D}
	 */
	getLocalOrigin: function() {
		return this.origin;
	},
	
	/**
	 * Get the center of the body.
	 * @return {Point2D}
	 */
	getCenter: function() {
		return Point2D.create(this.getPosition()).add(this.getLocalOrigin());
	},
	
	/**
	 * [ABSTRACT] Get a box which bounds the body.
	 * @return {Rectangle2D}
	 */
	getBoundingBox: function() {
		return Rectangle2D.create(0,0,1,1);
	},
	
	/**
	 * Get the Box2d shape definition object.
	 * @return {b2ShapeDef}
	 */
	getShapeDef: function() {
		return this.shapeDef;
	},
	
	/**
	 * Get the Box2d body definition object.
	 * @return {b2BodyDef}
	 */
	getBodyDef: function() {
		if (this.bodyDef == null) {
			this.bodyDef = new b2BodyDef();
			this.bodyDef.AddShape(this.shapeDef);
		}
		return this.bodyDef;
	},
	
	/**
	 * Get the Box2d body object which was added to the simulation.
	 * @return {b2Body}
	 */
	getBody: function() {
		return this.body;
	},
	
	/**
	 * Set the resitution (bounciness) of the body.  The value should be between
	 * zero and one.  Values higher than one are accepted, but produce objects which
	 * are unrealistically bouncy.
	 * 
	 * @param restitution {Number} A value between 0.0 and 1.0
	 */
	setRestitution: function(restitution) {
		this.shapeDef.resitution = restitution
	},
	
	/**
	 * Get the resitution (bounciness) value for the body.
	 * @return {Number}
	 */
	getRestitution: function() {
		return this.shapeDef.resitution;
	},
	
	/**
	 * Set the density of the body.
	 * 
	 * @param density {Number} The density of the body
	 */
	setDensity: function(density) {
		this.shapeDef.density = density;
	},
	
	/**
	 * Get the density of the body.
	 * @return {Number}
	 */
	getDensity: function() {
		return this.shapeDef.density;
	},
	
	/**
	 * Set the friction of the body.  Lower values slide easily across other bodies.
	 * Higher values will cause a body to stop moving as it slides across other bodies.
	 * However, even a body which has high friction will keep sliding across a body
	 * with no friction.
	 * 
	 * @param friction {Number} The friction of the body
	 */
	setFriction: function(friction) {
		this.shapeDef.friction = friction;
	},
	
	/**
	 * Get the friction of the body.
	 * @return {Number}
	 */
	getFriction: function() {
		return this.shapeDef.friction;
	},
	
	/**
	 * Set the initial position of the body.  Once a body is in motion, updating
	 * its position should be avoided since it doesn't fit with physical simulation.
	 * To change an object's position, try applying forces or impulses to the body.
	 * 
	 * @param point {Point2D} The initial position of the body
	 */
	setPosition: function(point) {
		var pos = point.get();
		this.getBodyDef().position.Set(pos.x, pos.y);
	},
    //rotation hack
    setRotation: function(angle) {
        this.getBodyDef().rotation=angle;
        //console.log("setrot getting called");
    },
    //rotation hack2
    getRotationRAD: function() {
		return this.getBodyDef().rotation;
	},
    //AngVelo hack
    getAngVelocity: function() {
		return this.getBody().m_angularVelocity;
	},
    //LinVelo hack 
    getLinVelocity: function() {
		return this.getBody().m_linearVelocity;
	},
      
    
	/**
	 * Get the position of the body during simulation.  This value is updated
	 * as the simulation is stepped.
	 * @return {Point2D}
	 */
	getPosition: function() {
		if (this.simulation) {
			this.bodyPos.set(this.body.m_position.x, this.body.m_position.y);
		} else {
			this.bodyPos.set(this.getBodyDef().position.x, this.getBodyDef().position.y);
		}
		return this.bodyPos;	
	},
	
	/**
	 * Get the rotation of the body during simulation.  This value is updated
	 * as the simulation is stepped.
	 * @return {Number}
	 */
	getRotation: function() {
        var rC = this.getBody().GetRotationMatrix().col1;
		this.rotVec.set(rC.x, rC.y);
		var cV = rC.x > 0 ? BaseBodyComponent.UP_VECTOR : BaseBodyComponent.DOWN_VECTOR;
		var md = rC.x > 0 ? 0 : 180;
		var ab = this.rotVec.angleBetween(cV) - md;
		return ab - 90;
	},
	
	/**
	 * Apply a force to the body.  Forces are comprised of a force vector and
	 * a position.  The force vector is the direction in which the force is
	 * moving, while the position is where on the body the force is acting.
	 * Forces act upon a body from world coordinates.
	 * 
	 * @param forceVector {Vector2D} The force vector
	 * @param position {Point2D} The position where the force is acting upon the body
	 */
	applyForce: function(forceVector, position) {
		this.getBody().WakeUp();
		var f = forceVector.get();
		var d = position.get();
		var fv = new b2Vec2(f.x, f.y);
		var dv = new b2Vec2(d.x, d.y);
		this.getBody().ApplyForce(fv, dv);	
	},
	
	/**
	 * Apply an impulse to the body.  Impulses are comprised of a force vector and
	 * a position.  The impulse vector is the direction of the impulse, while the position
	 * is where on the body the impulse will be applied.
	 * Impulses act upon a body locally, adjusting its velocity.
	 * 
	 * @param impulseVector {Vector2D} The impulse vectory
	 * @param position {Point2D} the position where the impulse is originating from in the body
	 */
	applyImpulse: function(impulseVector, position) {
		this.getBody().WakeUp();
		var i = impulseVector.get();
		var d = position.get();
		var iv = new b2Vec2(i.x, i.y);
		var dv = new b2Vec2(d.x, d.y);
		this.getBody().ApplyImpulse(iv, dv);
	},
	
	/**
	 * Apply torque to the body.
	 * 
	 * @param torque {Number} The amount of torque to apply to the body
	 */
	applyTorque: function(torque) {
		this.getBody().WakeUp();
		this.getBody().ApplyTorque(torque);
	},
	
	/**
	 * Get the computed mass of the body.
	 * @return {Number} The mass of the body
	 */
	getMass: function() {
		return this.getBody().getMass();
	},
	
	/**
	 * Returns <code>true</code> if the body is static.  A body is static if it
	 * isn't updated part of the simulation during contacts.
	 * @return {Boolean}
	 */
	isStatic: function() {
		return this.getBody().IsStatic();	
	},
	
	/**
	 * Returns <code>true</code> if the body is sleeping.  A body is sleeping if it
	 * has settled to the point where no movement is being calculated.  If you want
	 * to perform an action upon a body, other than applying force, torque, or impulses,
	 * you must call {@link #wakeUp}.
	 * @return {Boolean}
	 */
	isSleeping: function() {
		return this.getBody().IsSleeping();	
	},
	
	/**
	 * Returns <code>true</code> if the body is frozen.  A frozen body can still be
	 * collided with, but will not, itself, be updated.  Once a body is frozen, it cannot
	 * be moved again.  See {@link #freeze}.
	 * @return {Boolean}
	 */
	isFrozen: function() {
		return this.getBody().IsFrozen();	
	},
	
	/**
	 * Wake up a body, adding it back into the collection of bodies being simulated.
	 * Acting upon a body without first waking it up will do nothing.
	 */
	wakeUp: function() {
		this.getBody().WakeUp();
	},
	
	/**
	 * Freeze a body, permanently taking it out of simulation, except for collisions.
	 */
	freeze: function() {
		this.getBody().Freeze();	
	}
	
	
}, { /** @scope BaseBodyComponent.prototype */

   /**
    * Get the class name of this object
    *
    * @return {String} "BaseBodyComponent"
    */
   getClassName: function() {
      return "BaseBodyComponent";
   },
	
	/**
	 * The default restitution (bounciness) of a body
	 */
	DEFAULT_RESTITUTION: 0.48,
	
	/**
	 * The default density of a body
	 */
	DEFAULT_DENSITY: 1.0,
	
	/**
	 * The default friction of a body
	 */
	DEFAULT_FRICTION: 0,
	
	/**
	 * A simple up (0, -1) vector to calculate rotation
	 * @private
	 */
	UP_VECTOR: new Vector2D(0, -1),
	DOWN_VECTOR: new Vector2D(0, 1)
   
});

return BaseBodyComponent;

});