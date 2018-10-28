"use strict";

const jwt = require("jsonwebtoken");

function generateTokenJWT(config, userObj){
    let payload = {};
    let opt = {};
    
    opt.algorithm = config.algorithm;
    opt.expiresIn = config.expiresIn;
    opt.issuer = config.issuer;
    payload.iat = Math.floor(Date.now() / 1000);

    payload.sub = userObj.sub || userObj.id || userObj.email || userObj.name;
    if (userObj.scope){
        payload.scope = userObj.scope; //https://tools.ietf.org/html/draft-ietf-oauth-v2-30#section-3.3
    }
    if (userObj.name){
        payload.name = userObj.name;
    }
    if (userObj.nickname){
        payload.nickname = userObj.nickname;
    }
    if (userObj.email){
        payload.email = userObj.email;
    }
    if (userObj.roles){
        payload.roles = userObj.roles;
    }
    if (userObj.groups){
        payload.groups = userObj.groups;
    }
    if (userObj.permissions){
        payload.permissions = userObj.permissions;
    }
    //payload.jti = 1; //JWT ID

    return jwt.sign(payload, config.secretOrPrivateKey, opt);
}

module.exports = function(message, context){
    return new Promise(function(resolve, reject){
        try {
            let config = context.getConfig();
            
            context.invokeAsync(config.loginModuleName, config.loginModuleVersion, message)
                .then(function(userObj){
                    try {
                        if (userObj){
                            let tokenJWT = generateTokenJWT(config, userObj);
                            context.log("INFO", {loginModule:config.loginModuleName, id:message.email || message.username, message:"token generated"});
                            resolve(tokenJWT);
                        }
                        else{
                            let errObj = {};
                            errObj.code = 401;
                            errObj.name = "FunctionsErrorSecurityUnauthorized";
                            errObj.data = {id:message.email || message.username};
                            reject(errObj);
                        }                        
                    }
                    catch (errTry2) {
                        reject(errTry2);
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