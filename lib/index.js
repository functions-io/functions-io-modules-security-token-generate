"use strict";

const jwt = require("jsonwebtoken");

module.config = {
    secretOrPrivateKey : "aaaa",
    algorithm : "HS256",
    expiresIn : 3600,
    issuer: "functions-io",
    loginModuleName: "@functions-io-modules/security.login.mongo",
    //loginModuleName: "@functions-io-labs/security.login"
    loginModuleVersion: "1.*"
};

module.input = {
    type: "object",
    properties: {
        username: {type: "string", maximum: 30},
        password: {type: "string", maximum: 30}
    }
};

module.output = {
    type: "string"
};

function generateTokenJWT(userObj){
    let payload = {};
    let opt = {};
    
    opt.algorithm = module.config.algorithm;
    opt.expiresIn = module.config.expiresIn;
    opt.issuer = module.config.issuer;
    
    payload.scope = userObj.scope; //https://tools.ietf.org/html/draft-ietf-oauth-v2-30#section-3.3
    payload.sub = userObj.id || userObj.email;
    payload.name = userObj.name;
    payload.iat = Math.floor(Date.now() / 1000);
    payload.email = userObj.email;
    payload.roles = userObj.roles;
    payload.groups = userObj.groups;
    payload.permissions = userObj.permissions;
    //payload.jti = 1; //JWT ID

    return jwt.sign(payload, module.config.secretOrPrivateKey, opt);
}

module.exports = function(message, context){
    return new Promise(function(resolve, reject){
        try {
            context.invokeAsync(module.config.loginModuleName, module.config.loginModuleVersion, message)
                .then(function(userObj){
                    if (userObj){
                        let tokenJWT = generateTokenJWT(userObj);
                        context.log("INFO", {loginModule:module.config.loginModuleName, username:message.username, message:"authorized"});
                        resolve(tokenJWT);
                    }
                    else{
                        let errObj = {};
                        errObj.code = 401;
                        errObj.name = "FunctionsSecurityUnauthorized";
                        errObj.data = {username:message.username};
                        reject(errObj);
                    }
                },function(errInvoke){
                    reject(errInvoke);
                });
        }
        catch (errTry) {
            reject(errTry);
        }
    });
};