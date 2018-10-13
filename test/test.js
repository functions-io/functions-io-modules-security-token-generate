"use strict";

const core = require("functions-io-core");
const invokeFactory = core.buildInvokeFactory();
const context = invokeFactory.buildContext();

const assert = require("assert");
const moduleTest = require("../");

context.getConfig = function(){
    return {
        secretOrPrivateKey : "aaaa",
        algorithm : "HS256",
        expiresIn : 3600,
        issuer: "functions-io",
        loginModuleName: "@functions-io-modules/security.login.mongo",
        loginModuleVersion: "1.*"
    };
}

var message1 = {};
message1.username = "admin";
message1.password = "123";

moduleTest(message1, context).then(function(result){
    assert.strictEqual(typeof(result), "string");
}, function(err){
    assert.strictEqual(err, null);
})