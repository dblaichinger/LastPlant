/**
 * The Render Engine
 * RevoluteJointComponent
 *
 * @fileoverview A revolute joint which can be used in a {@link Simulation}.
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
Engine.include("/components/component.basejoint.js");
Engine.include("/physics/dynamics/joints/b2RevoluteJointDef.js");

Engine.initObject("RevoluteJointComponent", "BaseJointComponent", function() {

/**
 * @class A revolute joint which allows two bodies to revolve around a common
 * 		 anchor point in a {@link Simulation}.  
 *
 * @param name {String} Name of the component
 * @param body1 {BaseBodyComponent} The first body for the joint
 * @param body2 {BaseBodyComponent} The second body for the joint
 * @param anchor {Point2D} A point, in world coordinates relative to the two 
 * 	bodies, to use as the joint's anchor point
 *
 * @extends BaseJointComponent
 * @constructor
 * @description Creates a revolute joint between two physical bodies.
 */
var RevoluteJointComponent = BaseJointComponent.extend(/** @scope RevoluteJointComponent.prototype */{

	anchor: null,

   /**
    * @private
    */
	constructor: function(name, body1, body2, anchor) {
		var jointDef = new b2RevoluteJointDef();
		
		this.anchor = Point2D.create(anchor);
		this.base(name || "RevoluteJoint", body1, body2, jointDef);	
	},

	/**
	 * When simulation starts offset the anchor point by the position of rigid body 1 (the "from" body).
	 * @private
	 */
	startSimulation: function() {
		if (!this.getSimulation()) {
			
			var jA = Point2D.create(this.anchor);
			jA.add(this.getBody1().getPosition());
			jA.add(this.getBody1().getLocalOrigin());
			var a = jA.get();
	
			this.getJointDef().anchorPoint.Set(a.x, a.y);
			jA.destroy();
		}		
		
		this.base();
	},
	
	/**
	 * Get the upper limiting angle, in degrees, through which the joint can rotate.
	 * @return {Number}
	 */
	getUpperLimitAngle: function() {
		return Math2D.radToDeg(this.getJointDef().upperAngle);
	},
	
	/**
	 * Set the upper limiting angle through which the joint can rotate.
	 * 
	 * @param angle {Number} An angle in degrees
	 */
	setUpperLimitAngle: function(angle) {
		this.getJointDef().upperAngle = Math2D.degToRad(angle);
		this.getJointDef().enableLimit = true;	
	},
	
	/**
	 * Get the lower limiting angle, in degrees, through which the joint can rotate.
	 * @return {Number}
	 */
	getLowerLimitAngle: function() {
		return Math2D.radToDeg(this.getJointDef().lowerAngle);	
	},
	
	/**
	 * Set the upper limiting angle through which the joint can rotate.
	 * 
	 * @param angle {Number} An angle in degrees
	 */
	setLowerLimitAngle: function(angle) {
		this.getJointDef().lowerAngle = Math2D.degToRad(angle);	
		this.getJointDef().enableLimit = true;	
	},
	
	/**
	 * During simulation, this returns the current angle of the joint
	 * in degrees.  Outside of simulation it will always return zero.
	 * @return {Number}
	 */
	getJointAngle: function() {
		if (this.simulation) {
			return Math2D.radToDeg(this.getJoint().GetJointAngle());
		} else {
			return 0;
		}
	},
	
	/**
	 * Get the torque which will be applied when the joint is used as a motor.
	 * @return {Number} 
	 */
	getMotorTorque: function() {
		if (this.simulation) {
			return this.getJoint().GetMotorTorque(1 / Engine.getFPS());
		} else {
			this.getJointDef().motorTorque;	
		}
	},
	
	/**
	 * Set the torque which is applied via the motor, or to resist forces applied to it.  You can
	 * use this value to simulate joint friction by setting the motor speed to zero
	 * and applying a small amount of torque.  During simulation, the torque is applied directly
	 * to the joint.
	 * 
	 * @param torque {Number} The amount of torque to apply
	 */
	setMotorTorque: function(torque) {
		if (this.simulation) {
			// Apply directly to the joint
			this.getJoint().SetMotorTorque(torque);
		} else {
			// Apply to the joint definition
			this.getJointDef().motorTorque = torque;
			this.getJointDef().enableMotor = true;	
		}
	},
	
	/**
	 * Get the speed of the motor.  During simulation, the value returned is the
	 * joint's speed, not the speed set for the motor.
	 * @return {Number}
	 */
	getMotorSpeed: function() {
		if (this.simulation) {
			return this.getJoint().GetJointSpeed();	  
		} else {
			return this.getJointDef().motorSpeed;	
		}
	},
	
	/**
	 * Set the speed of the motor applied to the joint.
	 * 
	 * @param speed {Number} The speed of the motor
	 */
	setMotorSpeed: function(speed) {
		if (this.simulation) {
			this.getJoint().SetMotorSpeed(speed);			
		} else {
			this.getJointDef().motorSpeed = speed;	
			this.getJointDef().enableMotor = true;	
		}
	},
	
	/**
	 * During simulation, get the reaction force vector of the joint.  Outside
	 * of simulation, the vector will be zero.
	 * @return {Vector2D}
	 */
	getReactionForce: function() {
		if (this.simulation) {
		  	var vec = this.getJoint().GetReactionForce(1 / Engine.getFPS());
		  	return Vector2D.create(vec.x, vec.y);
		} else {
			return Point2D.ZERO;
		} 
	},
	
	/**
	 * During simulation, get the reaction torque.  Outside of simulation, the
	 * torque is zero.
	 * @return {Number}
	 */
	getReactionTorque: function() {
		if (this.simulation) {
			return this.getJoint().GetReactionTorque(1 / Engine.getFPS());
		} else {
			return 0;
		}
	}
	
}, { /** @scope RevoluteJointComponent.prototype */

   /**
    * Get the class name of this object
    *
    * @return {String} "RevoluteJointComponent"
    */
   getClassName: function() {
      return "RevoluteJointComponent";
   }   
});

return RevoluteJointComponent;

});