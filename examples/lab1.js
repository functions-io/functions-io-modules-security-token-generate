"use strict";

const core = require("functions-io-core");
const invokeFactory = core.buildInvokeFactory();
const context = invokeFactory.buildContext();

const moduleTest = require("../");

var message1 = {};
message1.username = "admin";
message1.password = "123";

moduleTest(message1, context).then(function(result){
    console.log("sucess! ", result);
}, function(err){
    console.log("err! ", err);
})