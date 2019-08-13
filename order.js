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
        bin.push(k);
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
      // Also remove from the total available pool
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
    // Remove lures from available now

    this.repeats = this.createPool(size);
    this.foils = this.createPool(size);
  }
}

