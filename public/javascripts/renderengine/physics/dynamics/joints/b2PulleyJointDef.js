﻿/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*
* Converted for The Render Engine v2.0
* Aug. 4, 2010 Brett Fattori
*/

Engine.include("/physics/common/math/b2Vec2.js");

Engine.include("/physics/dynamics/joints/b2Joint.js");
Engine.include("/physics/dynamics/joints/b2JointDef.js");


Engine.initObject("b2PulleyJointDef", "b2JointDef", function() {

	// The pulley joint is connected to two bodies and two fixed ground points.
	// The pulley supports a ratio such that:
	// length1 + ratio * length2 = constant
	// Yes, the force transmitted is scaled by the ratio.
	// The pulley also enforces a maximum length limit on both sides. This is
	// useful to prevent one side of the pulley hitting the top.
	var b2PulleyJointDef = b2JointDef.extend({

		groundPoint1: null,
		groundPoint2: null,
		anchorPoint1: null,
		anchorPoint2: null,
		maxLength1: null,
		maxLength2: null,
		ratio: null,
	
		constructor: function() {
			// The constructor for b2JointDef
			this.type = b2Joint.e_unknownJoint;
			this.userData = null;
			this.body1 = null;
			this.body2 = null;
			this.collideConnected = false;
			//
	
			// initialize instance variables for references
			this.groundPoint1 = new b2Vec2();
			this.groundPoint2 = new b2Vec2();
			this.anchorPoint1 = new b2Vec2();
			this.anchorPoint2 = new b2Vec2();
			//
	
			this.type = b2Joint.e_pulleyJoint;
			this.groundPoint1.Set(-1.0, 1.0);
			this.groundPoint2.Set(1.0, 1.0);
			this.anchorPoint1.Set(-1.0, 0.0);
			this.anchorPoint2.Set(1.0, 0.0);
			this.maxLength1 = 0.5 * b2PulleyJoint.b2_minPulleyLength;
			this.maxLength2 = 0.5 * b2PulleyJoint.b2_minPulleyLength;
			this.ratio = 1.0;
			this.collideConnected = true;
		}
		
	});
	
	return b2PulleyJointDef;

});
