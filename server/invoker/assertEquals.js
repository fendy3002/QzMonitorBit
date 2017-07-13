import lo from 'lodash';

var Service = (expected, actual) => {
    if(typeof expected === 'object'){
        var keys = Object.keys(expected);
        var result = true;
        for(var i = 0; i < keys.length; i++){
            result = result & Service(expected[keys[i]],
                actual[keys[i]]);
        }
        return result;
    }
    else{
        return expected == actual;
    }
};

export default Service;