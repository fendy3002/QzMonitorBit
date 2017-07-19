var assert = require('assert');
var buffer = require('../server/listener/bufferBase.js').default;
var httpBuffer = require('../server/listener/httpBuffer.js').default;

describe('getFilename', function() {
    it('should return expected', function() {
        var wednesdayDate = new Date(2017, 0, 11);
        var filename1 = buffer.getFilename(wednesdayDate);
        var expected1 = "20170109-20170115.log";

        var wednesdayDate2 = new Date(2017, 1, 1);
        var filename2 = buffer.getFilename(wednesdayDate2);
        var expected2 = "20170130-20170205.log";

        assert.equal(expected1, filename1);
        assert.equal(expected2, filename2);
    });
});
describe('getBuffer', function() {
    it('should return expected', function() {
        var data = [
            {"success": {time: {
                start: new Date(1901, 1, 1, 10, 0, 0),
                end: new Date(1901, 1, 1, 10, 0, 1),
                diff: 1000
            }}},
            {"success": {time: {
                start: new Date(1901, 1, 1, 10, 0, 10),
                end: new Date(1901, 1, 1, 10, 0, 12),
                diff: 1200
            }}},
            {"success": {time: {
                start: new Date(1901, 1, 1, 10, 0, 20),
                end: new Date(1901, 1, 1, 10, 0, 22),
                diff: 1600
            }}}
        ];
        var actual = buffer.getGroup(data, httpBuffer.getTime, 
            httpBuffer.onNewGroup, httpBuffer.onExistingGroup);
        var expected = { "_Feb01_1000": { 
            success: 3, error: 0, longest: 1600 
        } };
        assert.deepEqual(actual, expected);
    });
});