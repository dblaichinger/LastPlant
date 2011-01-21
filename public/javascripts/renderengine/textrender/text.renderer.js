/**
 * The Render Engine
 *
 * @fileoverview A text renderer object that uses a specific render
 *               object to produce text when a render context cannot.
 *
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
 * @author: $Author: bfattori $
 * @version: $Revision: 1402 $
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
Engine.include("/engine/engine.object2d.js");
Engine.include("/components/component.transform2d.js");
Engine.include("/components/component.billboard2d.js");

Engine.initObject("TextRenderer", "Object2D", function() {

/**
 * @class A 2d text rendering object.  The object hosts the given text
 *        renderer, and a way to position and size the text.  It is up
 *        to the renderer provided to present the text within the render
 *        context.
 *
 * @constructor
 * @description Create an instance of one of the text renderers.
 * @param renderer {AbstractTextRenderer} The text renderer to use
 * @param text {String} The text to render
 * @param size {Number} The size of the text to render
 * @see VectorText
 * @see BitmapText
 * @see ContextText
 */
var TextRenderer = Object2D.extend(/** @scope TextRenderer.prototype */{

   drawMode: 0,
   
   renderer: null,

   /**
    * @private
    */
   constructor: function(renderer, text, size) {

      Assert((AbstractTextRenderer.isInstance(renderer)), "Text renderer must extend AbstractTextRenderer");

      this.base("TextRenderer");

      // Add components to move and draw the text
      this.renderer = renderer;
      if (!Engine.options.billboards || renderer.isNative()) {
         this.add(this.renderer);
      } else {
         this.add(Billboard2DComponent.create("billboard", this.renderer));
      }

      this.add(Transform2DComponent.create("transform"));

      renderer.setText(text || "");
      renderer.setSize(size || 1);
      this.drawMode = TextRenderer.DRAW_TEXT;
   },

   /**
    * @private
    */
   release: function() {
      this.base();
      this.drawMode = TextRenderer.DRAW_TEXT;
      this.renderer = null;
   },

   /**
    * Called to render the text to the context.
    *
    * @param renderContext {RenderContext} The context to render the text upon
    * @param time {Number} The engine time in milliseconds
    */
   update: function(renderContext, time) {

      if (this.drawMode == TextRenderer.DRAW_TEXT)
      {
         renderContext.pushTransform();
         this.base(renderContext, time);
         renderContext.popTransform();
      }

   },

   /**
    * @private
    */
   regen: function() {
      if (!Engine.options.billboards || this.renderer.isNative()) {
         return;
      } else {
         this.getComponent("billboard").regenerate();
      }
   },

   /**
    * Set the text for this object to render.  This method
    * <i>must</i> be implemented by a text renderer.
    *
    * @param text {String} The text to render.
    */
   setText: function(text) {
      this.renderer.setText(text);
      this.regen();
   },

   /**
    * Get the text for this object to render.  This method
    * <i>must</i> be implemented by a text renderer.
    * 
    * @return {String} The text to draw
    */
   getText: function() {
      return this.renderer.getText();
   },

   /**
    * Set the size of the text to render.
    *
    * @param size {Number} Defaults to 1
    */
   setTextSize: function(size) {
      this.renderer.setSize(size || 1);
      this.regen();
   },

   /**
    * Get the size of the text to render.
    * @return {Number} The size/scale of the text
    */
   getTextSize: function() {
      return this.renderer.getSize();
   },

   /**
    * Set the weight (boldness) of the text.  This method
    * is optional for a text renderer.
    *
    * @param weight {Object} The boldness of the given text renderer
    */
   setTextWeight: function(weight) {
      this.renderer.setTextWeight(weight);
      this.regen();
   },

   /**
    * Get the weight of the text.  This method is optional
    * for a text renderer.
    * @return {Object} The boldness of the given text renderer
    */
   getTextWeight: function() {
      return this.renderer.getTextWeight();
   },
   
   /**
    * Set the font for the text.  This method is optional
    * for a text renderer.
    * @param font {String} The text font
    */
   setTextFont: function(font) {
      this.renderer.setTextFont(font);
      this.regen();
   },
   
   /**
    * Get the font for the text.  This method is optional
    * for a text renderer.
    * @return {String} The text font
    */
   getTextFont: function() {
      return this.renderer.getTextFont();
   },
   
   /**
    * Set the style of the text.  This method is optional
    * for a text renderer.
    * @param style {String} The text style
    */
   setTextStyle: function(style) {
      this.renderer.setTextStyle(style);
      this.regen();
   },

   /**
    * Get the style for text.  This method is optional
    * for a text renderer.
    * @return {String} The text style
    */   
   getTextStyle: function() {
      return this.renderer.getTextStyle();
   },

   /**
    * Get the position where the text will render.
    * @return {Point2D} The position of the text
    */
   getPosition: function() {
      return this.getComponent("transform").getPosition();
   },

   /**
    * Set the position where the text will render.
    *
    * @param point {Point2D} The position to render the text
    */
   setPosition: function(point) {
      this.getComponent("transform").setPosition(point);
      point.destroy();
   },

   /**
    * Set the horizontal alignment of the text.  This method is optional
    * for a text renderer
    *
    * @param alignment {Object} A text alignment mode for the given text renderer.
    */
   setTextAlignment: function(alignment) {
      this.renderer.setTextAlignment(alignment);
      this.regen();
   },

   /**
    * Get the horizontal alignment of the text. This method is optional
    * for a text renderer.
    * @return {Number} The alignment mode for the given text renderer
    */
   getTextAlignment: function() {
      return this.renderer.getTextAlignment();
   },

   /**
    * Set the color of the text to render.
    *
    * @param color {String} The color of the text
    */
   setColor: function(color) {
      this.renderer.setColor(color);
      this.regen();
   },

   /**
    * Get the color of the text to render
    * @return {String} The text color
    */
   getColor: function() {
      return this.renderer.getColor();
   },

   /**
    * Set the color of the text.
    *
    * @param textColor {String} Color of the text.
    */
   setTextColor: function(textColor) {
      this.renderer.setColor(textColor);
      this.regen();
   },

   /**
    * Get the text color
    * @return {String} The color or style of the line
    */
   getTextColor: function() {
      return this.renderer.getColor();
   },

   /**
    * Set the text drawing mode to either {@link #DRAW_TEXT} or {@link #NO_DRAW}.
    *
    * @param drawMode {Number} The drawing mode for the text.
    */
   setDrawMode: function(drawMode) {
      this.drawMode = drawMode;
   },

   /**
    * Get the current drawing mode for the text.
    * @return {Number} The text drawing mode
    */
   getDrawMode: function() {
      return this.drawMode;
   }
}, /** @scope TextRenderer.prototype */{

   /**
    * Get the class name of this object
    * @return {String} The string "TextRenderer"
    */
   getClassName: function() {
      return "TextRenderer";
   },

   /**
    * Draw the text to the context.
    * @type Number
    */
   DRAW_TEXT: 0,

   /**
    * Don't draw the text to the context.
    * @type Number
    */
   NO_DRAW: 1,
   
   /**
    * The size of a text element, in pixels
    * @type Number
    */
   BASE_TEXT_PIXELSIZE: 12
});

return TextRenderer;

});

