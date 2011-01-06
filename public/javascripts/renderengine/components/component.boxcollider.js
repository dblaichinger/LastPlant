/**
 * The Render Engine
 * BoxColliderComponent
 *
 * @fileoverview A collision component which determines collisions via
 *               bounding box comparisons.
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

Engine.initObject("BoxColliderComponent", "ColliderComponent", function() {

/**
 * @class An extension of the {@link ColliderComponent} which will check the
 *        object's bounding boxes for semi-precise collision.
 *
 * @param name {String} Name of the component
 * @param collisionModel {SpatialCollection} The collision model
 * @param priority {Number} Between 0.0 and 1.0, with 1.0 being highest
 *
 * @extends ColliderComponent
 * @constructor
 * @description Creates a collider component for box-box collision testing.  Each object
 *              must implement the {@link Object2D#getWorldBox} method and return a
 *              world-oriented bounding box.
 */
var BoxColliderComponent = ColliderComponent.extend(/** @scope BoxColliderComponent.prototype */{

	hasMethod: false,

   /**
    * Releases the component back into the pool for reuse.  See {@link PooledObject#release}
    * for more information.
    */
   release: function() {
      this.base();
		this.hasMethod = false;		
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
		this.hasMethod = (hostObj.getWorldBox != undefined);
		/* pragma:DEBUG_START */
		AssertWarn(this.hasMethod, "Object " + hostObj.toString() + " does not have getWorldBox() method");
		/* pragma:DEBUG_END */
	},

   /**
    * Call the host object's <tt>onCollide()</tt> method, passing the time of the collision,
    * the potential collision object, and the host and target masks.  The return value should 
    * either tell the collision tests to continue or stop.
    * <p/>
    * A world bounding box collision must occur to trigger the <tt>onCollide()</tt> method.
    *
    * @param time {Number} The engine time (in milliseconds) when the potential collision occurred
    * @param collisionObj {HostObject} The host object with which the collision potentially occurs
    * @param hostMask {Number} The collision mask for the host object
    * @param targetMask {Number} The collision mask for <tt>collisionObj</tt>
    * @return {Number} A status indicating whether to continue checking, or to stop
    */
   testCollision: function(time, collisionObj, hostMask, targetMask) {
      if (this.hasMethod && collisionObj.getWorldBox &&
          this.getHostObject().getWorldBox().isIntersecting(collisionObj.getWorldBox())) {

         return this.base(time, collisionObj, hostMask, targetMask);
      }
      
      return ColliderComponent.CONTINUE;
   }

}, { /** @scope BoxColliderComponent.prototype */

   /**
    * Get the class name of this object
    * @return {String} "BoxColliderComponent"
    */
   getClassName: function() {
      return "BoxColliderComponent";
   }
   
});

return BoxColliderComponent;

});