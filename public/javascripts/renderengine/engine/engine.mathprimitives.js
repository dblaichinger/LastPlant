/**
 * The Render Engine
 * MathPrimitives
 *
 * @fileoverview A library of math primitive objects, including points, vectors, rectangles,
 * 				  and circles.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori@gmail.com $
 * @version: $Revision: 1437 $
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

Engine.initObject("MathObject", "PooledObject", function() {

/**
 * @class The base object class which represents a math object within
 * the engine.  All math objects should extend from this class mainly due to
 * the fact that the engine can switch between pooling the object and running
 * transiently.
 * <p/>
 * Google's Chrome browser seems to operate better with transient objects while
 * other browsers appear to run better with pooled objects.
 * <p/>
 * 
 * @param name {String} The name of the object
 * @extends PooledObject
 * @constructor
 * @description Create a math object. 
 */
var MathObject = PooledObject.extend(/** @scope MathObject.prototype */{

   constructor: function(name) {
      if (!Engine.options.transientMathObject) {
         this.base(name);
      }
   },

   /**
    * Destroy this object instance (remove it from the Engine).  The object's release
    * method is called after destruction so it will be returned to the pool of objects 
    * to be used again.
    */
   destroy: function() {
      if (!Engine.options.transientMathObject) {
         this.base();
      }
   }

 }, /** @scope BaseObject.prototype */{

   /**
    * Similar to a constructor, all pooled objects implement this method.
    * The <tt>create()</tt> method will either create a new instance, if no object of the object's
    * class exists within the pool, or will reuse an existing pooled instance of
    * the object.  Either way, the constructor for the object instance is called so that
    * instance creation can be maintained in the constructor.
    * <p/>
    * Usage: <tt>var obj = [ObjectClass].create(arg1, arg2, arg3...);</tt>
    *
    * @memberOf PooledObject
    */
   create: function() {
      if (Engine.options.transientMathObject) {
         return new this(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],
                         arguments[5],arguments[6],arguments[7],arguments[8],arguments[9],
                         arguments[10],arguments[11],arguments[12],arguments[13],arguments[14]);
      } else {
         return PooledObject.create.apply(this, arguments);
      }
   },

   /**
    * Get the class name of this object
    *
    * @return {String} "BaseObject"
    */
   getClassName: function() {
      return "MathObject";
   }
	
});

return MathObject;

});

Engine.initObject("Point2D", "MathObject", function() {

/**
 * @class A 2D point class with helpful methods for manipulation
 *
 * @param x {Point2D|Number} If this arg is a Point2D, its values will be
 *                           copied into the new point.
 * @param y {Number} The Y coordinate of the point.  Only required if X
 *                   was a number.
 * @constructor
 * @description Create a new 2D point.
 * @extends MathObject
 */
var Point2D = MathObject.extend(/** @scope Point2D.prototype */{

   _vec: null,

   x: 0,
   y: 0,

   /**
    * @private
    */
   constructor: function(x, y) {
      this.base("Point2D");
		this._vec = $V([0,0]);
      this.set(x, y);
   },

   release: function() {
      this.base();
      this.x = 0;
      this.y = 0;
      this._vec.setElements([0,0]);
   },

   /**
    * Private method used to update underlying object.
    * @private
    */
   upd: function() {
      this.x = this._vec.e(1); this.y = this._vec.e(2);
   },

	/**
	 * Returns a simplified version of a Point2D.  The simplified version is
	 * an array with two elements: X, Y.
	 * @return {Array}
	 */
	simplify: function() {
		return [this._vec.e(1), this._vec.e(2)];
	},

   /**
    * Returns <tt>true</tt> if this point is equal to the specified point.
    *
    * @param point {Point2D} The point to compare to
    * @return {Boolean} <tt>true</tt> if the two points are equal
    */
   equals: function(point) {
		return this._vec.eql(point._vec);
   },

   /**
    * Set the position of a 2D point.
    *
    * @param x {Point2D|Number|Array} If this arg is a Point2D, its values will be
    *                           copied into the new point.
    * @param y {Number} The Y coordinate of the point.  Only required if X
    *                   was a number.
    */
   set: function(x, y) {
		if (x.length && x.splice && x.shift) {
			// An array
			this._vec.setElements([x[0],x[1]]);
		} else if (Point2D.isInstance(x)) {
         this._vec = x._vec.dup();
      } else {
         AssertWarn((y != null), "Undefined Y value for point initialized to zero.");
         this._vec.setElements([x, y]);
      }
      this.upd();
      return this;
   },
   
   /**
    * Get the elements of this point as an object with elements X and Y.
    * @return {Object}
    */
   get: function() {
      return { x: this._vec.e(1), y: this._vec.e(2) };
   },

   /**
    * Set the X coordinate.
    *
    * @param x {Number} The X coordinate
    */
   setX: function(x) {
      this._vec.setElements([x, this._vec.e(2)]);
      this.upd();
   },

   /**
    * Set the Y coordinate.
    *
    * @param y {Number} The Y coordinate
    */
   setY: function(y) {
      this._vec.setElements([this._vec.e(1), y]);
      this.upd();
   },

   /**
    * A method that mutates this point by adding the point to it.
    *
    * @param point {Point2D} A point
    * @return {Point2D} This point
    */
   add: function(point) {
      this._vec = this._vec.add(point._vec);
      this.upd();
      return this;
   },

   /**
    * A mutator method that adds the scalar value to each component of this point.
    * @param scalar {Number} A number
    * @return {Point2D} This point
    */
   addScalar: function(scalar) {
      this._vec = this._vec.map(function(x) { return x + scalar; });
      this.upd();
      return this;
   },

   /**
    * A mutator method that subtracts the specified point from this point.
    * @param point {Point2D} a point
    * @return {Point2D} This point
    */
   sub: function(point) {
      this._vec = this._vec.subtract(point._vec);
      this.upd();
      return this;
   },

   /**
    * A mutator method that multiplies the components of this point with another.
    * @param point {Point2D} A point
    * @return {Point2D} This point
    */
   convolve: function(point) {
      this._vec = this._vec.map(function(x, i) { return x * (i == 1 ? point.x : point.y); });
      this.upd();
      return this;
   },

   /**
    * A mutator method that divides the components of this point by another.  The point 
    * cannot contain zeros for its components.
    * @param point {Point2D} A point
    * @return {Point2D} This point
    */
   convolveInverse: function(point) {
      Assert((point.x != 0 && point.y != 0), "Division by zero in Point.convolveInverse");
      this._vec = this._vec.map(function(x, i) { return x / (i == 1 ? point.x : point.y); });
      this.upd();
      return this;
   },

   /**
    * A mutator methor that multiplies the components of this point by a scalar value.
    * @param scalar {Number} A number
    * @return {Point2D} This point
    */
   mul: function(scalar) {
      this._vec = this._vec.x(scalar);
      this.upd();
      return this;
   },

   /**
    * A mutator method that divides the components of this point by a scalar value.
    * @param scalar {Number} A number - cannot be zero
    * @return {Point2D} This point
    */
   div: function(scalar) {
      Assert((scalar != 0), "Division by zero in Point.divScalar");

      this._vec = this._vec.x(1 / scalar);
      this.upd();
      return this;
   },

   /**
    * A mutator method that negates this point, inversing it's components.
    * @return {Point2D} This point
    */
   neg: function() {
      this._vec.setElements([ -this._vec.e(1), -this._vec.e(2) ]);
      this.upd();
      return this;
   },

   /**
    * Returns true if the point is the zero point.
    * @return {Boolean} <tt>true</tt> if the point's elements are both zero.
    */
   isZero: function() {
      return this._vec.eql(Vector.Zero(2));
   },
   
   /**
    * Returns the distance between this and another point.
    * @param point {Point2D} The point to compare against
    * @return {Number} The distance between the two points
    */
   dist: function(point) {
      return this._vec.distanceFrom(point._vec);
   },
	
	/**
	 * Project this point from 2 dimensions to 3 dimensions, using one of three projection
	 * types: {@link Math2D.ISOMETRIC_PROJECTION}  <i>(default)</i>, {@link Math2D.DIMETRIC_SIDE_PROJECTION}, or
	 * {@link Math2D.DIMETRIC_TOP_PROJECTION}.
	 * <p/>
	 * Reference: http://www.compuphase.com/axometr.htm
	 *
	 * @param height {Number} The height of the ground.  We must use a particular height to
	 * 		extrapolate our 3D coordinates from.  If the ground is considered level, this can remain zero.
	 * @param projectionType {Number} One of the three projection types in {@link Math2D}
	 * @return {Point3D} This point, projected into 3 dimensions
	 */
	project: function(height, projectionType) {
		height = height || 0;
		projectionType = projectionType || Math2D.ISOMETRIC_PROJECTION;
		var pt = Point3D.create(0,0,0), j = this.get();
		switch (projectionType) {
			case Math2D.ISOMETRIC_PROJECTION:
				pt.set(0.5 * j.x + j.y - height, -(0.5 * j.x) + j.y - height, height); break;
			case Math2D.DIMETRIC_SIDE_PROJECTION:
				pt.set(j.x + (2 * (j.y - height)), 4 * j.y - height, height); break;
			case Math2D.DIMETRIC_TOP_PROJECTION:
				pt.set(j.x - ((j.y - height) /2 ), 2 * (j.y - height), height); break;		
		}
		return pt;		
	},

   /**
    * Returns a printable version of this object fixed to two decimal places.
    * @return {String} Formatted as "x,y"
    */
   toString: function() {
      return Number(this._vec.e(1)).toFixed(2) + "," + Number(this._vec.e(2)).toFixed(2);
   }

}, { /** @scope Point2D.prototype */

   /**
    * Return the classname of the this object
    * @return {String} "Point2D"
    */
   getClassName: function() {
      return "Point2D";
   }
});

/**
 * The "zero" point. This point should not be modified.
 */
Point2D.ZERO = Point2D.create(0,0);

return Point2D;

});

Engine.initObject("Point3D", "MathObject", function() {
	
/**
 * @class A 3D point class with helpful methods for manipulation
 *
 * @param x {Point3D|Number} If this arg is a Point3D, its values will be
 *                           copied into the new point.
 * @param y {Number} The Y coordinate of the point.  Only required if X
 *                   was a number.
 * @param z {Number} The Z coordinate of the point.  Only required if X
 *                   was a number.
 * @constructor
 * @description Create a new 3D point.
 * @extends MathObject
 */
var Point3D = MathObject.extend(/** @scope Point3D.prototype */{

   _vec: null,

   x: 0,
   y: 0,
	z: 0,

   /**
    * @private
    */
   constructor: function(x, y, z) {
      this.base("Point3D");
		this._vec = $V([0,0,0]);
      this.set(x, y, z);
   },

   release: function() {
      this.base();
      this.x = 0;
      this.y = 0;
		this.z = 0;
      this._vec.setElements([0,0,0]);
   },

   /**
    * Private method used to update underlying object.
    * @private
    */
   upd: function() {
      this.x = this._vec.e(1); this.y = this._vec.e(2); this.z = this._vec.e(3);
   },

	/**
	 * Returns a simplified version of a Point3D.  The simplified version is
	 * an array with three elements: X, Y, Z.
	 * @return {Array}
	 */
	simplify: function() {
		return [this._vec.e(1), this._vec.e(2), this._vec.e(3)];
	},

   /**
    * Returns <tt>true</tt> if this point is equal to the specified point.
    *
    * @param point {Point3D} The point to compare to
    * @return {Boolean} <tt>true</tt> if the two points are equal
    */
   equals: function(point) {
		return this._vec.eql(point._vec);
   },

   /**
    * Set the position of a 3D point.
    *
    * @param x {Point3D|Number|Array} If this arg is a Point2D, its values will be
    *                           copied into the new point.
    * @param y {Number} The Y coordinate of the point.  Only required if X
    *                   was a number.
    * @param z {Number} The Z coordinate of the point.  Only required if X
    * 						was a number.
    */
   set: function(x, y, z) {
  		if (x.length && x.splice && x.shift) {
			// An array
			this._vec.setElements([x[0],x[1],x[2]]);
		} else if (Point3D.isInstance(x)) {
         this._vec = x._vec.dup();
      } else {
         AssertWarn((y != null), "Undefined Y value for point initialized to zero.");
			AssertWarn((z != null), "Undefined Z value for point initialized to zero.");
         this._vec.setElements([x, y || 0, z || 0]);
      }
      this.upd();
      return this;
   },
   
   /**
    * Get the elements of this point as an object with elements x, y, and z.
    * @return {Object}
    */
   get: function() {
      return { x: this._vec.e(1), y: this._vec.e(2), z: this._vec.e(3) };
   },

   /**
    * Set the X coordinate.
    *
    * @param x {Number} The X coordinate
    */
   setX: function(x) {
      this._vec.setElements([x, this._vec.e(2), this._vec.e(3)]);
      this.upd();
   },

   /**
    * Set the Y coordinate.
    *
    * @param y {Number} The Y coordinate
    */
   setY: function(y) {
      this._vec.setElements([this._vec.e(1), y, this._vec.e(3)]);
      this.upd();
   },
	
   /**
    * Set the Z coordinate.
    *
    * @param z {Number} The Z coordinate
    */
	setZ: function(z) {
		this._vec.setElements([this._vec.e(1), this._vec.e(2), z])
	},

   /**
    * A method that mutates this point by adding the point to it.
    *
    * @param point {Point3D} A point
    * @return {Point3D} This point
    */
   add: function(point) {
      this._vec = this._vec.add(point._vec);
      this.upd();
      return this;
   },

   /**
    * A mutator method that adds the scalar value to each component of this point.
    * @param scalar {Number} A number
    * @return {Point3D} This point
    */
   addScalar: function(scalar) {
      this._vec = this._vec.map(function(x) { return x + scalar; });
      this.upd();
      return this;
   },

   /**
    * A mutator method that subtracts the specified point from this point.
    * @param point {Point3D} a point
    * @return {Point3D} This point
    */
   sub: function(point) {
      this._vec = this._vec.subtract(point._vec);
      this.upd();
      return this;
   },

   /**
    * A mutator method that multiplies the components of this point with another.
    * @param point {Point3D} A point
    * @return {Point3D} This point
    */
   convolve: function(point) {
      this._vec = this._vec.map(function(x, i) { return x * (i == 1 ? point.x : (i == 2 ? point.y : point.z)); });
      this.upd();
      return this;
   },

   /**
    * A mutator method that divides the components of this point by another.  The point 
    * cannot contain zeros for its components.
    * @param point {Point3D} A point
    * @return {Point3D} This point
    */
   convolveInverse: function(point) {
      Assert((point.x != 0 && point.y != 0), "Division by zero in Point.convolveInverse");
      this._vec = this._vec.map(function(x, i) { return x / (i == 1 ? point.x : (i == 2 ? point.y : point.z)); });
      this.upd();
      return this;
   },

   /**
    * A mutator method that multiplies the components of this point by a scalar value.
    * @param scalar {Number} A number
    * @return {Point3D} This point
    */
   mul: function(scalar) {
      this._vec = this._vec.map(function(x) { return x * scalar; });
      this.upd();
      return this;
   },

   /**
    * A mutator method that divides the components of this point by a scalar value.
    * @param scalar {Number} A number - cannot be zero
    * @return {Point3D} This point
    */
   div: function(scalar) {
      Assert((scalar != 0), "Division by zero in Point.divScalar");

      this._vec = this._vec.map(function(x) { return x / scalar; });
      this.upd();
      return this;
   },

   /**
    * A mutator method that negates this point, inversing it's components.
    * @return {Point2D} This point
    */
   neg: function() {
      this._vec.setElements([ -this._vec.e(1), -this._vec.e(2), this._vec.e(3) ]);
      this.upd();
      return this;
   },

   /**
    * Returns true if the point is the zero point.
    * @return {Boolean} <tt>true</tt> if the point's elements are all zero.
    */
   isZero: function() {
      return this._vec.eql(Vector.Zero);
   },
   
   /**
    * Returns the distance between this and another point.
    * @param point {Point3D} The point to compare against
    * @return {Number} The distance between the two points
    */
   dist: function(point) {
      return this._vec.distanceFrom(point._vec);
   },

	/**
	 * Project this point from 3 dimensions to 2 dimensions, using one of three projection
	 * types: {@link Math2D.ISOMETRIC_PROJECTION} <i>(default)</i>, {@link Math2D.DIMETRIC_SIDE_PROJECTION}, or
	 * {@link Math2D.DIMETRIC_TOP_PROJECTION}.
	 * <p/>
	 * Reference: http://www.compuphase.com/axometr.htm
	 * 
	 * @param projectionType {Number} One of the three projection types in {@link Math2D}
	 * @return {Point2D} This point, projected into 2 dimensions
	 */
	project: function(projectionType) {
		projectionType = projectionType || Math2D.ISOMETRIC_PROJECTION;
		var pt = Point2D.create(0,0), j = this.get();
		switch (projectionType) {
			case Math2D.ISOMETRIC_PROJECTION:
				pt.set(j.x - j.z, j.y + ((j.x + j.z) / 2)); break;
			case Math2D.DIMETRIC_SIDE_PROJECTION:
				pt.set(j.x + (j.z / 2), j.y + (j.z / 4)); break;
			case Math2D.DIMETRIC_TOP_PROJECTION:
				pt.set(j.x + (j.z / 4), j.y + (j.z / 2)); break;		
		}
		return pt;		
	},

   /**
    * Returns a printable version of this object fixed to two decimal places.
    * @return {String} Formatted as "x,y"
    */
   toString: function() {
      return Number(this._vec.e(1)).toFixed(2) + "," + Number(this._vec.e(2)).toFixed(2) + "," + Number(this._vec.e(3)).toFixed(2);
   }

}, { /** @scope Point3D.prototype */

   /**
    * Return the classname of the this object
    * @return {String} "Point3D"
    */
   getClassName: function() {
      return "Point3D";
   }
});

Point3D.ZERO = Point3D.create(0,0,0);
	
return Point3D;

});

Engine.initObject("Vector2D", "Point2D", function() {

/**
 * @class A 2D vector class with helpful manipulation methods.
 * 
 * @param x {Point2D|Number} If this arg is a Vector2D, its values will be
 *                           copied into the new vector.  If a number,
 *                           the X length of the vector.
 * @param y {Number} The Y length of the vector.  Only required if X
 *                   was a number.
 * @constructor
 * @description Create a new 2D Vector
 * @extends Point2D
 */
var Vector2D = Point2D.extend(/** @scope Vector2D.prototype */{

   /**
    * @private
    */
   constructor: function(x, y) {
      this.base(x,y);
		this.upd();
   },

   /**
    * A mutator method that normalizes this vector, returning a unit length vector.
    * @return {Vector2D} This vector, normalized
    * @see #len
    */
   normalize: function() {
      this._vec = this._vec.toUnitVector();
      this.upd();
      return this;
   },

   /**
    * Get the magnitude/length of this vector.
    *
    * @return {Number} A value representing the length (magnitude) of the vector.
    */
   len: function() {
      return this._vec.modulus();
   },

   /**
    * Get the dot product of this vector and another.
    * @param vector {Vector2D} The Point to perform the operation against.
    * @return {Number} The dot product
    */
   dot: function(vector) {
      return this._vec.dot(vector._vec);
   },

   /**
    * A mutator method that gets the cross product of this vector and another.
    * @param vector {Vector2D} The vector to perform the operation against.
    * @return {Vector2D} This vector 
    */
   cross: function(vector) {
      this._vec = this._vec.cross(vector._vec);
      this.upd();
      return this;
   },

   /**
    * Returns the angle (in degrees) between two vectors.  This assumes that the
    * point is being used to represent a vector, and that the supplied point
    * is also a vector.
    *
    * @param vector {Vector2D} The vector to perform the angular determination against
    * @return {Number} The angle between two vectors, in degrees
    */
   angleBetween: function(vector) {
      return Math2D.radToDeg(this._vec.angleFrom(vector._vec));
   },
   
   /**
    * Returns <tt>true</tt> if this vector is parallel to <tt>vector</tt>.
    * @param vector {Vector2D} The vector to compare against
    * @return {Boolean}
    */
   isParallelTo: function(vector) {
   	return this._vec.isParallelTo(vector._vec);
   },
   
   /**
    * Returns <tt>true</tt> if this vector is anti-parallel to <tt>vector</tt>.
    * @param vector {Vector2D} The vector to compare against
    * @return {Boolean}
    */
   isAntiparallelTo: function(vector) {
   	return this._vec.isAntiparallelTo(vector._vec);
   },
   
   /**
    * Returns <tt>true</tt> if this vector is perpendicular to <tt>vector</tt>.
    * @param vector {Vector2D} The vector to compare against
    * @return {Boolean}
    */
   isPerpendicularTo: function(vector) {
   	return this._vec.isPependicularTo(vector._vec);
   },
   
   /**
    * Mutator method that modifies the vector rotated <tt>angle</tt> degrees about
    * the vector defined by <tt>axis</tt>.
    *
    * @param angle {Number} The rotation angle in degrees
    * @param axis {Vector2D} The axis to rotate about
    * @return {Vector2D} This vector
    */
   rotate: function(angle, axis) {
   	this._vec = this._vec.rotate(Math2D.degToRad(angle), axis);
      this.upd();
   	return this;
   },
   
   /**
    * Project this vector onto <tt>vector</tt>.
    *
    * @param vector {Vector2D} The vector to project onto
    * @return {Vector2D}
    */
   projectOnto: function(vector) {
   	var proj = Vector2D.create(0,0);
   	var t = this.get();
   	var v = vector.get();
   	var dp = this.dot(vector);
   	proj.set( (dp / (v.x * v.x + v.y * v.y)) * v.x,
   				 (dp / (v.x * v.x + v.y * v.y)) * v.y);
   	return proj;
   },
   
   /**
    * Get the right-hand normal of this vector.  The left-hand
    * normal would simply be <tt>this.rightNormal().neg()</tt>.
    * @return {Vector2D}
    */
   rightNormal: function() {
   	var t = this.get();
   	var norm = Vector2D.create(-t.y, t.x);
   },
   
   /**
    * Get the per-product of this vector and <tt>vector</tt>.
    * @param vector {Vector2D} The other vector
    * @return {Number}
    */
   perProduct: function(vector) {
   	return this.dot(vector.rightNormal());
   }

}, { /** @scope Vector2D.prototype */
   
   /**
    * Return the classname of the this object
    * @return {String} "Vector2D"
    */
   getClassName: function() {
      return "Vector2D";
   }
});

return Vector2D;

});

Engine.initObject("Vector3D", "Point3D", function() {

/**
 * @class A 3D vector class with helpful manipulation methods.
 * 
 * @param x {Point3D|Number} If this arg is a Vector3D, its values will be
 *                           copied into the new vector.  If a number,
 *                           the X length of the vector.
 * @param y {Number} The Y length of the vector.  Only required if X
 *                   was a number.
 * @param z {Number} The Z length of the vector.  Only required if X
 *                   was a number.
 * @constructor
 * @description Create a new 3D Vector
 * @extends Point3D
 */
var Vector3D = Point3D.extend(/** @scope Vector3D.prototype */{

   /**
    * @private
    */
   constructor: function(x, y, z) {
      this.base(x,y,z);
		this.upd();
   },

   /**
    * A mutator method that normalizes this vector, returning a unit length vector.
    * @return {Vector2D} This vector, normalized
    * @see #len
    */
   normalize: function() {
      this._vec = this._vec.toUnitVector();
      this.upd();
      return this;
   },

   /**
    * Get the magnitude/length of this vector.
    *
    * @return {Number} A value representing the length (magnitude) of the vector.
    */
   len: function() {
      return this._vec.modulus();
   },

   /**
    * Get the dot product of this vector and another.
    * @param vector {Vector3D} The Point to perform the operation against.
    * @return {Number} The dot product
    */
   dot: function(vector) {
      return this._vec.dot(vector._vec);
   },

   /**
    * A mutator method that gets the cross product of this vector and another.
    * @param vector {Vector3D} The vector to perform the operation against.
    * @return {Vector3D} This vector 
    */
   cross: function(vector) {
      this._vec = this._vec.cross(vector._vec);
      this.upd();
      return this;
   },

   /**
    * Returns the angle (in degrees) between two vectors.  This assumes that the
    * point is being used to represent a vector, and that the supplied point
    * is also a vector.
    *
    * @param vector {Vector3D} The vector to perform the angular determination against
    * @return {Number} The angle between two vectors, in degrees
    */
   angleBetween: function(vector) {
      return Math2D.radToDeg(this._vec.angleFrom(vector._vec));
   }

}, { /** @scope Vector3D.prototype */
   
   /**
    * Return the classname of the this object
    * @return {String} "Vector3D"
    */
   getClassName: function() {
      return "Vector3D";
   }
});

return Vector3D;

});

Engine.initObject("Rectangle2D", "MathObject", function() {

/**
 * @class A 2D rectangle class with helpful manipulation methods.
 */
var Rectangle2D = MathObject.extend(/** @scope Rectangle2D.prototype */{

   topLeft: null,
	bottomRight: null,
   dims: null,
	center: null,

   /**
    * Create a rectangle object specifying the X and Y position and
    * the width and height.
    *
    * @param x {Number} The top-left X coordinate
    * @param y {Number} The top-left Y coordinate
    * @param width {Number} the width of the rectangle
    * @param height {Number} The height of the rectangle
    */
   constructor: function(x, y, width, height) {
      this.topLeft = Point2D.create(0,0);
      this.bottomRight = Point2D.create(0,0);
      this.dims = Point2D.create(0,0);
		this.center = Point2D.create(0,0);
      this.set(x,y,width,height);
		this.base("Rectangle2D");
   },

	/**
	 * @private
	 */
	destroy: function() {
		this.topLeft.destroy();
		this.bottomRight.destroy();
		this.dims.destroy();
		this.center.destroy();
		this.base();
	},

	/**
	 * @private
	 */
   release: function() {
      this.base();
      this.topLeft = null;
      this.dims = null;
   },

   /**
    * Set the values of this rectangle.
    *
    * @param x {Number|Rectangle2D} An optional value to initialize the X coordinate of the rectangle, or a rectangle to clone
    * @param y {Number} An optional value to initialize the Y coordinate of the rectangle
    * @param width {Number} An optional value to initialize the width of the rectangle
    * @param height {Number} An optional value to initialize the height of the rectangle
    */
   set: function(x, y, width, height)
   {
      if (Rectangle2D.isInstance(x)) {
			var r = x.get();
         this.set(r.x, r.y, r.w, r.h);
      }
      else
      {
         this.topLeft.set(x || 0, y || 0);
         this.dims.set(width || 0, height || 0);
      }
   },

   /**
    * Get an object with the elements containing left, top, width, height, right
    * and bottom as the elements x, y, w, h, r, and b. 
    *
    * @return {Object} An object with the specified elements
    */
   get: function() {
      var tl = this.getTopLeft();
      var d = this.getDims();
      return {x: tl.x, y: tl.y, w: d.x, h: d.y, r: tl.x + d.x, b: tl.y + d.y};
   },

   /**
    * Returns <tt>true</tt> if this rectangle is equal to the specified rectangle.
    *
    * @param rect {Rectangle2D} The rectangle to compare to
    * @return {Boolean} <tt>true</tt> if the two rectangles are equal
    */
   equals: function(rect) {
      return (this.topLeft.equals(rect.getTopLeft()) && this.dims.equals(rect.getDims()));
   },

   /**
    * A mutator method that offsets this rectangle by the given amount in the X and Y axis.  
    * The first parameter can be either a point, or the value for the X axis.  If the X axis is 
    * specified, the second parameter should be the amount to offset in the Y axis.
    *
    * @param offsetPtOrX {Point2D|int} Either a {@link Point} which contains the offset in X and Y, or an integer
    *                                representing the offset in the X axis.
    * @param offsetY {int} If <code>offsetPtOrX</code> is an integer value for the offset in the X axis, this should be
    *                      the offset along the Y axis.
    * @return {Rectangle2D} This rectangle
    */
   offset: function(offsetPtOrX, offsetY)
   {
      var offs = Point2D.create(0,0);
      if (Point2D.isInstance(offsetPtOrX)) {
         offs.set(offsetPtOrX);
      } else {
         offs.set(offsetPtOrX, offsetY);
      }

      this.topLeft.add(offs);
		offs.destroy();
      return this;
   },

   /**
    * Set the top left of this rectangle to the point, or coordinates specified.
    *
    * @param ptOrX {Point2D/Number} The top left point, or the X coordinate
    * @param y {Number} If the top left wasn't specified as the first argument, this is the Y coordinate
    */
   setTopLeft: function(ptOrX, y) {
      if (Point2D.isInstance(ptOrX)) {
         this.topLeft.set(ptOrX);
      } else {
         this.topLeft.set(ptOrX, y);
      }
   },

   /**
    * Set the width and height of this rectangle using the point, or coordinates specified.
    * @param ptOrX {Point2D/Number} The top left point, or the X coordinate
    * @param [y] {Number} If the top left isn't a point, this is the Y coordinate
    */
   setDims: function(ptOrX, y) {
      if (Point2D.isInstance(ptOrX)) {
         this.dims.set(ptOrX.x, ptOrX.y);
      } else {
         this.dims.set(ptOrX, y)
      }
   },

   /**
    * Set the width of the rectangle.
    *
    * @param width {Number} The new width of the rectangle
    */
   setWidth: function(width) {
		var p = Point2D.create(width, this.get().h);
      this.setDims(p);
		p.destroy();
   },

   /**
    * Set the height of the rectangle
    *
    * @param height {Number} The new height of the rectangle
    */
   setHeight: function(height) {
		var p = Point2D.create(this.get().w, height);
      this.setDims(p);
		p.destroy();
   },

   /**
    * Determine if this rectangle overlaps another rectangle along
    * any axis.  If an overlap occurs, a vector is returned that will
    * resolve the overlap.
    *
    * @param rect A {@link Rectangle} to compare against
    * @return {Vector2D} The vector to resolve the overlap
    * @private
    */
   isOverlapped: function(rect)
   {
      // TODO: This will implement the Separating Axis Theorem, eventually...
   },

   /**
    * Determine if this rectangle intersects another rectangle.
    *
    * @param rect A {@link Rectangle2D} to compare against
    * @return {Boolean} <tt>true</tt> if the two rectangles intersect.
    */
   isIntersecting: function(rect) {
      var r1 = this.get();
      var r2 = rect.get();
      return !(r1.r < r2.x ||
               r1.x > r2.r ||
               r1.y > r2.b ||
               r1.b < r2.y);
   },

   /**
    * Determine if this rectangle is contained within the specified rectangle.
    *
    * @param rect A {@link Rectangle2D} to compare against
    * @return {Boolean} <tt>true</tt> if the this rectangle is fully contained in the specified rectangle.
    */
   isContained: function(rect)
   {
      var r1 = this.get();
      var r2 = rect.get();
      return ((r1.x >= r2.x) &&
              (r1.y >= r2.y) &&
              (r1.r <= r2.r) &&
              (r1.b <= r2.b));
   },

   /**
    * Determine if this rectangle contains the specified rectangle.
    *
    * @param rect A {@link Rectangle2D} to compare against
    * @return {Boolean} <tt>true</tt> if the rectangle is fully contained within this rectangle.
    */
   containsRect: function(rect)
   {
      var r1 = this.get();
      var r2 = rect.get();
      return ((r2.x >= r1.x) &&
              (r2.y >= r1.y) &&
              (r2.r <= r1.r) &&
              (r2.b <= r1.b));

   },

   /**
    * Returns <tt>true</tt> if this rectangle contains the specified point.
    *
    * @param point {Point} The point to test
    * @return {Boolean} <tt>true</tt> if the point is within this rectangle
    */
   containsPoint: function(point)
   {
      var r1 = this.get();
      return (point.x >= r1.x &&
              point.y >= r1.y &&
              point.x <= r1.r &&
              point.y <= r1.b);
   },

   /**
    * Returns a {@link Point2D} that contains the center point of this rectangle.
    *
    * @return {Point2D} The center point of the rectangle
    */
   getCenter: function()
   {
		this.center.set(this.topLeft.x + (this.dims.x * 0.5), this.topLeft.y + (this.dims.y * 0.5));
		return this.center;
   },

   /**
    * Returns the half length of the width dimension of this rectangle
    * @return {Number} The half-width
    */
   getHalfWidth: function() {
      return this.len_x() * 0.5;
   },

   /**
    * Returns the half length of the height dimension of this rectangle
    * @return {Number} The half-height
    */
   getHalfHeight: function() {
      return this.len_y() * 0.5;
   },

   /**
    * Returns the positive length of this rectangle, along the X axis.
    *
    * @return {Number}
    */
   len_x: function()
   {
      return Math.abs(this.dims.x);
   },

   /**
    * Returns the positive length of this rectangle, along the Y axis.
    *
    * @return {Number}
    */
   len_y: function()
   {
      return Math.abs(this.dims.y);
   },

   /**
    * Gets a {@link Point2D} representing the top-left corner of this rectangle.
    * @return {Point2D}
    */
   getTopLeft: function()
   {
      return this.topLeft;
   },

   /**
    * Gets a {@link Point2D) representing the width and height of this rectangle.
    * @return {Point2D}
    */
   getDims: function()
   {
      return this.dims;
   },

   /**
    * Gets a {@link Point2D} representing the bottom-right corner of this rectangle.
    * @return {Point2D}
    */
   getBottomRight: function()
   {
		this.bottomRight.set(this.topLeft).add(this.dims);
      return this.bottomRight;
   },

   /**
    * Returns a printable version of this object.
    * @return {String} Formatted like "x,y [w,h]"
    */
   toString: function()
   {
      return (this.topLeft + " [" + this.dims + "]");
   }
}, { /** @scope Rectangle2D.prototype */
   
   /**
    * Return the classname of the this object
    * @return {String} "Rectangle2D"
    */
   getClassName: function() {
      return "Rectangle2D";
   }
});

return Rectangle2D;

});


Engine.initObject("Circle2D", "MathObject", function() {

/**
 * @class A 2D circle class with helpful manipulation methods.
 */
var Circle2D = MathObject.extend(/** @scope Circle2D.prototype */{

   center: null,
   
   radius: 0,
   
   /**
    * Create a circle object specifying the X and Y center position and
    * the radius.
    *
    * @param x {Number} The center X coordinate
    * @param y {Number} The center Y coordinate
    * @param radius {Number} The radius of the circle
    */
   constructor: function(x, y, radius) {
      this.center = Point2D.create(0,0);
      this.radius = 0;
      this.set(x,y,radius);
   },
	
	destroy: function() {
		this.center.destroy();
		this.base();
	},

   release: function() {
      this.base();
      this.center = null;
      this.radius = 0;
   },

   /**
    * Set the values of this circle.
    *
    * @param x {Number|Point2D|Circle2D} An optional value to initialize the X coordinate of the circle
    * @param y {Number} An optional value to initialize the Y coordinate of the circle
    * @param radius {Number} An optional value to initialize the radius
    */
   set: function(x, y, radius)
   {
      if (Circle2D.isInstance(x)) {
         this.center.set(x.getCenter());
         this.radius = x.getRadius();
      }
      else if (Point2D.isInstance(x)) {
         this.center.set(x);
         this.radius = y;
      }
      else
      {
         this.center.set(x || 0, y || 0);
         this.radius = radius || 0.0;
      }
   },

   /**
    * Get an object with the elements containing centerX, centerY, and radius
    * as the elements x, y, and r. 
    *
    * @return {Object} An object with the specified elements
    */
   get: function() {
      var c = this.getCenter();
      return {x: c.x, y: c.y, r: this.getRadius()};
   },

   /**
    * Returns <tt>true</tt> if this circle is equal to the specified circle.
    *
    * @param circle {Circle2D} The circle to compare to
    * @return {Boolean} <tt>true</tt> if the two circles are equal
    */
   equals: function(circle) {
      return (this.center.equals(circle.getCenter()) && this.radius == circle.getRadius());
   },

   /**
    * Offset this circle by the given amount in the X and Y axis.  The first parameter
    * can be either a {@link Point2D}, or the value for the X axis.  If the X axis is specified,
    * the second parameter should be the amount to offset in the Y axis.
    *
    * @param offsetPtOrX {Point/int} Either a {@link Point2D} which contains the offset in X and Y, or an integer
    *                                representing the offset in the X axis.
    * @param offsetY {int} If <code>offsetPtOrX</code> is an integer value for the offset in the X axis, this should be
    *                      the offset along the Y axis.
    */
   offset: function(offsetPtOrX, offsetY)
   {
      var offs = Point2D.create(0,0);
      if (Point2D.isInstance(offsetPtOrX)) {
         offs.set(offsetPtOrX);
      } else {
         offs.set(offsetPtOrX, offsetY);
      }

      this.center.add(offs);
		offs.destroy();
      return this;
   },
   
   /**
    * Get the center point of this circle.
    * @return {Point2D} The center point
    */
   getCenter: function() {
      return this.center;
   },
   
   /**
    * Get the radius of this circle
    * @return {Number} The radius
    */
   getRadius: function() {
      return this.radius;
   },
   
   /**
    * Determine if this circle intersects another circle.
    *
    * @param circle A {@link Circle2D} to compare against
    * @return {Boolean} <tt>true</tt> if the two circles intersect.
    */
   isIntersecting: function(circle) {
      // Square root is slow...
      //var d = this.getCenter().dist(circle.getCenter());
      //return (d <= (this.getRadius() + circle.getRadius())); 
      
      // Faster
      var c1 = this.getCenter();
      var c2 = circle.getCenter();
      var dX = Math.pow(c1.x - c2.x, 2);
      var dY = Math.pow(c1.y - c2.y, 2);
      var r2 = Math.pow(this.getRadius() + circle.getRadius(), 2);
      return (dX + dY <= r2);    
   },

   /**
    * Determine if this circle is contained within the specified circle.
    *
    * @param circle {Circle} A circle to compare against
    * @return {Boolean} <tt>true</tt> if the this circle is fully contained in the specified circle.
    */
   isContained: function(circle)
   {
      var d = circle.getCenter().dist(this.getCenter());
      return (d < (this.getRadius() + circle.getRadius()));
   },

   /**
    * Determine if this circle contains the specified circle.
    *
    * @param circle {Circle} A circle to compare against
    * @return {Boolean} <tt>true</tt> if the rectangle is fully contained within this rectangle.
    */
   containsCircle: function(circle)
   {
      return circle.isContained(this);
   },

   /**
    * Returns <tt>true</tt> if this circle contains the specified point.
    *
    * @param point {Point} The point to test
    * @return {Boolean} <tt>true</tt> if the point is within the circle
    */
   containsPoint: function(point)
   {
      var c1 = this.getCenter();
      var r = this.getRadius();
      return (c1.dist(point) <= r);
   },

   /**
    * Returns a printable version of this object.
    * @return {String} Formatted like "cX,cY r#"
    */
   toString: function() {
      return this.center.toString() + " r" + Number(this.radius).toFixed(2);
   }  

},{ /** @scope Circle2D.prototype */
   
   /**
    * Return the classname of the this object
    * @return {String} "Circle2D"
    */
   getClassName: function() {
      return "Circle2D";
   }
   
});

return Circle2D;

});
