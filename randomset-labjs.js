/*
 * NOTE: This is a copy of randomset.js without the module.exports, so it can 
 * be easily included and loaded in the lab.js task as a static file
 * There's almost certainly a better way, but I am not a JS genius.
 * Apologies to the future.
 */

class RandomSet {
  // Pick one of the 5 stimulus sets, with a stable ordering for each participant
  // We're limiting to 5 now because the 6th was picked from to fix issues 
  // with the first 5
  constructor(seedOrRng, order, lureDifficulty) {
    if (typeof seedOrRng === "string" || typeof seedOrRng === "number") {
      this.rng = seedrandom(seedOrRng);
    } else {
      this.rng = seedOrRng;
    }

    var stimulusSets = [1,2,3,4,5];
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

