var assert = require('assert');
var listener = require('../server/listener/index.js').default;

describe('getFilename', function() {
    it('should return expected', function() {
        var wednesdayDate = new Date(2017, 0, 11);
        var filename1 = listener.getFilename(wednesdayDate);
        var expected1 = "20170109-20170115.log";

        var wednesdayDate2 = new Date(2017, 1, 1);
        var filename2 = listener.getFilename(wednesdayDate2);
        var expected2 = "20170130-20170205.log";

        assert.equal(expected1, filename1);
        assert.equal(expected2, filename2);
    });
});
