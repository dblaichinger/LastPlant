/*
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

Engine.include("/physics/dynamics/joints/b2JointNode.js");
Engine.include("/physics/dynamics/joints/b2DistanceJoint.js");
Engine.include("/physics/dynamics/joints/b2MouseJoint.js");
Engine.include("/physics/dynamics/joints/b2PrismaticJoint.js");
Engine.include("/physics/dynamics/joints/b2RevoluteJoint.js");
Engine.include("/physics/dynamics/joints/b2PulleyJoint.js");
Engine.include("/physics/dynamics/joints/b2GearJoint.js");

Engine.initObject("b2Joint", null, function() {

	var b2Joint = Base.extend({

		m_type: 0,
		m_prev: null,
		m_next: null,
		m_node1: null,
		m_node2: null,
		m_body1: null,
		m_body2: null,
	
		m_islandFlag: null,
		m_collideConnected: null,
	
		m_userData: null,
	
		constructor: function(def) {
			// initialize instance variables for references
			this.m_node1 = new b2JointNode();
			this.m_node2 = new b2JointNode();
			//
	
			this.m_type = def.type;
			this.m_prev = null;
			this.m_next = null;
			this.m_body1 = def.body1;
			this.m_body2 = def.body2;
			this.m_collideConnected = def.collideConnected;
			this.m_islandFlag = false;
			this.m_userData = def.userData;
		},
		
		GetType: function(){
			return this.m_type;
		},
	
		GetAnchor1: function() {
			return null;
		},
		
		GetAnchor2: function() {
			return null;
		},
	
		GetReactionForce: function(invTimeStep) {
			return null;
		},
		
		GetReactionTorque: function(invTimeStep) {
			return 0.0;
		},
	
		GetBody1: function()
		{
			return this.m_body1;
		},
	
		GetBody2: function()
		{
			return this.m_body2;
		},
	
		GetNext: function(){
			return this.m_next;
		},
	
		GetUserData: function(){
			return this.m_userData;
		},

		PrepareVelocitySolver: function() {
			
		},
		
		SolveVelocityConstraints: function(step) {
			
		},
	
		// This returns true if the position errors are within tolerance.
		PreparePositionSolver: function() {
			
		},
		
		SolvePositionConstraints: function() {
			return false;
		}
			
	}, {
		
		Create: function(def, allocator) {
			var joint = null;
	
			switch (def.type)
			{
			case b2Joint.e_distanceJoint:
				{
					//void* mem = allocator->Allocate(sizeof(b2DistanceJoint));
					joint = new b2DistanceJoint(def);
				}
				break;
	
			case b2Joint.e_mouseJoint:
				{
					//void* mem = allocator->Allocate(sizeof(b2MouseJoint));
					joint = new b2MouseJoint(def);
				}
				break;
	
			case b2Joint.e_prismaticJoint:
				{
					//void* mem = allocator->Allocate(sizeof(b2PrismaticJoint));
					joint = new b2PrismaticJoint(def);
				}
				break;
	
			case b2Joint.e_revoluteJoint:
				{
					//void* mem = allocator->Allocate(sizeof(b2RevoluteJoint));
					joint = new b2RevoluteJoint(def);
				}
				break;
	
			case b2Joint.e_pulleyJoint:
				{
					//void* mem = allocator->Allocate(sizeof(b2PulleyJoint));
					joint = new b2PulleyJoint(def);
				}
				break;
	
			case b2Joint.e_gearJoint:
				{
					//void* mem = allocator->Allocate(sizeof(b2GearJoint));
					joint = new b2GearJoint(def);
				}
				break;
	
			default:
				//b2Settings.b2Assert(false);
				break;
			}
	
			return joint;
		},

		Destroy: function(joint, allocator) {
			/*joint->~b2Joint();
			switch (joint.m_type)
			{
			case b2Joint.e_distanceJoint:
				allocator->Free(joint, sizeof(b2DistanceJoint));
				break;
	
			case b2Joint.e_mouseJoint:
				allocator->Free(joint, sizeof(b2MouseJoint));
				break;
	
			case b2Joint.e_prismaticJoint:
				allocator->Free(joint, sizeof(b2PrismaticJoint));
				break;
	
			case b2Joint.e_revoluteJoint:
				allocator->Free(joint, sizeof(b2RevoluteJoint));
				break;
	
			case b2Joint.e_pulleyJoint:
				allocator->Free(joint, sizeof(b2PulleyJoint));
				break;
	
			case b2Joint.e_gearJoint:
				allocator->Free(joint, sizeof(b2GearJoint));
				break;
	
			default:
				b2Assert(false);
				break;
			}*/
		},
		
		e_unknownJoint: 0,
		e_revoluteJoint: 1,
		e_prismaticJoint: 2,
		e_distanceJoint: 3,
		e_pulleyJoint: 4,
		e_mouseJoint: 5,
		e_gearJoint: 6,
		
		e_inactiveLimit: 0,
		e_atLowerLimit: 1,
		e_atUpperLimit: 2,
		e_equalLimits: 3
		
	});

	return b2Joint;

});
