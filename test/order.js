var assert = require('chai').assert;

// This is the bucket ordering
var order1 = require('./order1.json');
// This is the stimulus set metadata, which lists the lure difficulties for each
var set1 = require('./set1.json');

var seedrandom = require('seedrandom');
var OrderFiller = require('../order');
var o;

describe('OrderFiller', function() {
  beforeEach(function() {
    function clone(x) {
      return JSON.parse(JSON.stringify(x));
    }
    o = new OrderFiller('test', clone(order1), clone(set1));
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

    it('stores the lure difficulty', function() {
      assert.equal(Object.keys(o.lureDifficulty).length, 192);
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

    it('can reuse a passed-in rng function', function() {
      var r = seedrandom('eclosion');
      o = new OrderFiller(r, [], {});
      assert.equal(o.rng(), 0.619874173930009);
    });
  });

  describe('should create the three pools of stimuli', function() {
    it('creates simple pools', function() {
      var pool = o.createPool(10);
      assert.equal(pool.length, 10);
      assert.notInclude(o.availableStimuli, pool[0]);
    });

    it('creates non-overlapping pools', function() {
      var pool1 = o.createPool(96);
      var pool2 = o.createPool(96);
      for (var x in pool1) {
        assert.notInclude(pool2, x);
      }
    });

    it('initializes lure bins', function() {
      o.initializeLureBins();
      assert.equal(o.lureBins[1].length, 39);
      assert.equal(o.lureBins[2].length, 37);
      assert.equal(o.lureBins[3].length, 39);
      assert.equal(o.lureBins[4].length, 38);
      assert.equal(o.lureBins[5].length, 38);
    });

    it('creates balanced lure pools', function() {
      var pool = o.createLurePool(15);
      assert.equal(pool.length, 15);

      var totals = [0, 0, 0, 0, 0, 0];

      for (var i = 0; i < pool.length; i++) {
        var diff = o.lureDifficulty[String(pool[i])]
        totals[Number(diff)]++;
      }
      for (var i = 1; i <= 5; i++) {
        assert.equal(totals[i], 3, `Pool ${i} should have 3 items: ${totals[i]}`);
      }
    });

    it('pops and removes stimuli', function() {
      var stimuli = o.popStimuli();
      assert.equal(o.availableStimuli.length, 191);
      assert.isAtLeast(stimuli, 1);
      assert.isAtMost(stimuli, 192);
    });

    it('correctly removes given stimuli', function() {
      o.removeStimuli("190");
      assert.equal(o.availableStimuli.length, 191);
    });

    it('removes stimuli while building lure pool', function() {
      assert.equal(o.availableStimuli.length, 192);
      o.createLurePool(12);
      assert.equal(o.availableStimuli.length, 180);
    });

    it('removes all available stimuli when pools are built', function() {
      o.createPools();
      assert.equal(o.availableStimuli.length, 0);
    });

    it('foils are unique in pools', function() {
      o.createPools();
      for (var i = 0; i < o.foils.length; i++) {
        assert.notInclude(o.repeats, o.foils[i]);
        assert.notInclude(o.lures, o.foils[i]);
      }
    });

    it('lures are unique in pools', function() {
      o.createPools();
      for (var i = 0; i < o.lures.length; i++) {
        assert.notInclude(o.repeats, o.lures[i]);
        assert.notInclude(o.foils, o.lures[i]);
      }
    });

    it('repeats are unique in pools', function() {
      o.createPools();
      for (var i = 0; i < o.repeats.length; i++) {
        assert.notInclude(o.lures, o.repeats[i]);
        assert.notInclude(o.foils, o.repeats[i]);
      }
    });
  });


  describe('should insert stimuli correctly', function() {
    var searchTrials = function(trials, filter, operation) {
      for (var i = 0; i < trials.length; i++) {
        if (filter(trials[i])) {
          for (var j = i+1; j < trials.length; j++) {
            if (i != j) {
              operation(trials[i], trials[j]);
            }
          }
        }
      }
    };

    var checkPairs = function(trials, kind) {
      var repeats = {};
      searchTrials(trials,
        function(x) {
          return x.trial_type == kind;
        },
        function(one, two) {
          if (one.stimulus_number == two.stimulus_number) {
            assert.equal(two.trial_type, kind);
            if (two.trial_type == 'lure') {
              assert.equal(two.stimulus_letter, 'b');
            } else if (two.trial_type == 'repeat') {
              assert.equal(two.stimulus_letter, 'a');
            }
            repeats[one.stimulus_number] = repeats[one.stimulus_number] || 0;
            repeats[one.stimulus_number]++;
          }
        }
      );
      for (var k in repeats) {
        assert.equal(repeats[k], 1);
      }
    };


    it('generates trial list', function() {
      var trials = o.trialList();
      assert.equal(trials.length, 320);
    });

    it('foils are unique in trial list', function() {
      var trials = o.trialList();
      searchTrials(trials,
        function(x) {
          return x.trial_type == "foil";
        },
        function(one, two) {
          assert.notEqual(one.stimulus_number, two.stimulus_number, `Should not have found something overlapping a foil: ${JSON.stringify(one)} vs ${JSON.stringify(two)}`);
        }
      );
    });

    it('lures happen with an A and a B in trial list', function() {
      var trials = o.trialList();
      checkPairs(trials, "lure");
    });

    it('repeats happen with an A and a B in trial list', function() {
      var trials = o.trialList();
      checkPairs(trials, "repeat");
    });

  });
});
