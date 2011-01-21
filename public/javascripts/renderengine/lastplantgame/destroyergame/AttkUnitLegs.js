/**
    * Copyright (c) 2010 Michael Webersdorfer (mwebersdorfer@hotmail.com)
    * The LastPlant Javascript Game was created with "The Renderengine" (www.renderengine.com) by Brett Fattori (brettf@renderengine.com)
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

// Load engine objects
Engine.include("/components/component.transform2d.js");
Engine.include("/components/component.sprite.js");
Engine.include("/engine/engine.object2d.js");


Engine.initObject("AttkUnitLegs", "Object2D", function() {
   /**
    * @class The legs for the attacking unit. Legs do a throw animation via sprites, when needed
    *
    * @constructor
    * @extends Object2D
    * @description Class for the Legs of the attacking unit
    */
 var AttkUnitLegs = Object2D.extend(/** @scope BackgroundObj.prototype */{

        /**
         * @private
         */
        constructor: function(name) {
          this.base("AttkUnitLegs");

          this.add(Transform2DComponent.create("move"));
          this.add(SpriteComponent.create("draw"));

          this.getComponent("draw").setSprite(LastPlant.spriteLoader.getSprite("AttkUnitLegs", "Legs-stand"));
          
          // Set the starting position of the AttkUnitLegs
          this.setPosition(Point2D.create(0, 0));
        },

        /**
         * Set, or initialize, the position of the "move" component
         *
         * @param point {Point2D} The position to draw the legs in the playfield
         */
        setPosition: function(point) {
           this.base(point);
           this.getComponent("move").setPosition(point);
        },
         /**
         * Get the position of the "move" component
         *
         * @param point {Point2D} The position of the legs in the playfield
         */
        getPos: function() {
           return this.getComponent("move").getPosition();
        }

    }, /** @scope AttkUnitLegs.prototype */{ // Static
    
    /**
     * Get the class name of this object
     * @return {String} The string <tt>AttkUnitLegs</tt>
     */
    getClassName: function() {
       return "AttkUnitLegs";
      }
      
    });

return AttkUnitLegs;

});