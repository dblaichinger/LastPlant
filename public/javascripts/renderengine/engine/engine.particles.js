/**
 * The Render Engine
 * ParticleEngine
 *
 * @fileoverview The particle engine and base particle class.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
 * @author: $Author: bfattori@gmail.com $
 * @version: $Revision: 1331 $
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
Engine.include("/engine/engine.container.js");

Engine.initObject("Particle", "PooledObject", function() {

/**
 * @class Base particle class.  A particle only needs to implement the
 *        <tt>draw()</tt> method. The remainder of the functionality is
 *        handled by this abstract class.
 *
 * @param lifetime {Number} The life of the particle, in milliseconds
 * @extends PooledObject
 * @constructor
 * @description Create a particle
 */
var Particle = PooledObject.extend(/** @scope Particle.prototype */{

   life: 0,
   engine: null,
   birth: 0,
   dead: false,
   pos: null,

   /**
    * @private
    */
   constructor: function(lifetime) {
      this.base("Particle");
      this.life = lifetime;
      this.birth = 0;
      this.dead = false;
      this.pos = Point2D.create(0,0);
   },
   
   /**
    * Destroy the particle
    */
   destroy: function() {
   	this.pos.destroy();
   	this.base();
   },

   /**
    * Release the object back into the pool.
    */
   release: function() {
      this.base();
      this.life = 0;
      this.engine = null;
      this.birth = 0;
      this.dead = true;
      this.pos = null;
   },

   /**
    * Initializes the object within the <tt>ParticleEngine</tt>
    * @param pEngine {ParticleEngine} The particle engine which owns the particle
    * @param time {Number} The world time when the particle was created
    * @private
    */
   init: function(pEngine, time) {
      this.engine = pEngine;
      this.life += time;
      this.birth = time;
      this.dead = false;
   },

	/**
	 * Get the current position of the particle
	 * @return {Point2D}
	 */
	getPosition: function() {
		return this.pos;
	},
	
	/**
	 * Set the X and Y world coordinates of the particle
	 * @param x {Number} X world coordinate
	 * @param y {Number} Y world coordinate
	 */
	setPosition: function(x, y) {
		this.pos.set(x,y);
	},

   /**
    * Update the particle in the render context, calling its draw method.
    * @param renderContext {RenderContext} The context where the particle is drawn
    * @param time {Number} The world time, in milliseconds
    */
   update: function(renderContext, time) {
      if (time < this.life &&
      		renderContext.getViewport().containsPoint(this.getPosition())) {
	   	// if the particle is still alive, and it isn't outside the viewport
         this.draw(renderContext, time);
         return true;
      } else {
         return false;
      }
   },

   /**
    * Get the time-to-live for the particle (when it will expire)
    * @return {Number} milliseconds
    */
   getTTL: function() {
      return this.life;
   },

   /**
    * Get the time at which the particle was created
    * @return {Number} milliseconds
    */
   getBirth: function() {
      return this.birth;
   },

	

   /**
    * [ABSTRACT] Draw the particle
    * @param renderContext {RenderContext} The context to render the particle to
    * @param time {Number} The world time, in milliseconds
    */
   draw: function(renderContext, time) {
      // ABSTRACT
   }
   
}, /** @scope Particle.prototype */{
   /**
    * Get the class name of this object
    *
    * @return {String} "Particle"
    */
   getClassName: function() {
      return "Particle";
   }
});

return Particle;

});

Engine.initObject("ParticleEngine", "BaseObject", function() {

/**
 * @class The particle engine is a system for updating and expiring
 *        particles within a game environment.  This is registered with the
 *        render context so it will be updated at regular intervals.  The maximum
 *        number of supported particles can be configured, but defaults to 120.
 *        <p/>
 *        Particles should be simple objects which don't need to perform many
 *        calculations before being drawn.  All particles are rendered in world
 *        coordinates to speed up processing.
 *        </p>
 *        It is possible to run multiple particle engines within a render context,
 *        but it might be non-productive to do so.
 *
 * @extends BaseObject
 * @constructor
 * @description Create a particle engine
 */
var ParticleEngine = BaseObject.extend(/** @scope ParticleEngine.prototype */{

   particles: null,
   liveParticles: 0,
   lastTime: 0,
   maximum: 0,
   force: 0,

   /**
    * @private
    */
   constructor: function() {
      this.base("ParticleEngine");
      this.particles = Container.create();
      this.maximum = ParticleEngine.MAX_PARTICLES;
      this.liveParticles = 0;
   },

   /**
    * @private
    */
   destroy: function() {
		this.particles.cleanUp();
		this.particles.destroy();
      this.base();
   }, 

   /**
    * Releases the object back into the pool.
    */
   release: function() {
      this.base();
      this.particles = null,
      this.lastTime = 0;
      this.maximum = 0;
      this.liveParticles = 0;
   },

   /**
    * Add a group of particles at one time.  This reduces the number of calls
    * to {@link #addParticle} which resorts the array of particles each time.
    * @param particles {Container} A container of particles to add at one time
    */
   addParticles: function(particles) {
		if (!Container.isInstance(particles)) {
			// If the particles are an Array, convert to a Container first
			var oldP = particles;
			particles = Container.create();
			particles.addAll(oldP);
		}

      // If the new particles exceed the size of the engine's
      // maximum, truncate the remainder
      if (particles.size() > this.maximum) {
         var discard = particles.reduce(this.maximum);
			discard.cleanUp();
			discard.destroy();
      }
      
      // Initialize all of the new particles
      for (var i = particles.iterator(); i.hasNext(); ) {
         i.next().init(this, this.lastTime);
      }
		i.destroy();
      
      // The maximum number of particles to animate
      var total = this.liveParticles + particles.size();
      if (total > this.maximum) {
         total = this.maximum;
      }
      
		// If we can fit the entire set of particles without overflowing,
		// add all the particles and be done.
		if (particles.size() <= this.maximum - this.liveParticles) {
			this.particles.addAll(particles);
		} else {
			// There isn't enough space to put all of the particles into
			// the container.  So, we'll only add what we can.
			var maxLeft = this.maximum - total;
			var easySet = particles.subset(0, maxLeft);
			this.particles.addAll(easySet);
			easySet.destroy();
		}
		particles.destroy();
		this.liveParticles = this.particles.size();
   },

   /**
    * Add a single particle to the engine.  If many particles are being
    * added at one time, use {@link #addParticles} instead to add a
    * {@link Container} of particles.
    *
    * @param particle {Particle} A particle to animate
    */
   addParticle: function(particle) {
		if (this.particles.size() < this.maximum) {
         particle.init(this, this.lastTime);
			this.particles.add(particle);
			this.liveParticles = this.particles.size();
		} else {
			// nowhere to put it
			particle.destroy();
		}
   },
   
   /**
    * Set the absolute maximum number of particles the engine will allow.
    * @param maximum {Number} The maximum particles the particle engine allows
    */
   setMaximum: function(maximum) {
      var oldMax = this.maximum;
      this.maximum = maximum;
      
      // Kill off particles if the size is reduced
      if (this.maximum < oldMax) {
         var discard = this.particles.reduce(this.maximum);
			discard.cleanUp();
			discard.destroy();
      }
   },
   
   /**
    * Get the maximum number of particles allowed in the particle engine.
    * @return {Number}
    */
   getMaximum: function() {
      return this.maximum;
   },
   
   /**
    * Update a particle, removing it and nulling its reference
    * if it is dead.  Only live particles are updated
    * @private
    */
   runParticle: function(particle, renderContext, time) {
      if (!particle.update(renderContext, time)) {
			this.particles.remove(particle);
         particle.destroy();
      }
   },

   /**
    * Update the particles within the render context, and for the specified time.
    *
    * @param renderContext {RenderContext} The context the particles will be rendered within.
    * @param time {Number} The global time within the engine.
    */
   update: function(renderContext, time) {
      var p = 1;
      this.lastTime = time;

      Engine.addMetric("particles", this.liveParticles, false, "#");
      
      // If there are no live particles, don't do anything
      if (this.liveParticles == 0) {
         return;
      }

      renderContext.pushTransform();

		for (var itr = this.particles.iterator(); itr.hasNext(); ) {
			this.runParticle(itr.next(), renderContext, time);
		}
		itr.destroy();
      
      renderContext.popTransform();
      this.liveParticles = this.particles.size();
   },

   /**
    * Get the properties object for the particle engine
    * @return {Object}
    */
   getProperties: function() {
      var self = this;
      var prop = this.base(self);
      return $.extend(prop, {
         "Count" : [function() { return self.particles.size(); },
                    null, false]
      });
   }


}, /** @scope ParticleEngine.prototype */{
   /**
    * Get the class name of this object
    *
    * @return {String} "ParticleEngine"
    */
   getClassName: function() {
      return "ParticleEngine";
   },
   
   /**
    * Default maximum number of particles in the system. To change
    * the value, see {@link ParticleEngine#setMaximum}
    * @type Number
    */
   MAX_PARTICLES: 120

});

return ParticleEngine;

});