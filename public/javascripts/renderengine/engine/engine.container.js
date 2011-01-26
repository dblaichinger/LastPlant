/**
 * The Render Engine
 *
 * @fileoverview A set of objects which can be used to create a collection
 *               of objects, and to iterate over a container.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori $
 * @version: $Revision: 1449 $
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
Engine.include("/engine/engine.pooledobject.js");
Engine.include("/engine/engine.baseobject.js");

Engine.initObject("Iterator", "PooledObject", function() {

/**
 * @class Create an iterator over a {@link Container} instance. An
 * iterator is a convenient object to traverse the list of objects
 * within the container.  If the backing <code>Container</code> is
 * modified, the <code>Iterator</code> will reflect these changes.
 * <p/>
 * The simplest way to traverse the list is as follows:
 * <pre>
 * for (var itr = Iterator.create(containerObj); itr.hasNext(); ) {
 *    // Get the next object in the container
 *    var o = itr.next();
 *    
 *    // Do something with the object
 *    o.doSomething();
 * }
 * 
 * // Destroy the iterator when done
 * itr.destroy();
 * </pre>
 * The last step is important so that you're not creating a lot
 * of objects, especially if the iterator is used repeatedly.
 * Since the iterator is a pooled object, it will be reused.
 *
 * @param container {Container} The container to iterate over.
 * @constructor
 * @extends PooledObject
 * @description Create an iterator over a collection
 */
var Iterator = PooledObject.extend(/** @scope Iterator.prototype */{

   c: null,
	p: null,
	r: false,
	logicalNext: null,

   /**
    * @private
    */
   constructor: function(container) {
      this.base("Iterator");
      this.c = container;
		this.p = container._head;
		this.r = false;
		this.logicalNext = null;
   },

   /**
    * Release the object back into the object pool.
    */
   release: function() {
      this.base();
      this.c = null;
		this.p = null;
		this.r = false;
		this.logicalNext = null;
   },

   /**
    * Reverse the order of the elements in the container (non-destructive) before
    * iterating over them.  You cannot call this method after you have called {@link #next}.
    */
   reverse: function() {
      Assert(this.p === this.c._head, "Cannot reverse Iterator after calling next()");
      this.r = true;
		this.p = this.c._tail;
   },

   /**
    * Get the next element from the iterator.
    * @return {Object} The next element in the iterator
    * @throws {Error} An error if called when no more elements are available
    */
   next: function() {
   
		/* pragma:DEBUG_START */
		try {
			Profiler.enter("Iterator.next()");
		/* pragma:DEBUG_END */

			if (this.c.isDestroyed()) {
				throw new Error("Invalid iterator over destroyed container!");
			}

			// Get the next and move the pointer
			var o = this.p.ptr;
			this.p = (this.r ? this.p.prev : this.p.next);

			if (o != null) {
				return o;
			} else {
				throw new Error("Index out of range");
			}

		/* pragma:DEBUG_START */
		} finally {
			Profiler.exit();
		}
		/* pragma:DEBUG_END */
   },

   /**
    * Returns <tt>true</tt> if the iterator has more elements.
    * @return {Boolean}
    */
   hasNext: function() {
		// If the container hasn't been destroyed
		if (this.c && !this.c.isDestroyed()) {
			while (this.p != null && this.p.ptr != null && this.p.ptr.isDestroyed()) {
				// Skip destroyed objects
				this.p = (this.r ? this.p.prev : this.p.next);
			}
			return this.p != null;
		}
      return false;
   }

}, /** @scope Iterator.prototype */{ 
   /**
    * Get the class name of this object
    *
    * @return {String} "Iterator"
    */
   getClassName: function() {
      return "Iterator";
   }
});

return Iterator;

});

Engine.initObject("Container", "BaseObject", function() {

/**
 * @class A container is a logical collection of objects.  A container
 *        is responsible for maintaining the list of objects within it.
 *        When a container is destroyed, none of the objects within the container
 *        are destroyed with it.  If the objects must be destroyed, call
 *        {@link #cleanUp}.  A container is a doubly linked list of objects
 *        to all for objects to be added and removed without disrupting the
 *        structure of the list.
 *
 * @param containerName {String} The name of the container
 * @extends BaseObject
 * @constructor
 * @description Create a container.
 */
var Container = BaseObject.extend(/** @scope Container.prototype */{

   _head: null,
	_tail: null,
	sz: 0,

   /**
    * @private
    */
   constructor: function(containerName) {
      this.base(containerName || "Container");
      this._head = null;
		this._tail = null;
		this.sz = 0;
   },

   /**
    * Release the object back into the object pool.
    */
   release: function() {
      this.base();
      this.clear();
   },

   /**
    * Clears the container, however, all of the objects within the container
    * are not destroyed automatically.  This is to prevent the early clean up of
    * objects which are being used by a transient container.
    */
   destroy: function() {
      this.base();
   },

   /**
    * Returns the count of the number of objects within the
    * container.
    *
    * @return {Number} The number of objects in the container
    */
   size: function() {
      return this.sz;
   },

	/**
	 * Create a new node for the list
	 * @param obj {Object} The object
	 * @private
	 */
	_new: function(obj) {
		var o = {
			prev: null,
			next: null,
			ptr: obj
		};
		return o;
	},
	
	/**
	 * Find the list node at the given index.  No bounds checking
	 * is performed with this function.
	 * @param idx {Number} The index where the item exists
	 * @param offset {Object} The object to start at, "head" if null
	 * @private
	 */
	_find: function(idx, offset) {
		var n = offset || this._head, c = idx;
		while ( n != null && c-- > 0) {
			n = n.next;
		}
		return (c > 0 ? null : n);
	},
	
	/**
	 * Look through the list to find the given object.  If the object is
	 * found, the  list node is returned.  If no object is found, the method
	 * returns <code>null</code>.
	 * 
	 * @param obj {Object} The object to find
	 * @private
	 */
	_peek: function(obj) {
		var n = this._head;
		while (n != null) {
			if (n.ptr === obj) {
				return n;
			}
			n = n.next;
		}
		return null;
	},

   /**
    * Add an object to the container.
    *
    * @param obj {Object} The object to add to the container.
    */
   add: function(obj) {
		var n = this._new(obj);
		if (this._head == null && this._tail == null) {
			this._head = n;
			this._tail = n;
		} else {
			this._tail.next = n;
			n.prev = this._tail;
			this._tail = n;
		}

      if (obj.getId) {
         Console.log("Added ", obj.getId(), "[", obj, "] to ", this.getId(), "[", this, "]");
      }
		this.sz++;
		
		// Return the list node that was added
		return n;
   },
	
	/**
	 * Add all of the objects in the container or array to this container, at the end
	 * of this container.  If "arr" is a container, the head of "arr" is joined to the
	 * tail of this, resulting in a very fast operation.  Because this method, when
	 * performed on a container, is just joining the two lists, no duplication of
	 * elements from the container is performed.  As such, removing elements from the
	 * new container will affect this container as well.
	 * 
	 * @param arr {Container|Array} A container or array of objects
	 */
	addAll: function(arr) {
		if (Container.isInstance(arr)) {
			for (var i = arr.iterator(); i.hasNext(); ) {
				this.add(i.next());
			}
			i.destroy();
		} else {
			for (var i in arr) {
				this.add(arr[i]);
			}
		}
	},

	/**
	 * Clone this container, returning a new container which points to all of the
	 * objects in this container.
	 * @return {Container} A new container with all of the objects from the current container
	 */
	clone: function() {
		var c = Container.create();
		c.addAll(this.getAll());
		return c;
	},
	
	/**
	 * Concatenate a container or array to the end of this container, 
	 * returning a new container with all of the elements.  The
	 * array or container will be <i>deep copied</i> and appended to this
	 * container.  While the actual pointers to the objects aren't deep copied,
	 * one can be assured that modifying the array or container structure being
	 * appended will not affect either container.
	 *
	 * @param arr {Container|Array} A container or array of objects
	 * @return {Container} A new container with all objects from both
	 */
	concat: function(arr) {
		if (Container.isInstance(arr)) {
			arr = arr.getAll();
		}
		var c = this.clone();
		c.addAll(arr);
		return c;
	},

   /**
    * Insert an object into the container at the given index. Asserts if the
    * index is out of bounds for the container.  The index must be greater than
    * or equal to zero, and less than or equal to the size of the container minus one.
    * The effect is to extend the length of the container by one.
    * 
    * @param index {Number} The index to insert the object at.
    * @param obj {Object} The object to insert into the container
    */
   insert: function(index, obj) {
      Assert(!(index < 0 || index > this.size()), "Index out of range when inserting object!");
		var o = this._find(index);
		var n = this._new(obj);
		
		n.prev = o.prev;
		n.prev.next = n;
		n.next = o;
		o.prev = n;
		this.sz++;
		
		// Return the list node that was inserted
		return n;
   },
   
   /**
    * Replaces the given object with the new object.  If the old object is
    * not found, no action is performed.
    * 
    * @param oldObj {Object} The object to replace
    * @param newObj {Object} The object to put in place
    * @return {Object} The object which was replaced
    */
   replace: function(oldObj, newObj) {
		var o = this._peek(oldObj), r = null;
		if (o.ptr != null) {
			r = o.ptr;
			o.ptr = newObj;		
		}
      return r;      
   },
   
   /**
    * Replaces the object at the given index, returning the object that was there
    * previously. Asserts if the index is out of bounds for the container.  The index 
    * must be greater than or equal to zero, and less than or equal to the size of the 
    * container minus one.
    * 
    * @param index {Number} The index at which to replace the object
    * @param obj {Object} The object to put in place
    * @return {Object} The object which was replaced
    */
   replaceAt: function(index, obj) {
      Assert(!(index < 0 || index > this.size()), "Index out of range when inserting object!");
		var o = this._find(index);
		var r = o.ptr;
		o.ptr = obj;
      return r;      
   },
   
   /**
    * Remove an object from the container.  The object is
    * not destroyed when it is removed from the container.
    *
    * @param obj {Object} The object to remove from the container.
    * @return {Object} The object that was removed
    */
   remove: function(obj) {
		var o = this._peek(obj);
		//AssertWarn(o != null, "Removing object from collection which is not in collection");
		
		if (o != null) {
			if (o === this._head && o === this._tail) {
				this.clear();
				this.sz = 0;
				return;	
			}

			if (o === this._head) {
				this._head = o.next;
				if (this._head == null) {
					this.clear();
					this.sz = 0;
					return;
				}
			}
			
			if (o === this._tail) {
				this._tail = o.prev;
			}

			if (o.next) o.next.prev = o.prev;
			if (o.prev) o.prev.next = o.next;
			o.prev = o.next = null;
			this.sz--;

	      if (obj.getId) {
	         Console.log("Removed ", obj.getId(), "[", obj, "] from ", this.getId(), "[", this, "]");
	      }

			return o.ptr;		
		}
		return null;
   },

   /**
    * Remove an object from the container at the specified index.
    * The object is not destroyed when it is removed.
    *
    * @param idx {Number} An index between zero and the size of the container minus 1.
    * @return {Object} The object removed from the container.
    */
   removeAtIndex: function(idx) {
      Assert((idx >= 0 && idx < this.size()), "Index of out range in Container");

		var o = this._find(idx);
		if (o === this._head) {
			this._head = o.next;
		}
		if (o === this.tail) {
			this._tail = o.prev;
		}
		if (o.next) o.next.prev = o.prev;
		if (o.prev) o.prev.next = o.next;
		o.prev = o.next = null;
		var r = o.ptr;
		
      Console.log("Removed ", r.getId(), "[", r, "] from ", this.getId(), "[", this, "]");
		this.sz--;
      return r;
   },

	/**
	 * Reduce the container so that it's length is the specified length.  If <code>length</code>
	 * is larger than the size of this container, no operation is performed.  Setting <code>length</code>
	 * to zero is effectively the same as calling {@link #clear}.  Objects which would logically
	 * fall after <code>length</code> are not automatically destroyed.
	 * 
	 * @param length {Number} The maximum number of elements
	 * @return {Container} The subset of elements being removed
	 */
	reduce: function(length) {
		if (length > this.size()) {
			return Container.create();
		}
		var a = this.getAll();
		var sub = this.subset(length, a.length, a);
		if (length == 0) {
			return sub;
		}

		a.length = length;
		this.clear();
		for (var i in a) {
			this.add(a[i]);
		}
		return sub;		
	},

	/**
	 * A new <code>Container</code> which is a subset of the current container
	 * from the starting index (inclusive) to the ending index (exclusive).  Modifications
	 * made to the objects in the subset will affect this container's objects.
	 *  
	 * @param start {Number} The starting index in the container
	 * @param end {Number} The engine index in the container
	 * @return {Container} A subset of the container.
	 */
	subset: function(start, end, b) {
		var a = b || this.getAll();
		var c = Container.create();
		for (var i = start; i < end; i++) {
			c.add(a[i]);
		}
		return c;			
	},

   /**
    * Get the object at the index specified. If the container has been
    * sorted, objects might not be in the position you'd expect.
    *
    * @param idx {Number} The index of the object to get
    * @return {Object} The object at the index within the container
    * @throws {Error} Index out of bounds if the index is out of the list of objects
    */
   get: function(idx) {
      if (idx < 0 || idx > this.size()) {
         throw new Error("Index out of bounds");
      }
		return this._find(idx).ptr;
   },
	
	/**
	 * Get an array of all of the objects in this container.
	 * @return {Array} An array of all of the objects in the container
	 */
	getAll: function() {
		var a = [], i = this.iterator();
		while (i.hasNext()) {
			a.push(i.next());
		}
		i.destroy();
		return a;
	},

	/**
	 * For each object in the container, the function will be executed.
	 * The function takes one argument: the object being processed.
	 * Unless otherwise specified, <code>this</code> refers to the container.
	 * <p/>
	 * Returning <tt>false</tt> from <tt>fn</tt> will immediately halt any
	 * further iteration over the container.
	 * 
	 * @param fn {Function} The function to execute for each object
	 * @param [thisp] {Object} The object to use as <code>this</code> inside the function
	 */
	forEach: function(fn, thisp) {
		var itr = this.iterator();
		var result = true;
		var hasMethod = thisp && thisp.isDestroyed;
		while (itr.hasNext() && (hasMethod ? !thisp.isDestroyed() && result : result)) {
			result = fn.call(thisp || this, itr.next());
			result = (result == undefined ? true : result);
		}
		itr.destroy();
	},
	
	/**
	 * Filters the container with the function, returning a new <code>Container</code>
	 * with the objects that pass the test in the function.  If the object should be
	 * included in the new <code>Container</code>, the function should return <code>true</code>.
	 * The function takes one argument: the object being processed.
	 * Unless otherwise specified, <code>this</code> refers to the container.
	 * 
	 * @param fn {Function} The function to execute for each object
	 * @param [thisp] {Object} The object to use as <code>this</code> inside the function
	 * @return {Container}
	 */
	filter: function(fn, thisp) {
		var arr = EngineSupport.filter(this.getAll(), fn, thisp || this);
		var c = Container.create();
		c.addAll(arr);
		return c;		
	},
	
   /**
    * Remove all objects from the container.  None of the objects are
    * destroyed, only removed from this container.
    */
   clear: function() {
		this._head = null;
		this._tail = null;
		this.sz = 0;
   },

   /**
    * Remove and destroy all objects from the container.
    */
   cleanUp: function() {
		var a = this.getAll(), h;
		while (a.length > 0) {
			h = a.shift();
			if (h.destroy) {
				h.destroy();
			}
		}
      this.clear();
   },

   /**
    * Get the array of all objects within this container.  If a filtering
    * function is provided, only objects matching the filter will be
    * returned from the object collection.
    * <p/>
    * The filter function needs to return <tt>true</tt> for each element
    * that should be contained in the filtered set.  The function will be
    * passed the following arguments:
    * <ul>
    * <li>element - The array element being operated upon</li>
    * <li>index - The index of the element in the array</li>
    * <li>array - The entire array of elements in the container</li>
    * </ul>
    * Say you wanted to filter a host objects components based on a
    * particular type.  You might do something like the following:
    * <pre>
    * var logicComponents = host.getObjects(function(el, idx) {
    *    if (el.getType() == BaseComponent.TYPE_LOGIC) {
    *       return true;
    *    }
    * });
    * </pre>
    *
    * @param filterFn {Function} A function to filter the set of
    *                 elements with.  If you pass <tt>null</tt> the
    *                 entire set of objects will be returned.
    * @return {Array} The array of filtered objects
    */
   getObjects: function(filterFn) {
		var a = this.getAll();
      if (filterFn) {
         return EngineSupport.filter(a, filterFn);
      } else {
         return a;
      }
   },

   /**
    * Sort the objects within the container, using the provided function.
    * The function will be provided object A and B.  If the result of the
    * function is less than zero, A will be sorted before B.  If the result is zero,
    * A and B retain their order.  If the result is greater than zero, A will
    * be sorted after B.
    *
    * @param [fn] {Function} The function to sort with. If <tt>null</tt> the objects
    *          will be sorted in "natural" order.
    */
   sort: function(fn) {
      Console.log("Sorting ", this.getName(), "[" + this.getId() + "]");
		var a = this.getAll().sort(fn);
		
		// Relink
		this._head = this._new(a[0]);
		var p=this._head;
		for (var i = 1; i < a.length; i++) {
			var n = this._new(a[i]);
			p.next = n;
			n.prev = p;
			p = n;
		}
		this._tail = p;
		this.sz = a.length;
   },

   /**
    * Returns a property object with accessor methods to modify the property.
    * @return {Object} The properties object
    */
   getProperties: function() {
      var self = this;
      var prop = this.base(self);
      return $.extend(prop, {
         "Contains"  : [function() { return self.size(); },
                        null, false]
      });
   },

   /**
    * Serializes a container to XML.
    * @return {String} The XML string
    */
   toXML: function(indent) {
      indent = indent ? indent : "";
      var props = this.getProperties();
      var xml = indent + "<" + this.constructor.getClassName();
      for (var p in props) {
         // If the value should be serialized, call it's getter
         if (props[p][2]) {
            xml += " " + p.toLowerCase() + "=\"" + props[p][0]().toString() + "\"";
         }
      }
      xml += ">\n";

      // Dump children
		var all = this.getAll();
      for (var o in all) {
         xml += all[o].toXML(indent + "  ");
      }

      // Closing tag
      xml += indent + "</" + this.constructor.getClassName() + ">\n";
      return xml;
   },
   
   /**
    * Returns an iterator over the collection.
    * @return {Iterator} An iterator
    */
   iterator: function() {
      return Iterator.create(this);   
   }

}, /** @scope Container.prototype */{
   /**
    * Get the class name of this object
    *
    * @return {String} "Container"
    */
   getClassName: function() {
      return "Container";
   }
});

return Container;

});

Engine.initObject("HashContainer", "Container", function() {

/**
 * @class A hash container is a logical collection of objects.  A hash container
 *        is a container with a backing object for faster lookups.  Objects within
 *        the container must have unique names. When the container is destroyed, none of the
 *        objects within the container are destroyed with it.  Call {@link #cleanUp} to 
 *        destroy all of the objects in the container.
 *
 * @param containerName {String} The name of the container. Default: Container
 * @extends Container
 * @constructor
 * @description Create a hashed container object.
 */
var HashContainer = Container.extend(/** @scope HashContainer.prototype */{

   objHash: null,

   /**
    * @private
    */
   constructor: function(containerName) {
      this.base(containerName || "HashContainer");
      this.objHash = {};
   },

   /**
    * Release the object back into the object pool.
    */
   release: function() {
      this.base();
      this.objHash = null;
   },

   /**
    * Returns <tt>true</tt> if the object name is already in
    * the hash.
    *
    * @param name {String} The name of the hash to check
    * @return {Boolean}
    */
   isInHash: function(key) {
      return (this.objHash["_" + String(key)] != null);
   },

   /**
    * Add an object to the container.
    *
    * @param key {String} The name of the object to store.  Names must be unique
    *                      or the object with that name will be overwritten.
    * @param obj {BaseObject} The object to add to the container.
    */
   add: function(key, obj) {
      AssertWarn(!this.isInHash(key), "Object already exists within hash!");

      if (this.isInHash(key)) {
         // Remove the old one first
         this.removeHash(key);
      }

      // Some keys weren't being accepted (like "MOVE") so added
      // an underscore to prevent keyword collisions
      this.objHash["_" + String(key)] = obj;
      this.base(obj);
   },
   
   /** @private */
   addAll: function() {
   	throw new Error("addAll() is unsupported in HashContainer");
   },
   
   /** @private */
   clone: function() {
   	throw new Error("clone() is unsupported in HashContainer");
   },
   
   /** @private */
   concat: function() {
   	throw new Error("concat() is unsupported in HashContainer");
   },

   /** @private */
   reduce: function() {
   	throw new Error("reduce() is unsupported in HashContainer");
   },

   /**
    * Remove an object from the container.  The object is
    * not destroyed when it is removed from the container.
    *
    * @param obj {BaseObject} The object to remove from the container.
    */
   remove: function(obj) {
      for (var o in this.objHash)
      {
         if (this.objHash[o] === obj)
         {
            this.removeHash(o);
            break;
         }
      }

      this.base(obj);
   },

   /**
    * Remove the object with the given key name from the container.
    *
    * @param name {String} The object to remove
    * @return {Object} The object removed
    */
   removeHash: function(key) {
      var obj = this.objHash["_" + String(key)];
      EngineSupport.arrayRemove(this.objects, this.objHash["_" + String(key)]);
      delete this.objHash["_" + String(key)];
      return obj;
   },

   /**
    * Remove an object from the container at the specified index.
    * The object is not destroyed when it is removed.
    *
    * @param idx {Number} An index between zero and the size of the container minus 1.
    * @return {Object} The object removed from the container.
    */
   removeAtIndex: function(idx) {
      var obj = this.base(idx);
      for (var o in this.objHash) {
         if (this.objHash[o] === obj) {
            this.removeHash(o);
            break;
         }
      }

      return obj;
   },

   /**
    * If a number is provided, the request will be passed to the
    * base object, otherwise a name is assumed and the hash will
    * be retrieved.
    *
    * @param idx {Number|String} The index or hash of the object to get
    * @return {Object}
    */
   get: function(idx) {
      if (typeof idx == 'string') {
         return this.objHash["_" + String(idx)];
      } else {
         return this.base(idx);
      }
   },

   /**
    * Remove all objects from the container.  None of the objects are
    * destroyed.
    */
   clear: function() {
      this.base();
      this.objHash = {};
   },

   /**
    * Cleans up the references to the objects (destroys them) within
    * the container.
    */
   cleanUp: function() {
      this.base();
   }

}, /** @scope HashContainer.prototype */{
   /**
    * Get the class name of this object
    *
    * @return {String} "HashContainer"
    */
   getClassName: function() {
      return "HashContainer";
   }
});

return HashContainer;

});

/** 
 * The RedBlackNode is a private class which is used by the RedBlackTree class
 * to contain the data.  It is a simple container with basic structures
 * which are accessed directly.  Modification of this class should be done 
 * with care!!
 * @private
 */
var RedBlackNode = Base.extend({
	e: null,
	left: null,
	right: null,
	color: 0,
	
	constructor: function(element, left, right) {
		this.element = element;
		this.left = left || null;
		this.right = right || null;
		this.color = 1;	// Starts BLACK
	}	
}, {
	BLACK: 1,
	RED: 0
});

Engine.initObject("RedBlackTree", "BaseObject", function() {

/**
 * @class An implementation of a RedBlackTree data structure.  RedBlackTree has
 *			 a worst-case time of O(log n) which is fast enough to quickly locate
 *			 objects in the tree.  Duplicates are not allowed in a RedBlackTree.
 *			 <p/>
 *			 Items added to a RedBlackTree must implement a <code>compareTo(t)</code>
 *			 method which returns a Number.  Zero if the value of the item is equal to
 *			 "t", -1 if the value is less than t, 1 if the value is greater than "t".
 *			 <p/>
 *			 References:
 *			   http://www.java-tips.org/java-se-tips/java.lang/red-black-tree-implementation-in-java.html<br/>
 *				http://www.eternallyconfuzzled.com/tuts/datastructures/jsw_tut_rbtree.aspx
 *
 * @param name {String} The name of the container. Default: RBTree
 * @extends BaseObject
 * @constructor
 * @description Create a red-black tree object.
 * @private
 */
var RedBlackTree = BaseObject.extend({

	nullNode:null,
	current:null,
	parent:null,
	grand:null,
	great:null,
	header:null,

	constructor: function(name) {
		this.base(name || "RBTree");
		this.header = new RedBlackNode(null);
		this.header.left = this.header.right = nullRBNode;

		this.nullNode = new RedBlackNode(null);
		this.nullNode.left = this.nullNode.right = this.nullNode;
	},
	
	/**
    * Insert into the tree.  <code>item</code> must implement the <code>compareTo(t)</code>
    * method, otherwise insertion will fail with an assertion.
    *
    * @param item {Object} the item to insert.
    */	
   insert: function(item) {
   	Assert(item.compareTo, "Items added to RedBlackTree must implement compareTo(t) method");
   	this.current = this.parent = this.grand = this.header;
   	this.nullNode.element = item;
   	
   	while(RedBlackTree.compare(item, this.current) != 0) {
   		this.great = this.grand; this.grand = this.parent; this.parent = this.current;
   		this.current = RedBlackTree.compare(item, this.current) < 0 ?
   			this.current.left : this.current.right;
   			
   		// Check if two red children; fix if so
   		if (this.current.left.color == RedBlackNode.RED &&
   			 this.current.right.color == RedBlackNode.RED) {
   			 	this.handleReorient(item);
   		}
   	}
   	
   	// Insertion fails if item already present
   	Assert(this.current == this.nullNode, "RedBlackTree duplication exception: " + item.toString());
   	this.current = new RedBlackNode(item, this.nullNode, this.nullNode);
   	
   	// Attach to parent
   	if (RedBlackTree.compare(item, this.parent) < 0) {
   		this.parent.left = this.current;
   	} else {
   		this.parent.right = this.current;
   	}
   	
   	this.handleReorient(item);
   },
   
   remove: function(item) {
   	// see: http://www.eternallyconfuzzled.com/tuts/datastructures/jsw_tut_rbtree.aspx
   },
   
   /**
    * Replace the the item in the tree with the new item.
    * @param oldItem {Object} The object to find
    * @param newItem {Object} The object to replace it with
    */
   replace: function(oldItem, newItem) {
   	Assert(newItem.compareTo, "Cannot use replace() in RedBlackTree if item doesn't have compareTo()");
   	var node = this.findNode(oldItem);
   	if (node) {
	   	node.element = newItem;
	   }
   },
   
   /**
    * Find the smallest item  the tree.
    * @return the smallest item or null if empty.
    */
   findMin: function() {
   	if (this.isEmpty()) {
   		return null;
   	} else {
   		var itr = this.header.right;
   		while (itr.left != this.nullNode) {
   			itr = itr.left;
   		}
   		
   		return itr.element;
   	}
   },
   
   /**
    * Find the largest item in the tree.
    * @return the largest item or null if empty.
    */
   findMax: function() {
		if (this.isEmpty()) {
			return null;
		} else {
			var itr = this.header.right;
			while (itr.right != this.nullNode) {
				itr = itr.right;
			}
			
			return itr.element;
		}
   },
   
   /**
    * Find an item in the tree. The item "x" must implement the <code>compareTo(t)</code>method.
    * @param x {Object} the item to search for.
    * @return {Object} the matching item or <code>null</code> if not found.
    */
   find: function(x) {
   	Assert(x.compareTo, "Cannot use find() in RedBlackTree if item doesn't have compareTo()");
   	var node = this.findNode(x);
   	return node.element;
   },
   
   /**
    * Find the node containing an item in the tree.
    * The item "x" must implement the <code>compareTo(t)</code>method.
    * @param x {Object} the item to search for.
    * @return {RedBlackNode} the matching node or <code>null</code> if not found.
    */
   findNode: function(x) {
   	Assert(x.compareTo, "Cannot use findNode() in RedBlackTree if item doesn't have compareTo()");
   	this.nullNode.element = x;
   	this.current = this.header.right;
   	
   	for ( ; ; ) {
   		if (x.compareTo(this.current.element) < 0) {
   			this.current = this.current.left;
   		} else if (x.compareTo(current.element) > 0) {
   		   this.current = this.current.right;
   		} else if (current != nullNode) {
   			return this.current;
   		} else {
   		   return null;
   		}
   	}
   },
   
   /**
    * Make the tree logically empty.
    */
   makeEmpty: function() {
   	this.header.right = this.nullNode;
   },
   
   /**
    * Test if the tree is logically empty.
    * @return true if empty, false otherwise.
    */
   isEmpty: function() {
   	return this.header.right == this.nullNode;
   },
   
    /**
     * Internal routine that is called during an insertion
     * if a node has two red children. Performs flip and rotations.
     * @param item the item being inserted.
     * @private
     */
   handleReorient: function(item) {
   	// Do the color flip
   	this.current.color = RedBlackNode.RED;
   	this.current.left.color = RedBlackNode.BLACK;
   	this.current.right.color = RedBlackNode.BLACK;
   	
   	if (this.parent.color == RedBlackNode.RED) {		// Have to rotate
   		this.grand.color = RedBlackNode.RED;
   		if ((RedBlackTree.compare(item, this.grand) < 0) !=
   			 (RedBlackTree.compare(item, this.parent) < 0)) {
   			 	this.parent = this.rotate(item, this.grand);	// Start double rotate
   		}
   		this.current = this.rotate(item, this.great);
   		this.current.color = RedBlackNode.BLACK;
   	}
   	this.header.right.color = RedBlackNode.BLACK;
   },
   
   /**
    * Internal routine that performs a single or double rotation.
    * Because the result is attached to the parent, there are four cases.
    * Called by handleReorient.
    * @param item the item in handleReorient.
    * @param parent the parent of the root of the rotated subtree.
    * @return the root of the rotated subtree.
    * @private
    */
   rotate: function(item, prnt) {
   	if (RedBlackTree.compare(item, prnt) < 0) {
   		return prnt.left = RedBlackTree.compare(item, prnt.left) < 0 ?
   			RedBlackTree.rotateWithLeftChild(prnt.left) :
   			RedBlackTree.rotateWithRightChild(prnt.left);
   	} else {
   		return prnt.right = RedBlackTree.compare(item, prnt.right) < 0 ?
   			RedBlackTree.rotateWithLeftChild(prnt.right) :
   			RedBlackTree.rotateWithRightChild(prnt.right);
   	}
   }

}, /** @scope RedBlackTree.prototype */{

	getClassName: function() {
		return "RedBlackTree";
	},

	/**
    * Compare item and t.element, using compareTo, with
    * caveat that if t is header, then item is always larger.
    * This routine is called if is possible that t is header.
    * If it is not possible for t to be header, use compareTo directly.
    * @private
    */
   compare: function(item, t) {
		if (t == header) {
			return 1;
		} else {
			return item.compareTo(t.element);
		}
	},
	
   /**
    * Rotate binary tree node with left child.
    */
	rotateWithLeftChild: function(k2) {
		var k1 = k2.left;
		k2.left = k1.right;
		k1.right = k2;
		return k1;
	},

   /**
    * Rotate binary tree node with right child.
    */
	rotateWithRightChild: function(k1) {
		var k2 = k1.right;
		k1.right = k2.left;
		k2.left = k1;
		return k2;
	}
});


return RedBlackTree;

});
