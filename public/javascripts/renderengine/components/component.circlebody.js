/**
 * The Render Engine
 * CircleBodyComponent
 *
 * @fileoverview A physical circular body component for use in a {@link Simulation}.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
 * @author: $Author: bfattori $
 * @version: $Revision: 1400 $
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
Engine.include("/components/component.basebody.js");
Engine.include("/physics/collision/shapes/b2CircleDef.js");

Engine.initObject("CircleBodyComponent", "BaseBodyComponent", function() {

/**
 * @class An extension of the {@link BaseBodyComponent} which creates a circular
 * 		 rigid body.  
 *
 * @param name {String} Name of the component
 * @param radius {Number} The radius of the circle
 *
 * @extends BaseBodyComponent
 * @constructor
 * @description A circular rigid body component.
 */
var CircleBodyComponent = BaseBodyComponent.extend(/** @scope CircleBodyComponent.prototype */{

	radius: 0,

	/**
	 * @private
	 */
	constructor: function(name, radius) {
		this.base(name, new b2CircleDef());
		this.radius = radius;
		this.getShapeDef().radius = radius;
		this.setLocalOrigin(radius, radius);
	},
	
	/**
	 * @private
	 */
	release: function() {
		this.base();
		this.radius = 0;
	},
	
	/**
	 * Set the radius of the circle's body.  Calling this method after
	 * simulation has started on the body has no effect.
	 * 
	 * @param radius {Number} The radius of the body
	 */
	setRadius: function(radius) {
		this.getShapeDef().radius = radius;
	},
	
	/**
	 * Get the radius of the circle's body.
	 * @return {Number}
	 */
	getRadius: function() {
		return this.radius;
	},

	/**
	 * Get a box which bounds the body.
	 * @return {Rectangle2D}
	 */
	getBoundingBox: function() {
		var box = this.base();
		var r = this.getRadius();
		box.set(0, 0, r * 2, r * 2);
		return box;
	}

	/* pragma:DEBUG_START */
	/**
	 * Adds shape debugging
	 * @private
	 */	
	,execute: function(renderContext, time) {
		this.base(renderContext, time);
		if (Engine.getDebugMode()) {
			renderContext.pushTransform();
			renderContext.setLineStyle("blue");
			renderContext.setScale(1/this.getScale());
			renderContext.drawArc(Point2D.ZERO, this.getRadius(), 0, 360);
			renderContext.popTransform();
		}	
	}
	/* pragma:DEBUG_END */

}, { /** @scope CircleBodyComponent.prototype */

   /**
    * Get the class name of this object
    *
    * @return {String} "CircleBodyComponent"
    */
   getClassName: function() {
      return "CircleBodyComponent";
   }
   
});

return CircleBodyComponent;

});