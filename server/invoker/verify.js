var httpVerify = (expected, actual) => {
    return actual.code == expected.code && 
        actual.header["content-type"] == expected.header["content-type"];
};

var Service = (module) => {
    if(module.type == "http"){
        return httpVerify;
    }
};

export default Service;