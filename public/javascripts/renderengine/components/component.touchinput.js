/**
 * The Render Engine
 * KeyboardInputComponent
 *
 * @fileoverview An extension of the input component to handle touch inputs from
 *               devices which support them.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori $
 * @version: $Revision: 1262 $
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
Engine.include("/engine/engine.events.js");
Engine.include("/components/component.input.js");

Engine.initObject("TouchInputComponent", "InputComponent", function() {

/**
 * @class A component which responds to touch events and notifies
 * its {@link HostObject} by calling one of four methods.  The <tt>HostObject</tt>
 * should implement any of the following methods to receive the corresponding event:
 * <ul>
 * <li><tt>onTouchStart()</tt> - A touch event started</li>
 * <li><tt>onTouchEnd()</tt> - A touch event ended</li>
 * <li><tt>onTouchMove()</tt> - A movement occurred after a touch event started</li>
 * <li><tt>onTouchCancel()</tt> - A touch event was cancelled</li>
 * </ul>
 * Each function should take up to two arguments.  The first argument is an array of
 * {@link Touch} objects which represent each touch that occurred in the event.  Some
 * platforms support multi-touch, so each touch will be represented in the array.  The 
 * second argument is the actual event object itself.
 *
 * @param name {String} The unique name of the component.
 * @param [passThru] {Boolean} set to <tt>true</tt> to pass the event to the device 
 * @param [priority] {Number} The priority of the component among other input components.
 * @extends InputComponent
 * @constructor
 * @description Create an instance of a touch input component. 
 */
var TouchInputComponent = InputComponent.extend(/** @scope TouchInputComponent.prototype */{

   /**
    * @private
    */
   constructor: function(name, passThru, priority) {
		passThru = (typeof passThru == "number" ? false : passThru);
		priority = (typeof passThru == "number" ? passThru : null);
      this.base(name, priority);

      var ctx = Engine.getDefaultContext();
      var self = this;

      // Add the event handlers
      ctx.addEvent(this, "touchstart", function(evt) {
			if (!passThru) {
	         evt.preventDefault();
			}
         return self._touchStartListener(evt);
      });
      ctx.addEvent(this, "touchend", function(evt) {
			if (!passThru) {
	         evt.preventDefault();
			}
         return self._touchEndListener(evt);
      });
      ctx.addEvent(this, "touchmove", function(evt) {
			if (!passThru) {
	         evt.preventDefault();
			}
         return self._touchMoveListener(evt);
      });
      ctx.addEvent(this, "touchcancel", function(evt) {
			if (!passThru) {
	         evt.preventDefault();
			}
         return self._touchCancelListener(evt);
      });
   },

   /**
    * Destroy this instance and remove all references.
    * @private
    */
   destroy: function() {
      var ctx = Engine.getDefaultContext();

      // Clean up event handlers
      ctx.removeEvent(this, "touchstart");
      ctx.removeEvent(this, "touchend");
      ctx.removeEvent(this, "touchmove");
      ctx.removeEvent(this, "touchcancel");
      this.base();
   },

   /**
    * Process the touches and pass an array of touch objects to be handled by the
    * host object.
    * @private
    */
   processTouches: function(eventObj) {
      var touches = [];
		if (eventObj.touches) {
	      for (var i = 0; i < eventObj.touches.length; i++) {
	         touches.push(new Touch(eventObj.touches[i]));
	      }
		}
      return touches;
   },

   /**
    * @private
    */
   _touchStartListener: function(eventObj) {
      if (this.getHostObject().onTouchStart) {
         return this.getHostObject().onTouchStart(this.processTouches(eventObj.originalEvent), eventObj);
      }
   },

   /**
    * @private
    */
   _touchEndListener: function(eventObj) {
      if (this.getHostObject().onTouchEnd) {
         return this.getHostObject().onTouchEnd(this.processTouches(eventObj.originalEvent), eventObj);
      }
   },

   /**
    * @private
    */
   _touchMoveListener: function(eventObj) {
      if (this.getHostObject().onTouchMove) {
         return this.getHostObject().onTouchMove(this.processTouches(eventObj.originalEvent), eventObj);
      }
   },

   /**
    * @private
    */
   _touchCancelListener: function(eventObj) {
      if (this.getHostObject().onTouchCancel) {
         return this.getHostObject().onTouchCancel(this.processTouches(eventObj.originalEvent), eventObj);
      }
   }

}, /** @scope TouchInputComponent.prototype */{
   /**
    * Get the class name of this object
    *
    * @return {String} "TouchInputComponent"
    */
   getClassName: function() {
      return "TouchInputComponent";
   },
   
   RECORD_PART: ["shiftKey","ctrlKey","altKey","keyCode"]
});

return TouchInputComponent;

});


Engine.initObject("Touch", null, function() {


   /**
    * @class An object which represents a touch event generated by a {@link TouchInputComponent}.
    *        Since touches are handled differently across platforms, this class aims to
    *        normalize what is returned and allow a game to handle the input without concern
    *        for platform.
    *
    * @param touch {Event} The touch from the event object
    * @extends InputComponent
    * @constructor
    * @description Create a touch object.
    */
   var Touch = Base.extend(/** @scope Touch.prototype */{

      touchX: null,
      touchY: null,

      /**
       * @private
       */
      constructor: function(touch) {
         this.touchX = touch.pageX;
         this.touchY = touch.pageY;
      },

      /**
       * Get the X coordinate of the touch
       * @return {Number} The X coordinate of the touch
       */
      getX: function() {
         return this.touchX;
      },

      /**
       * Get the Y coordinate of the touch
       * @return {Number} The Y coordinate of the touch
       */
      getY: function() {
         return this.touchY;
      },

      /**
       * Get a {@link Point2D} which represents the location of the touch
       * @return {Point2D} The coordinates of the touch
       */
      get: function() {
         return Point2D.create(this.touchX, this.touchY);
      }

   }, /** @scope TouchInputComponent.prototype */{
      /**
       * Get the class name of this object
       *
       * @return {String} "TouchInputComponent"
       */
      getClassName: function() {
         return "Touch";
      }
   });

   return Touch;

});
