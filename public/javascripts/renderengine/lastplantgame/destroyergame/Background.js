/**
<<<<<<< HEAD
 * LastPlant JS Game
 * Michael Webersdorfer 
 * 
 *
 * Created with Renderengine renderengine.com
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
Engine.include("/components/component.mover2d.js");
//Engine.include("/components/component.transform2d.js");
=======
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
Engine.include("/components/component.mover2d.js");
>>>>>>> 12a6c858ca3a1f66ff36776792d0e57daca43736
Engine.include("/components/component.sprite.js");
Engine.include("/engine/engine.object2d.js");


Engine.initObject("Background", "Object2D", function() {
<<<<<<< HEAD

=======
 
 /**
  * @class A simple Class to display the Background
  */
>>>>>>> 12a6c858ca3a1f66ff36776792d0e57daca43736
 var Background = Object2D.extend(/** @scope BackgroundObj.prototype */{

        /**
         * @private
         */
        constructor: function(name) {
          this.base("Background");

          this.add(Transform2DComponent.create("move"));
          this.add(SpriteComponent.create("draw"));

<<<<<<< HEAD
          //this.getComponent("draw").addSprite("Background", LastPlant.spriteLoader.getSprite("Background", "BackgroundIMG"));
          this.getComponent("draw").setSprite(LastPlant.spriteLoader.getSprite("Background", "BackgroundIMG"));
          //this.getComponent("draw").setPriority(0);

=======
          this.getComponent("draw").setSprite(LastPlant.spriteLoader.getSprite("Background", "BackgroundIMG"));
>>>>>>> 12a6c858ca3a1f66ff36776792d0e57daca43736
          
          // Set the starting position of the Background
          this.setPosition(Point2D.create(0, 0));
        },

    }, /** @scope Background.prototype */{ // Static
    
    /**
     * Get the class name of this object
     * @return {String} The string <tt>Background</tt>
     */
    getClassName: function() {
       return "Background";
      }
      
    });

return Background;

});