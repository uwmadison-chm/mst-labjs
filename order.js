'use strict';

module.exports = class OrderFiller {
  constructor(order, lureDifficulty) {
    this.order = order;
    this.lureDifficulty = lureDifficulty;
    this.availableStimuli = [...Array(193).keys()].slice(1);
  }
}

