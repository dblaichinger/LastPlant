/**
 * The Render Engine
 * DistanceJointComponent
 *
 * @fileoverview A distance joint which can be used in a {@link Simulation}.
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
Engine.include("/components/component.basejoint.js");
Engine.include("/physics/dynamics/joints/b2DistanceJointDef.js");

Engine.initObject("DistanceJointComponent", "BaseJointComponent", function() {

/**
 * @class A distance joint which maintains constant distance between two bodies
 * 		 in a {@link Simulation}.  
 *
 * @param name {String} Name of the component
 * @param body1 {BaseBodyComponent} The first body for the joint
 * @param body2 {BaseBodyComponent} The second body for the joint
 *
 * @extends BaseJointComponent
 * @constructor
 * @description Creates a distance joint between two physical bodies.  The distance can
 * 				 be softened by adjusting the frequency and the damping ratio of the joint.
 * 				 Rotation is not limited by this joint.  The anchors for the joint are the
 * 				 rigid body center's.
 */
var DistanceJointComponent = BaseJointComponent.extend(/** @scope DistanceJointComponent.prototype */{

   /**
    * @private
    */
	constructor: function(name, body1, body2) {
		var jointDef = new b2DistanceJointDef();
		this.base(name || "DistanceJoint", body1, body2, jointDef);	
	},
	
	/**
	 * When simulation starts set the anchor points to the position of each rigid body.
	 * @private
	 */
	startSimulation: function() {
		if (!this.getSimulation()) {
			var a1 = Point2D.create(this.getBody1().getPosition());
			var a2 = Point2D.create(this.getBody2().getPosition());
			a1.add(this.getBody1().getLocalOrigin());
			a2.add(this.getBody2().getLocalOrigin());
	
			this.getJointDef().anchorPoint1.Set(a1.get().x, a1.get().y);
			this.getJointDef().anchorPoint2.Set(a2.get().x, a2.get().y);
			a1.destroy();
			a2.destroy();
		}
		
		this.base();
	},
	
	/**
	 * Set the frequency which is used to determine joint softness.  According to 
	 * Box2d documentation the frequency should be less than half of the time step
	 * used for the simulation.  In the engine, the frequency of the time step is
	 * the frame rate.
	 * 
	 * @param hz {Number} The frequency in Hertz.
	 */
	setFrequency: function(hz) {
		this.getJointDef().frequencyHz = hz;
	},
	
	/**
	 * Get the frequency from the joint definition.
	 * @return {Number}
	 */
	getFrequency: function() {
		return this.getJointDef().frequencyHz;
	},
	
	/**
	 * Set the damping ratio which is used to determine joint softness.  The value
	 * should be between 0.0 and 1.0, with 1.0 being extremely rigid.
	 * 
	 * @param dampingRatio {Number} A value between 0.0 and 1.0
	 */
	setDampingRatio: function(dampingRatio) {
		this.getJointDef().dampingRatio = dampingRatio;
	},
	
	/**
	 * Get the damping ratio from the joint definition.
	 * @return {Number}
	 */
	getDampingRatio: function() {
		return this.getJointDef().dampingRatio;
	}
		
}, { /** @scope DistanceJointComponent.prototype */

   /**
    * Get the class name of this object
    *
    * @return {String} "DistanceJointComponent"
    */
   getClassName: function() {
      return "DistanceJointComponent";
   }   
});

return DistanceJointComponent;

});