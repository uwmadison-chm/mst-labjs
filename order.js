'use strict';

var seedrandom = require('seedrandom');

module.exports = class OrderFiller {
  constructor(seedOrRng, order, lureDifficulty) {
    if (typeof seedOrRng === "string" || typeof seedOrRng === "number") {
      this.rng = seedrandom(seedOrRng);
    } else {
      this.rng = seedOrRng;
    }
    this.order = order;
    this.trials = null;
    this.lureDifficulty = lureDifficulty;
    this.availableStimuli = [...Array(193).keys()].slice(1);
  }

  popStimuli() {
    var index = this.availableStimuli.length * this.rng() | 0;
    var value = this.availableStimuli.splice(index, 1);
    return value[0];
  }

  removeStimuli(x) {
    var index = this.availableStimuli.indexOf(x);
    this.availableStimuli.splice(index, 1);
  }

  buildLureBin(n) {
    var bin = [];
    for (var k in Object.keys(this.lureDifficulty)) {
      var difficulty = this.lureDifficulty[k];
      if (String(difficulty) == String(n)) {
        bin.push(parseInt(k));
      }
    }
    return bin;
  }

  initializeLureBins() {
    this.lureBins = [];
    for (var i = 1; i <= 5; i++) {
      this.lureBins[i] = this.buildLureBin(i);
    }
  }

  createLurePool(length) {
    // This has to be balanced across lureDifficulty, so the pool ends up with 
    // even-ish numbers of each difficulty of lure. So we create some bins 
    // that store the lures by difficulty, 1-5.
    var pool = [];
    if (!this.lureBins) {
      this.initializeLureBins();
    }
    for (var i = 0; i < length; i++) {
      // Now we pull evenly from each bin
      var bin = this.lureBins[(i % 5) + 1];
      // Pick one from chosen bin
      var index = bin.length * this.rng() | 0;
      var value = bin.splice(index, 1)[0];
      pool.push(value);
      // Also remove from the total available stimulus pool
      this.removeStimuli(value);
    }
    return pool;
  }

  createPool(length) {
    var pool = [];
    while (pool.length < length) {
      if (this.availableStimuli.length == 0) {
        throw new Error("No more available stimuli");
      }
      pool.push(this.popStimuli())
    }
    return pool;
  }

  createPools(size) {
    if (!size) {
      size = 64;
    }

    // Lures are pulled first, to balance according to lureDifficulty
    this.lures = this.createLurePool(size);
    this.repeats = this.createPool(size);
    this.foils = this.createPool(size);
  }

  makeTrial(order) {
    var index = order.stim_bin_index - 1;
    var bin;
    var stimulus_letter;
    switch(order.trial_type) {
      case "lure":
        bin = this.lures;
        stimulus_letter = order.repetition;
        break;
      case "repeat":
        bin = this.repeats;
        stimulus_letter = "a";
        break;
      default:
        stimulus_letter = "a";
        bin = this.foils;
    }
    return {
      // force numeric
      "stimulus_number": Number(bin[Number(index)]),
      "stimulus_letter": stimulus_letter,
      "trial_type": order.trial_type,
      "repetition": order.repetition,
      "lag": order.lag,
      "trial_number": order.trial_number,
    }
  }

  trialList() {
    // Must cache this, since RNG is used to generate
    if (this.trials) {
      return this.trials;
    }
    if (!this.lures) {
      this.createPools();
    }
    var trials = [];
    for (var i = 0; i < this.order.length; i++) {
      trials.push(this.makeTrial(this.order[i]));
    }
    this.trials = trials;
    return trials;
  }
}

