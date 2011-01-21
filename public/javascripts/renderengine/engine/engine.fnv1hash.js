/**
 * The Render Engine
 * FNV1 Hashing
 *
 * @fileoverview Quickly generate a hash for the provided input.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori $
 * @version: $Revision: 1216 $
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
 * THE SOFTWARE
 */

/*
 * A family of fast hash functions, originally created by Glenn Fowler, Phong Vo,
 * and improved by Landon Curt Noll.  Implemented in Javascript by Brett Fattori.
 * 
 * <p>FNV1 hashes are designed to be fast while maintaining a low collision rate.
 * The FNV1 speed allows one to quickly hash lots of data while maintaining a
 * reasonable collision rate. The high dispersion of the FNV1 hashes makes them
 * well suited for hashing nearly identical strings such as URLs, hostnames,
 * filenames, text, IP addresses, etc.</p>
 * 
 * <p>FNV1a is a variant of FNV1, which is slightly better suited for hashing
 * short values (< 4 octets).</p>
 * 
 * <p>This is a straightforward port of the public domain C version,
 * written by Landon Curt Noll (one of the authors), available from
 * <a href="http://www.isthe.com/chongo/tech/comp/fnv/">his website</a>.</p>
 * 
 * <p>The usage pattern is as follows: to compute the initial hash value
 * you call one of the <code>init(...)</code> methods. After that you may
 * update the hash zero or more times with additional values using the
 * <code>update(...)</code> methods. When you are done, you can retrieve the
 * final hash value with {@link #getHash()}.</p>
 * <p>Individual instances of FNV1 are reusable after you call one of
 * the <code>init(...)</code> methods. However, these implementations are NOT
 * synchronized, so proper care should be taken when using this hash in a multi-threaded
 * environment.</p>
 * 
 * @author Brett Fattori &lt;bfattori AT gmail DOT com&gt;
 * @private
 */
var FNV1 = function(algo) {

   var hash = 0;

   // Create the linkage to the hashing algorithm
   var fnv = algo.fnv;
   var getHashValue = algo.getHash || function(h) { return Number(h).toString(16);};
   var INIT = algo.INIT;

   // Convert a string to an array of bytes
   function getBytes(s) {
      var buf = [];
      for (var i = 0; i < s.length; i++) {
         buf.push(s.charCodeAt(i));
      }
      return buf;
   }

   return {

      /**
       * Initialize this hash instance. Any previous state is reset, and the new
       * hash value is computed.
       * 
       * @param buf byte buffer from which to compute the hash
       * @param offset starting position in the buffer
       * @param len number of bytes after the starting position
       */
      init: function(buf, offset, len) {
         if (typeof buf == "string") {
            buf = getBytes(buf);
            offset = 0;
            len = buf.length;
         }
         hash = fnv(buf, offset, len, INIT);
      },

      /**
       * Update the hash value. Repeated calls to this method update the hash
       * value accordingly, and they are equivalent to calling the <code>init(...)</code>
       * method once with a concatenated value of all parameters.
       * @param s see (@link #init(String)}
       */
      update: function(buf, offset, len) {
         if (typeof buf == "string") {
            buf = getBytes(buf);
            offset = 0;
            len = buf.length;
         }
         hash = fnv(buf, offset, len, hash);
      },

      /**
       * Retrieve the hash value
       * @return hash value
       */
      getHash: function() {
         return getHashValue(hash);
      }
   };
};

/**
 * @class Implementation of FNV1 - a fast hash function.
 * 
 * <p>This implementation uses 32-bit operations, and the values returned from
 * {@link #getHash()} are limited to the lower 32 bits.</p>
 * 
 * @author Andrzej Bialecki &lt;ab@getopt.org&gt;
 */
var FNV132 = (function() {
   return {
      fnv: function(buf, offset, len, seed) {
         for (var i = offset; i < offset + len; i++) {
            seed += (seed << 1) + (seed << 4) + (seed << 7) + (seed << 8) + (seed << 24);
            seed ^= buf[i];
         }
         return seed;
      },
      
      getHash: function(hash) {
         return Number(hash & 0x00000000ffffffff).toString(16);
      },
      
      INIT: 0x811c9dc5
   };
})();

/**
 * @class Implementation of FNV1a - a fast hash function. The FNV1a variant provides a
 * slightly better dispersion for short (< 4 bytes) values than plain FNV1.
 * 
 * <p>This implementation uses 32-bit operations, and the values returned from
 * {@link #getHash()} are limited to the lower 32 bits.</p>
 * 
 * @author Andrzej Bialecki &lt;ab@getopt.org&gt;
 */
var FNV1a32 = (function() {
   return {
      fnv: function(buf, offset, len, seed) {
         for (var i = offset; i < offset + len; i++) {
            seed ^= buf[i];
            seed += (seed << 1) + (seed << 4) + (seed << 7) + (seed << 8) + (seed << 24);
         }
         return seed;
      },
      
      getHash: function(hash) {
         return Number(hash & 0x00000000ffffffff).toString(16);
      },

      INIT: 0x811c9dc5
   };
})();

// Include engine files
Engine.include("/engine/engine.pooledobject.js");

Engine.initObject("FNV1Hash", "PooledObject", function() {

   /**
    * @class A class for creating a single hash, or an evolving hash. Single hashes reset each time a new
    *        source string is provided, whereas the evolving hash will build upon previous hashes.  The
    *        hash for a string will always be the same.  Hashing a set of strings, in order, will always
    *        result in the same evolved hash.  Uses the {@link FNV1a32} hashing routine by default.
    *
    * @param [hashRoutine=FNV1a32] {FNV1} The hash routine to use.
    * @extends PooledObject
    */
   var FNV1Hash = PooledObject.extend(/** @scope FNV1Hash.prototype */{

      fnv132: null,
      
      gotten: null,

      constructor: function(hashRoutine) {
         this.base("FNV1Hash");
         this.fnv132 = new FNV1(hashRoutine || FNV1a32);
         this.gotten = false;
      },

      /**
       * Release the hash back into the pool for later use.
       */
      release: function() {
         this.base();
         this.fnv132 = null;
         this.gotten = null;
      },
      
      /**
       * Get a one-time hash for the provided string.  To instead update the hash
       * use the {@link #updateHash} to continually evolve the hash with new data.
       *
       * @param str {String} The value to get the hash for
       * @return {String} A hexadecimal hash of the string input
       */
      getHash: function(str) {
         this.gotten = true;
         this.fnv132.init(str);
         return this.fnv132.getHash();
      },
      
      /**
       * Update the existing hash with more data.
       *
       * @param str {String} The value to get the hash for
       * @return {String} A hexadecimal hash of the string input
       */
      updateHash: function(str) {
         if (this.gotten) {
            this.fnv132.update(str);
            return this.fnv132.getHash();
         } else {
            return this.getHash(str);
         }
      }
      
   }, { /** @scope FNV1Hash.prototype */
   
      getClassName: function() {
         return "FNV1Hash";
      }
   });
   
   return FNV1Hash;
   
});