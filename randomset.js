'use strict';

var seedrandom = require('seedrandom');

module.exports = class RandomSet {
  // Pick one of the 6 stark stimulus sets, with a stable ordering for each participant
  constructor(seedOrRng, order, lureDifficulty) {
    if (typeof seedOrRng === "string" || typeof seedOrRng === "number") {
      this.rng = seedrandom(seedOrRng);
    } else {
      this.rng = seedOrRng;
    }

    var stimulusSets = [1,2,3,4,5,6];
    this.setOrder = this.shuffle(stimulusSets, this.rng);
  }

  // TODO: It would be good to unify this in a central place somehow instead of 
  // copying from order.js
  shuffle(a, rng) {
      var j, x, i;
      for (i = a.length - 1; i > 0; i--) {
          j = Math.floor(rng() * (i + 1));
          x = a[i];
          a[i] = a[j];
          a[j] = x;
      }
      return a;
  }

  pickRandomStimulusSetForSession(session) {
    var intSession = 0;

    if (Number.isInteger(session)) {
      intSession = parseInt(session);
    } else {
      var digits = session.toString().replace( /^\D+/g, '');
      intSession = parseInt(digits);
    }

    return this.setOrder[intSession - 1];
  }
}

