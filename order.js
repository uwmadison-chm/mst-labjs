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
}

