/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*
* Converted for The Render Engine v2.0
* Aug. 4, 2010 Brett Fattori
*/

Engine.initObject("Features", null, function() {
   
   var Features = Base.extend({
   
      _flip: 0,
      _m_id: null,
      _referenceFace: 0,
      _incidentEdge: 0,
      _incidentVertex: 0,
   
      constructor: function() {
         this._flip = 0;
         this._m_id = null;
         this._referenceFace = 0;
         this._incidentEdge = 0;
         this._incidentVertex = 0;
      },
      
      set_referenceFace: function(value) {
         this._referenceFace = value;
         this._m_id._key = (this._m_id._key & 0xffffff00) | (this._referenceFace & 0x000000ff)
      },
      
      get_referenceFace: function() {
         return this._referenceFace;
      },
      
      set_incidentEdge: function(value) {
         this._incidentEdge = value;
         this._m_id._key = (this._m_id._key & 0xffff00ff) | ((this._incidentEdge << 8) & 0x0000ff00)
      },
      
      get_incidentEdge: function() {
         return this._incidentEdge;
      },
      
      set_incidentVertex: function(value) {
         this._incidentVertex = value;
         this._m_id._key = (this._m_id._key & 0xff00ffff) | ((this._incidentVertex << 16) & 0x00ff0000)
      },
      
      get_incidentVertex: function() {
         return this._incidentVertex;
      },
      
      set_flip: function(value) {
         this._flip = value;
         this._m_id._key = (this._m_id._key & 0x00ffffff) | ((this._flip << 24) & 0xff000000)
      },
      
      get_flip: function(){
         return this._flip;
      }
      
      
   });
   
   return Features;
   
});
