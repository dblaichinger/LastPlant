/**
 * The Render Engine
 * BoxBodyComponent
 *
 * @fileoverview A physical rectangular body component for use in a {@link Simulation}.
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
Engine.include("/physics/collision/shapes/b2BoxDef.js");

Engine.initObject("BoxBodyComponent", "BaseBodyComponent", function() {

/**
 * @class An extension of the {@link BaseBodyComponent} which creates a rectangular
 * 		 rigid body.  
 *
 * @param name {String} Name of the component
 * @param extents {Point2D} The full extents of the body along X and Y
 *
 * @extends BaseBodyComponent
 * @constructor
 * @description A rectangular rigid body component.
 */
var BoxBodyComponent = BaseBodyComponent.extend(/** @scope BoxBodyComponent.prototype */{

	extents: null,

	/**
	 * @private
	 */
	constructor: function(name, extents) {
		this.base(name, new b2BoxDef());
		this.extents = Point2D.create(extents);
		var e = this.extents.get();
		this.getShapeDef().extents.Set(e.x / 2, e.y / 2);
		this.setLocalOrigin(e.x / 2, e.y / 2);
	},
	
	/**
	 * @private
	 */
	destroy: function() {
		this.extents.destroy();
		this.base();
	},
	
	/**
	 * @private
	 */
	release: function() {
		this.extents = null;
		this.base();
	},
	
	/**
	 * Get a box which bounds the body, local to the body.
	 * @return {Rectangle2D}
	 */
	getBoundingBox: function() {
		var box = this.base();
		var p = this.getPosition().get();
		var e = this.getExtents().get();
		box.set(0, 0, e.x, e.y);
		return box;
	},
	
	/**
	 * Set the extents of the box's body.  Calling this method after the
	 * simulation of the body has started has no effect.
	 * 
	 * @param extents {Point2D} The extents of the body along X and Y
	 */
	setExtents: function(extents) {
		this.extents = extents;
		var e = extents.get();
		this.getShapeDef().extents.Set(e.x / 2, e.y / 2);
	},
	
	/**
	 * Get the extents of the box's body.
	 * @return {Point2D}
	 */
	getExtents: function() {
		return this.extents;
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
			var ext = Point2D.create(this.extents);
			//ext.mul(this.getScale());
			var hx = ext.get().x / 2;
			var hy = ext.get().y / 2;
			var rect = Rectangle2D.create(-hx, -hy, hx * 2, hy * 2);
			renderContext.setScale(1/this.getScale());
			renderContext.drawRectangle(rect);
			rect.destroy();
			renderContext.popTransform();
		}	
	}
	/* pragma:DEBUG_END */
	

}, { /** @scope BoxBodyComponent.prototype */

   /**
    * Get the class name of this object
    *
    * @return {String} "BoxBodyComponent"
    */
   getClassName: function() {
      return "BoxBodyComponent";
   }
   
});

return BoxBodyComponent;

});