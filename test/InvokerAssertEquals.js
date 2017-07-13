var assert = require('assert');
var assertEquals = require('../server/invoker/assertEquals.js').default;

describe('assertEquals', function() {
    it('should return true', function() {
        var expected = {
            "code" : 200,
            "header" : {
                "content-type" : "application/json"
            },
            "body": {
                "url": "http://localhost:3000"
            }
        };

        var result = assertEquals(expected, expected);
        assert.equal(result, true);
    });
    it('should return true again', function() {
        var expected = {
            "code" : 200,
            "header" : {
                "content-type" : "application/json"
            },
            "body": {
            }
        };
        var actual = {
            "code" : 200,
            "header" : {
                "content-type" : "application/json"
            },
            "body": {
                "url": "http://localhost:3000"
            }
        };

        var result = assertEquals(expected, actual);
        assert.equal(result, true);
    });
    it('should return false', function() {
        var expected = {
            "code" : 200,
            "header" : {
                "content-type" : "application/json"
            },
            "body": {
                "url": "http://localhost:3000"
            }
        };
        var actual = {
            "code" : 200,
            "header" : {
                "content-type" : "application/json"
            },
            "body": {
            }
        };

        var result = assertEquals(expected, actual);
        assert.equal(result, false);
    });
    it('should return false again', function() {
        var expected = {
            "code" : 200,
            "header" : {
                "content-type" : "application/json"
            },
            "body": {
                "url": "http://localhost:3000"
            }
        };
        var actual = {
            "code" : 200,
            "header" : {
                "content-type" : "application/json"
            },
            "body": {
                "url": "http://localhost:2999"
            }
        };

        var result = assertEquals(expected, actual);
        assert.equal(result, false);
    });
});
