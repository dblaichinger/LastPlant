/**
 * The Render Engine
 * CircleColliderComponent
 *
 * @fileoverview A collision component which determines collisions via
 *               bounding circle comparisons.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
 * @author: $Author: bfattori@gmail.com $
 * @version: $Revision: 1455 $
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
Engine.include("/components/component.collider.js");

Engine.initObject("CircleColliderComponent", "CircleColliderComponent", function() {

/**
 * @class An extension of the {@link ColliderComponent} which will check if the
 *        object's are colliding based on a bounding circle.  If the bounding circle method
 *			 isn't available, the bounding box will be used to approximate a bounding circle.
 *
 * @param name {String} Name of the component
 * @param collisionModel {SpatialCollection} The collision model
 * @param priority {Number} Between 0.0 and 1.0, with 1.0 being highest
 *
 * @extends ColliderComponent
 * @constructor
 * @description Creates a collider component for circle-circle collision testing.  Each object
 *              must implement either the {@link Object2D#getWorldBox} or
 *              {@link Object2D#getCircle} method and return a world-oriented bounding box or
 *              circle, respectively.
 */
var CircleColliderComponent = ColliderComponent.extend(/** @scope CircleColliderComponent.prototype */{

	hasMethods: null,

   /**
    * Releases the component back into the pool for reuse.  See {@link PooledObject#release}
    * for more information.
    */
   release: function() {
      this.base();
		this.hasMethod = null;		
	},

	/**
    * Establishes the link between this component and its host object.
    * When you assign components to a host object, it will call this method
    * so that each component can refer to its host object, the same way
    * a host object can refer to a component with {@link HostObject#getComponent}.
    *
    * @param hostObject {HostObject} The object which hosts this component
	 */
	setHostObject: function(hostObj) {
		this.base(hostObj);
		this.hasMethods = [hostObj.getCircle != undefined, hostObj.getWorldBox != undefined]; // getCircle, getWorldBox
		/* pragma:DEBUG_START */
		AssertWarn(this.hasMethods[0] || this.hasMethods[1], "Object " + hostObj.toString() + " does not have getCircle() or getWorldBox() methods");
		/* pragma:DEBUG_END */
	},

   /**
    * Call the host object's <tt>onCollide()</tt> method, passing the time of the collision,
    * the potential collision object, and the host and target masks.  The return value should 
    * either tell the collision tests to continue, or to stop.
    * <p/>
    * A circular bounding area collision must occur to trigger the <tt>onCollide()</tt> method.
    *
    * @param time {Number} The engine time (in milliseconds) when the potential collision occurred
    * @param collisionObj {HostObject} The host object with which the collision potentially occurs
    * @param hostMask {Number} The collision mask for the host object
    * @param targetMask {Number} The collision mask for <tt>collisionObj</tt>
    * @return {Number} A status indicating whether to continue checking, or to stop
    */
   testCollision: function(time, collisionObj, hostMask, targetMask) {
      
      var host = this.getHostObject();
      var hCircle = Circle2D.create(0,0,1);
		var oCircle = Circle2D.create(0,0,1);
		var wBox, r;
		
		// Check for easy methods
		if (this.hasMethods[0]) {
			hCircle.set(host.getCircle());
		} else {
			// Approximate a circle with the world box
			wBox = this.hasMethods[1] ? host.getWorldBox() : null;
			if (wBox == null) {
				hCircle.destroy();
				oCircle.destroy();
				return ColliderComponent.CONTINUE;	// Can't perform check
			}
			r = wBox.get();
			hCircle.set(wBox.getCenter(), r.w > r.h ? r.w / 2 : r.h / 2); 
		}
		
		if (collisionObj.getCircle) {
			oCircle.set(collisionObj.getCircle());
		} else {
			// Approximate a circle with the world box
			wBox = collisionObj.getWorldBox ? collisionObj.getWorldBox() : null;
			if (wBox == null) {
				hCircle.destroy();
				oCircle.destroy();
				return ColliderComponent.CONTINUE;	// Can't perform check
			}
			r = wBox.get();
			oCircle.set(wBox.getCenter(), r.w > r.h ? r.w / 2 : r.h / 2); 
		}
		
      // See if a collision will occur
      if (hCircle.isIntersecting(oCircle)) {
      	hCircle.destroy();
      	oCircle.destroy();
         return this.base(time, collisionObj, hostMask, targetMask);
      }
      
		hCircle.destroy();
		oCircle.destroy();
      return ColliderComponent.CONTINUE;
   }
	
}, { /** @scope CircleColliderComponent.prototype */

   /**
    * Get the class name of this object
    *
    * @return {String}
    */
   getClassName: function() {
      return "CircleColliderComponent";
   }
   
});

return CircleColliderComponent;

});