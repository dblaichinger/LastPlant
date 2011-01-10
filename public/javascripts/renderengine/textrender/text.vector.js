/**
 * The Render Engine
 * VectorText
 *
 * @fileoverview A simple text renderer which draws text using lines.  It has a
 *               limited character set.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori $
 * @version: $Revision: 1325 $
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
Engine.include("/engine/engine.math2d.js");
Engine.include("/textrender/text.abstractrender.js");

Engine.initObject("VectorText", "AbstractTextRenderer", function() {

/**
 * @class A text renderer which draws text with simple vectors.  This type of text
 *        renderer is only supported by the {@link CanvasContext}.  For an {@link HTMLElementContext}
 *        or a derivative, use the {@link ContextText} renderer.
 *
 * @constructor
 * @param componentName {String} The name of the text component
 * @param priority {Number} The priority of the component
 * @extends AbstractTextRenderer
 */
var VectorText = AbstractTextRenderer.extend(/** @scope VectorText.prototype */{

   rText: null,

   spacing: 0,

   /**
    * @private
    */
   constructor: function(componentName, priority) {
      this.base(componentName, priority);
      this.rText = [];
      this.setTextWeight(1.5);
   },

   /**
    * @private
    */
   release: function() {
      this.base();
      this.rText = null;
      this.spacing = 0;
      this.setTextWeight(1.5);
   },

   /**
    * Calculate the bounding box for the text and set it on the host object.
    * @private
    */
   calculateBoundingBox: function() {

      var x1 = 0;
      var x2 = 0;
      var y1 = 0;
      var y2 = 0;
      for (var p = 0; p < this.rText.length; p++)
      {
         var pt = this.rText[p];
         if (pt) {
            if (pt.x < x1)
            {
               x1 = pt.x;
            }
            if (pt.x > x2)
            {
               x2 = pt.x;
            }
            if (pt.y < y1)
            {
               y1 = pt.y;
            }
            if (pt.y > y2)
            {
               y2 = pt.y;
            }
         }
      }

      this.getHostObject().setBoundingBox(new Rectangle2D(x1 * this.getSize(), y1 * this.getSize(), (Math.abs(x1) + x2 + 2) * this.getSize(), (Math.abs(y1) + y2 + 2) * this.getSize()));
   },

   /**
    * Set the scaling of the text
    * @param size {Number}
    */
   setSize: function(size) {
      this.base(size);
      this.calculateBoundingBox();
   },

   /**
    * Set the text to render.
    *
    * @param text {String} The text to vectorize
    */
   setText: function(text) {
      // We only have uppercase letters
      text = String(text).toUpperCase();
      this.base(text);
		
		if (this.rText.length > 0) {
			for (var r in this.rText) {
				if (this.rText[r])
					this.rText[r].destroy();
			}
		}
		
      this.rText = [];
      var spacing = 11.5;

      // Replace special chars
      text = text.replace(/&COPY;/g,"a").replace(/&REG;/g,"b");

      var lCount = text.length;
      var align = this.getTextAlignment();
      var letter = (align == AbstractTextRenderer.ALIGN_RIGHT ? text.length - 1 : 0);
      var kern = new Point2D((align == AbstractTextRenderer.ALIGN_RIGHT ? -spacing : spacing), 0);
		var lineHeight = this.getSize() * 5;
		var y = 0;
      //var space = new Point2D((align == AbstractTextRenderer.ALIGN_RIGHT ? -spacing : spacing) * 0.07, 0);


      // Vectorize the text
      var pc = new Point2D(0,y);
      while (lCount-- > 0)
      {
         var ltr = [];
			var chr = text.charCodeAt(letter);
			if (chr == 10) {
				// Support multi-line text
				y += (this.getSize() * 10) + this.getLineSpacing();
				pc.set(0, y);
			} else {
	         var glyph = VectorText.charSet[chr - 32];
	         if (glyph.length == 0)
	         {
	            pc.add(kern);
	         }
	         else
	         {
	            for (var p = 0; p < glyph.length; p++)
	            {
	               if (glyph[p] != null)
	               {
	                  this.rText.push(Point2D.create(glyph[p][0], glyph[p][1]).add(pc));
	               }
	               else
	               {
	                  this.rText.push(null);
	               }
	            }
	            this.rText.push(null);
	            pc.add(kern);
	         }
			}
         letter += (align == AbstractTextRenderer.ALIGN_RIGHT ? -1 : 1);
      }
		pc.destroy();
      this.calculateBoundingBox();
   },

   /**
    * @private
    */
   execute: function(renderContext, time) {

      if (this.rText.length == 0)
      {
         return;
      }

      renderContext.pushTransform();
      renderContext.setScale(this.getSize());
      // Set the stroke and fill styles
      if (this.getColor() != null)
      {
         renderContext.setLineStyle(this.getColor());
      }

      renderContext.setLineWidth(this.getTextWeight());
      renderContext.drawPolyline(this.rText);
      renderContext.popTransform();
   }


}, /** @scope VectorText.prototype */{

   /**
    * Get the class name of this object
    * @return {String} The string "VectorText"
    */
   getClassName: function() {
      return "VectorText";
   },

   /**
    * The character set
    * @private
    */
   charSet:
   [
      [ ], // Space
      [[ 0,-5],[ 0, 3.5],null   ,[ 0, 4.5],[-0.5, 4.75],[ 0, 5],[0.5, 4.75],[0, 4.5]], // !
      [[-1,-4],[-2,-4],[-2,-5],[-1,-5],[-1,-4],[-2,-2],null   ,[ 2,-4],[ 1,-4],[ 1,-5],[ 2,-5],[ 2,-4],[ 1,-2]], // "
      [ ], // #
      [[ 5,-4],[-3,-4],[-5,-3],[-3, 0],[ 3, 0],[ 5, 3],[ 3, 4],[-5, 4],null   ,[ 0,-5],[ 0, 5]], // $
      [ ], // %
      [ ], // &
      [[-1,-4],[-2,-4],[-2,-5],[-1,-5],[-1,-4],[-2,-2]], // '
      [[ 1,-5],[-1,-3],[-1, 3],[ 1, 5]], // (
      [[-1,-5],[ 1,-3],[ 1, 3],[-1, 5]], // )
      [[-3,-3],[ 3, 3],null   ,[ 3,-3],[-3, 3],null   ,[-3, 0],[ 3, 0],null   ,[ 0,-3],[ 0, 3]], // *
      [[-4, 0],[ 4, 0],null   ,[ 0,-4],[ 0, 4]], // +
      [[ 1, 4],[ 0, 4],[ 0, 3],[ 1, 3],[ 1, 4],[ 0, 5]], // ,
      [[-4, 0],[ 4, 0]], // -
      [[ 0, 4],[ 1, 4],[ 1, 3],[ 0, 3],[ 0, 4]], // .
      [[ 5,-5],[-5, 5]], // /
//15
      [[ 5,-5],[-1,-5],[-1, 5],[ 5, 5],[ 5,-5],null   ,[ 5,-5],[-1, 5]], // 0
      [[ 1,-4],[ 3,-5],[ 3, 5]], // 1
      [[-5,-3],[ 0,-5],[ 5,-3],[-5, 5],[ 5, 5]], // 2
      [[-5,-5],[ 5,-5],[ 0,-1],[ 5, 2],[ 0, 5],[-5, 3]], // 3
      [[-2,-3],[-5, 0],[ 5, 0],null   ,[ 5,-5],[ 5, 5]], // 4
      [[ 5,-5],[-5,-5],[-5, 0],[ 3, 0],[ 5, 2],[ 3, 5],[-5, 5]], // 5
      [[-5,-5],[-5, 5],[ 5, 5],[ 5, 0],[-5, 0]], // 6
      [[-5,-5],[ 5,-5],[-2, 5]], // 7
      [[ 0, 0],[-4,-2],[ 0,-5],[ 4,-2],[-4, 2],[ 0, 5],[ 4, 2],[ 0, 0]], // 8
      [[ 4, 0],[-4, 0],[-4,-5],[ 4,-5],[ 4, 0],[-4, 5]], // 9
//25
      [[ 0, 1],[ 1, 1],[ 1, 0],[ 0, 0],[ 0, 1],null   ,[ 0, 4],[ 1, 4],[ 1, 3],[ 0, 3],[ 0, 4]], // :
      [[ 0, 1],[ 1, 1],[ 1, 0],[ 0, 0],[ 0, 1],null   ,[ 1, 4],[ 0, 4],[ 0, 3],[ 1, 3],[ 1, 4],[ 0, 5]], // ;
      [[ 4,-5],[-2, 0],[ 4, 5]], // <
      [[-4,-2],[ 4,-2],null   ,[-4, 2],[ 4, 2]], // =
      [[-4,-5],[ 2, 0],[-4, 5]], // >
      [[-3,-3],[ 0,-5],[ 3,-3],[ 0,-1],[ 0, 2],null   ,[ 0, 4],[ 1, 4],[ 1, 3],[ 0, 3],[ 0, 4]], // ?
      [[ 3, 5],[-3, 5],[-5, 3],[-5,-3],[-3,-5],[ 3,-5],[ 5,-3],[ 5, 2],[ 3, 3],[ 0, 3],[ 0, 0],[ 3, 0]], // @
//32
      [[-5, 5],[ 0,-5],[ 5, 5],[ 2, 2],[-2, 2]], // A
      [[-4, 5],[-4,-5],[ 3,-5],[ 5,-3],[ 3, 0],[-4, 0],null   ,[ 3, 0],[ 5, 3],[ 3, 5],[-4, 5]], // B
      [[ 5,-3],[ 0,-5],[-5,-3],[-5, 3],[ 0, 5],[ 5, 3]], // C
      [[-4, 5],[-4,-5],[ 2,-5],[ 4,-3],[ 4, 3],[ 2, 5],[-4, 5]], // D
      [[ 5,-5],[ 0,-5],[-3,-3],[ 0, 0],[-3, 3],[ 0, 5],[ 5, 5]], // E
      [[-4, 5],[-4, 0],[ 0, 0],[-4, 0],[-4,-5],[ 4,-5]], // F
      [[ 5,-5],[-4,-5],[-4, 5],[ 5, 5],[ 5, 1],[ 2, 1]], // G
      [[-4, 5],[-4,-5],null   ,[-4, 0],[ 4, 0],null   ,[ 4,-5],[ 4, 5]], // H
      [[-3, 5],[ 3, 5],null   ,[ 0, 5],[ 0,-5],null   ,[-3,-5],[ 3,-5]], // I
      [[ 3,-5],[ 3, 3],[ 0, 5],[-3, 3]], // J
      [[-4, 5],[-4,-5],null   ,[-4, 0],[ 5,-5],null   ,[-4, 0],[ 5, 5]], // K
      [[-4,-5],[-4, 5],[ 5, 5]], // L
      [[-4, 5],[-4,-5],[ 0, 0],[ 5,-5],[ 5, 5]], // M
      [[-4, 5],[-4,-5],[ 5, 5],[ 5,-5]], // N
      [[ 5,-5],[-2,-5],[-2, 5],[ 5, 5],[ 5,-5]], // O
      [[-4, 5],[-4,-5],[ 3,-5],[ 5,-3],[ 3, 0],[-4, 0]], // P
      [[-5, 0],[ 0,-5],[ 5, 0],[ 0, 5],[-5, 0],null   ,[ 3, 3],[ 5, 5]], // Q
      [[-4, 5],[-4,-5],[ 3,-5],[ 5,-3],[ 3, 0],[-4, 0],null   ,[ 3, 0],[ 5, 5]], // R
      [[ 5,-5],[-3,-5],[-5,-3],[-3, 0],[ 3, 0],[ 5, 3],[ 3, 5],[-5, 5]], // S
      [[-4,-5],[ 4,-5],null   ,[ 0,-5],[ 0, 5]], // T
      [[-4,-5],[-4, 3],[-3, 5],[ 3, 5],[ 5, 3],[ 5,-5]], // U
      [[-5,-5],[ 0, 5],[ 5,-5]], // V
      [[-5,-5],[-3, 5],[ 0,-3],[ 3, 5],[ 5,-5]], // W
      [[-4,-5],[ 5, 5],null   ,[ 5,-5],[-4, 5]], // X
      [[-5,-5],[ 0,-2],[ 5,-5],null   ,[ 0,-2],[ 0, 5]], // Y
      [[-4,-5],[ 5,-5],[-4, 5],[ 5, 5]], // Z
//58
      [[ 2,-5],[-1,-5],[-1, 5],[ 2, 5]], // [
      [[-5,-5],[ 5, 5]], // \
      [[-2,-5],[ 1,-5],[ 1, 5],[-2, 5]], // ]
      [[-3,-3],[ 0,-5],[ 3,-3]], // ^
      [[-5, 5],[ 5, 5]], // _
      [[ 1,-4],[ 2,-4],[ 2,-5],[ 1,-5],[ 1,-4],[ 2,-2]],  // `
//64

      // &copy;
      [[ 5,-3],[ 0,-5],[-5,-3],[-5, 3],[ 0, 5],[ 5, 3],[ 5,-3],null   ,[ 3,-1],[ 0,-3],[-3,-1],[-3, 1],[ 0, 3],[ 3, 1]],
      // &reg;
      [[ 5,-3],[ 0,-5],[-5,-3],[-5, 3],[ 0, 5],[ 5, 3],[ 5,-3],null   ,[-3, 2],[-3,-2],[ 2,-2],[ 3,-1],[ 2, 0],[-3, 0],null   ,[ 2, 0],[ 3, 2]]
   ]
});

return VectorText;

});
