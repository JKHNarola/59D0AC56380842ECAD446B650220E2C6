const reshelper = require('../lib/resultHelper');
const repo = require("../repos/authRepo");
var jwt = require('jsonwebtoken');
var loginmanager = require('../lib/loginmanager');
var reqHelper = require("../lib/reqHelper");
var utils = require("../lib/utils");

exports.authenticateAsync = async function (req, res, next) {
    try {
        var u = req.body.username;
        var p = req.body.password;
        if (!u || !p) {
            reshelper.sendOtherResult(res, 400, "Username and password not found.");
            return;
        }

        var user = await repo.authenticateAsync(u, p);
        if (user !== null) {
            var payload = {
                user: user
            };
            var token = jwt.sign(payload, global.securityKey, {
                expiresIn: global.appconfig.tokentimespan
            });

            loginmanager.addlogin(user.userId, token);

            var d = {
                token: token,
                user: payload.user
            };
            reshelper.sendOkResult(res, "Authentication successful.", d, 1);
        } else
            reshelper.sendOkResult(res, "Authentication failed.", null, 0);
    } catch (e) {
        next(e);
    }
};

exports.logout = function (req, res, next) {
    try {
        var token = reqHelper.extractToken(req);

        // decode token
        if (token) {

            // verifies secret and checks exp
            var decoded = "";
            try {
                decoded = jwt.verify(token, global.securityKey, {
                    ignoreExpiration: true
                });
            } catch (ex) {
                //No need to handle error
            }

            if (!decoded) {
                reshelper.sendOtherResult(res, 401, "You are not authorized to access. Invalid access token.");
            } else {
                loginmanager.removelogin(decoded.user.UserId);
                reshelper.sendOkResult(res, "You are successfully logged out.", null, 1);
            }

        } else {
            reshelper.sendOtherResult(res, 401, "You are not authorized to access. No access token found.");
        }
    } catch (e) {
        next(e);
    }
};

exports.checkUserExistsAsync = async function (req, res, next) {
    try {
        var u = req.body.username;
        var e = req.body.email;
        if (u || e) {
            var isExists = await repo.checkUserExistsAsync(u, e);
            reshelper.sendOkResult(res, isExists ? "Username/email already exists." : "Username/email not exists.", { isExists: isExists }, 1);
        }
        else reshelper.sendOtherResult(res, 400, "Username/email not provided.");
    }
    catch (e) {
        next(e);
    }
};

exports.registerAsync = async function (req, res, next) {
    try {
        var u = req.body.username;
        var p = req.body.password;
        var f = req.body.fullname;
        var e = req.body.email;
        if (!u || !p || !f || !e) {
            reshelper.sendOtherResult(res, 400, "Required fields not provided.");
            return;
        }

        var pic = null;
        var base64 = req.body.profilePic;
        if (base64) pic = new Buffer(base64.replace(/^data:image\/(png|gif|jpeg);base64,/, ''), 'base64');

        await repo.registerAsync(e, p, u, f, pic);

        reshelper.sendOkResult(res, "User registration successful.", null, 1);
    }
    catch (e) {
        next(e);
    }
};

exports.verifyEmailAsync = async function (req, res, next) {
    try {
        var e = req.body.email;
        var c = req.body.code;
        if (!e || !c) {
            reshelper.sendOtherResult(res, 400, "Email or Code not provided.");
            return;
        }

        var x = await repo.verifyEmailAsync(e, c);
        if (x === null) reshelper.sendOkResult(res, "Email is already verified.", null, 2);
        else reshelper.sendOkResult(res, "Email successfully verified.", null, 1);
    }
    catch (e) {
        next(e);
    }
};

exports.getProfilePicAsync = async function (req, res, next) {
    try {
        var user = utils.getUserFromToken(req);
        var id = user ? user.userId : -1;
        if (id === -1) {
            reshelper.sendOtherResult(res, 400, "Userid not provided.");
            return;
        }

        var pic = await repo.getProfilePicAsync(id);
        reshelper.sendOkResult(res, "Profile picture.", pic, 1);
    }
    catch (e) {
        next(e);
    }
};