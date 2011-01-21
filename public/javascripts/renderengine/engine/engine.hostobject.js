/**
 * The Render Engine
 * HostObject
 *
 * @fileoverview An object which contains components.  This is a base
 *               class for most in-game objects.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori $
 * @version: $Revision: 1374 $
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
Engine.include("/engine/engine.container.js");
Engine.include("/components/component.base.js");
Engine.include("/components/component.host.js");

Engine.initObject("HostObject", "HashContainer", function() {

/**
 * @class A host object is a container for components.  Each component within
 *        the host provides a portion of the overall functionality.  A host object
 *        can have any number of components of any type within it.  Components provide
 *        functionality for things like rendering, collision detection, effects, or 
 *        transformations. This way, an object can be anything, depending on it's components.
 *        <p/>
 *        A <tt>HostObject</tt> is the logical foundation for all in-game objects.  It is
 *        through this mechanism that game objects can be created without having to manipulate
 *        large, monolithic objects.  A <tt>HostObject</tt> contains {@link BaseComponent Components},
 *        which are the building blocks for complex functionality and ease of development.
 *        <p/>
 *        By building a <tt>HostObject</tt> from multiple components, the object gains the
 *        component's functionality without having to necessarily implement anything.  Many
 *        components already exist in the engine, but you are only limited by your imagination
 *        when it comes to developing new components.
 *
 * @extends HashContainer
 * @constructor
 * @description Create a host object.
 */
var HostObject = HashContainer.extend(/** @scope HostObject.prototype */{

   renderContext: null,

   /**
    * Release the object back into the object pool.
    */
   release: function() {
      this.base();
      this.renderContext = null;
   },

   /**
    * Destroy all of the components within this object and
    * remove this object from it's render context.
    */
   destroy: function() {
      if (this.getRenderContext()) {
         this.getRenderContext().remove(this);
      }
		this.cleanUp();
      this.base();
   },


   /**
    * Set the rendering context this object will be drawn within.  This method is
    * called when a host object is added to a rendering context.
    *
    * @param renderContext {RenderContext} The context
    */
   setRenderContext: function(renderContext) {
      this.renderContext = renderContext;
   },

   /**
    * Get the rendering context this object will be drawn upon.
    *
    * @return {RenderContext} The render context the object belongs to
    */
   getRenderContext: function() {
      return this.renderContext;
   },

   /**
    * Update this object within the render context, at the specified timeslice.
    *
    * @param renderContext {RenderContext} The context the object will be rendered within.
    * @param time {Number} The global time within the engine.
    */
   update: function(renderContext, time) {

      // Run the components
      var components = this.iterator();

      while (components.hasNext()) {
         components.next().execute(renderContext, time);
      }

		components.destroy();

      this.base(renderContext, time);
   },

   /**
    * Add a component to the host object.  The components will be
    * sorted based on their type then their priority within that type.
    * Components with a higher priority will be sorted before components
    * with a lower priority.  The sorting order for type is:
    * <ul>
    * <li>Input</li>
    * <li>Transform</li>
    * <li>Logic</li>
    * <li>Collision</li>
    * <li>Rendering</li>
    * </ul>
    *
    * @param component {BaseComponent} A component to add to the host
    */
   add: function(component) {

      Assert((BaseComponent.isInstance(component)), "Cannot add a non-component to a HostObject");
      Assert(!this.isInHash(component.getName()), "Components must have a unique name within the host");

      this.base(component.getName(), component);

      component.setHostObject(this);
      if (this.getObjects().length > 1)
      {
         this.sort(HostObject.componentSort);
      }
   },

   /**
    * Get the component with the specified name from this object.
    *
    * @param name {String} The unique name of the component to get
    * @return {BaseComponent}
    */
   getComponent: function(name) {
      return this.get(name.toUpperCase());
   },
   
   /**
    * Returns a property object with accessor methods.
    * @return {Object}
    */
   getProperties: function() {
      var self = this;
      var prop = this.base(self);
      return $.extend(prop, {
         "RenderContext" : [function() { return self.renderContext.getName(); },
                            null, false]
      });
   }

}, /** @scope HostObject.prototype */{

   /**
    * Sort components within this object based upon their component
    * type, and the priority within that type.  Components with a higher
    * priority will be sorted before components with a lower priority.
    * @static
    */
   componentSort: function(component1, component2) {
      return ((component1.getType() - component2.getType()) +
              ((1 / component1.getPriority()) - (1 / component2.getPriority())));
   },

   /**
    * Get the class name of this object
    *
    * @return {String} "HostObject"
    */
   getClassName: function() {
      return "HostObject";
   }

});

return HostObject;

});