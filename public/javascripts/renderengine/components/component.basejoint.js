/**
 * The Render Engine
 * BaseJointComponent
 *
 * @fileoverview The base component type for all physical joints which can be used
 * 				  in a {@link Simulation}.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
 * @author: $Author: bfattori $
 * @version: $Revision: 1399 $
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
Engine.include("/components/component.logic.js");
Engine.include("/physics/dynamics/joints/b2JointDef.js");

Engine.initObject("BaseJointComponent", "LogicComponent", function() {

/**
 * @class The base physical joint component which initializes physical joints
 * 		 for use in a {@link Simulation}.  
 *
 * @param name {String} Name of the component
 * @param shapeDef {b2ShapeDef} The shape definition. Either {@link b2CircleDef}, {@link b2BoxDef}, or
 * 			{@link b2PolyDef}.
 *
 * @extends LogicComponent
 * @constructor
 * @description All physical joint components should extend from this component type.
 */
var BaseJointComponent = LogicComponent.extend(/** @scope BaseJointComponent.prototype */{

	jointDef: null,
	simulation: null,
	collideBodies: false,
	joint: null,
	body1: null,
	body2: null,

   /**
    * @private
    */
	constructor: function(name, body1, body2, jointDef) {
		Assert(BaseBodyComponent.isInstance(body1), "Body 1 for joint is not a BaseBodyComponent");
		Assert(BaseBodyComponent.isInstance(body2), "Body 2 for joint is not a BaseBodyComponent");

		this.base(name || "BaseJoint");	

		this.jointDef = jointDef;
		this.simulation = null;
		this.body1 = body1;
		this.body2 = body2;
		
		this.collideBodies = false;
	},

	/**
	 * Start simulating the joint.  If the joint isn't a part of the simulation,
	 * it is added and simulation occurs.
	 */
	startSimulation: function() {
		if (!this.simulation) {
			this.simulation = this.getHostObject().getSimulation();
			this.getJointDef().body1 = this.body1.getBody();
			this.getJointDef().body2 = this.body2.getBody();
			this.getJointDef().collideConnected = this.getCollideBodies();

			this.joint = this.simulation.addJoint(this.getJointDef());
		}
	},
	
	/**
	 * Stop simulating the body.  If the body is a part of a simulation,
	 * it is removed and simulation stops.  The position and rotation of
	 * the body will not be updated.
	 */
	stopSimulation: function() {
		if (this.simulation) {
			this.simulation.removeJoint(this.getJoint());			
			this.simulation = null;
		}
	},
	
	getSimulation: function() {
		return this.simulation;
	},
	
	/**
	 * Get the Box2d joint definition object.
	 * @return {b2JointDef}
	 */
	getJointDef: function() {
		return this.jointDef;
	},

	/**
	 * Get the Box2d joint object.
	 * @return {b2Joint}
	 */
	getJoint: function() {
		return this.joint;
	},

	/**
	 * Get the component which corresponds to body 1 of the joint.
	 * @return {BaseBodyComponent}
	 */
	getBody1: function() {
		return this.body1;
	},

	/**
	 * Get the component which corresponds to body 2 of the joint.
	 * @return {BaseBodyComponent}
	 */
	getBody2: function() {
		return this.body2;
	},
	
	/**
	 * Returns <code>true</code> if the two bodies will check for collisions
	 * with eachother during the simulation.  The default is <code>false</code>.
	 * @return {Boolean}
	 */
	getCollideBodies: function() {
		return this.collideBodies;
	},
	
	/**
	 * Set a flag which determines if the two bodies will collide with eachother
	 * during simulation.  After the simulation has started, you cannot change this
	 * flag without first stopping simulation on the bodies and joint.
	 * 
	 * @param state {Boolean} Set to <code>true</code> to enable collisions between the two
	 * 	bodies.  Default: <code>false</code>
	 */
	setCollideBodies: function(state) {
		this.collideBodies = state;		
	}
	
	/* pragma:DEBUG_START */
	/**
	 * Adds joint debugging
	 * @private
	 */	
	,execute: function(renderContext, time) {
		this.base(renderContext, time);
		if (Engine.getDebugMode()) {
			renderContext.pushTransform();
			renderContext.setLineStyle("red");
			var b1p = Point2D.create(this.getBody1().getPosition());
			var b2p = Point2D.create(this.getBody2().getPosition());
			renderContext.drawLine(b1p, b2p);
			b1p.destroy();
			b2p.destroy();
			
			/*// Draw the anchor point
			var a = Point2D.create(this.anchor);
			a.add(this.getBody1().getPosition());
			renderContext.setFillStyle("green");
			renderContext.drawFilledArc(a, 8, 0, 360);
			a.destroy();
			*/
			renderContext.popTransform();
		}	
	}
	/* pragma:DEBUG_END */
	
}, { /** @scope BaseJointComponent.prototype */

   /**
    * Get the class name of this object
    *
    * @return {String} "BaseJointComponent"
    */
   getClassName: function() {
      return "BaseJointComponent";
   }   
});

return BaseJointComponent;

});