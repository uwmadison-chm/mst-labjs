var assert = require('chai').assert;
var OrderFiller = require('../order');
var o;

describe('OrderFiller', function() {
  beforeEach(function() {
    o = new OrderFiller([], {});
  });

  describe('should initialize correctly', function() {
    it('loads stim orders', function() {
      o = new OrderFiller([
        {"stim_bin_index":42,"trial_type":"repeat","repetition":"a","lag":65,"trial_number":1}
      ], {});
      assert.equal(o.order[0].stim_bin_index, 42);
    });

    it('starts with 192 stimuli available', function() {
      assert.equal(o.availableStimuli.length, 192);
    });

    it('contains 1 through 192', function() {
      assert.include(o.availableStimuli, 1);
      assert.include(o.availableStimuli, 192);
      assert.notInclude(o.availableStimuli, 0);
      assert.notInclude(o.availableStimuli, 193);
    });
  });

  describe('should insert stimuli correctly', function() {
    it('pops and removes stimuli', function() {
      assert.equal(o.availableStimuli.length, 192);
    });
  });
});
