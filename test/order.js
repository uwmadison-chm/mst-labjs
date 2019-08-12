var assert = require('chai').assert;

var seedrandom = require('seedrandom');
var OrderFiller = require('../order');
var o;

describe('OrderFiller', function() {
  beforeEach(function() {
    o = new OrderFiller('test', [], {});
  });

  describe('should initialize correctly', function() {
    it('loads stim orders', function() {
      o = new OrderFiller('new_seed', [
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

  describe('rng is stable', function() {
    it('generates same number', function() {
      assert.equal(o.rng(), 0.8722025543160253);
    });

    it('accepts seed and still generates a stable number', function() {
      o = new OrderFiller('eclosion', [], {});
      assert.equal(o.rng(), 0.619874173930009);
    });

    it('can use a passed-in rng', function() {
      var r = seedrandom('eclosion');
      o = new OrderFiller(r, [], {});
      assert.equal(o.rng(), 0.619874173930009);
    });
  });

  describe('should insert stimuli correctly', function() {
    it('pops and removes stimuli', function() {
      var stimuli = o.popStimuli();
      assert.equal(o.availableStimuli.length, 191);
      assert.isAtLeast(stimuli, 1);
      assert.isAtMost(stimuli, 192);
    });
  });
});
