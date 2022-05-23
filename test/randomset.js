var assert = require('chai').assert;
var expect = require('chai').expect;

var seedrandom = require('seedrandom');
var RandomSet = require('../randomset');
var r;

describe('RandomSet', function() {
  beforeEach(function() {
    r = new RandomSet('1001');
  });

  describe('can build stable random stimulus set order', function() {
    it('generates a stable order from the same seed', function() {
      var gen1 = seedrandom('five six seven eight');
      var gen2 = seedrandom('five six seven eight');
      var r1 = new RandomSet(gen1);
      var r2 = new RandomSet(gen2);

      var result1 = r1.setOrder;
      var result2 = r2.setOrder;

      expect(result1).to.eql(result2);
    });

    it('returns the same stable order when asked twice', function() {
      var result1 = r.setOrder;
      var result2 = r.setOrder;

      expect(result1).to.eql(result2);
    });

    it('can pick based on an integer session variable', function() {
      var set1 = r.pickRandomStimulusSetForSession(1);
      var set2 = r.pickRandomStimulusSetForSession(2);

      assert.equal(set1, 1);
      assert.equal(set2, 3);
    });

    it('can pick based on a string session variable', function() {
      var set1 = r.pickRandomStimulusSetForSession('T1');
      var set2 = r.pickRandomStimulusSetForSession('T2');

      assert.equal(set1, 1);
      assert.equal(set2, 3);
    });


    it('picks the same set based on the same input', function() {
      var set1 = r.pickRandomStimulusSetForSession(1);
      var set2 = r.pickRandomStimulusSetForSession(1);

      assert.equal(set1, set2);
    });

    it('does not repeat sets in 5 tries', function() {
      var set1 = r.pickRandomStimulusSetForSession(1);
      var set2 = r.pickRandomStimulusSetForSession(2);
      var set3 = r.pickRandomStimulusSetForSession(3);
      var set4 = r.pickRandomStimulusSetForSession(4);
      var set5 = r.pickRandomStimulusSetForSession(5);

      var list = [set1, set2, set3, set4, set5];
      var set = new Set(list)

      assert.equal(list.length, set.size);
    });

  });
});
