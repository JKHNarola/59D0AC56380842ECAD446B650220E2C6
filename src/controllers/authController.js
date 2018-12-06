const reshelper = require('../lib/resultHelper');
const repo = require("../repos/authRepo");
var jwt = require('jsonwebtoken');
var loginmanager = require('../lib/loginmanager');
var tokHelper = require("../lib/tokenhelper");

exports.authenticateAsync = async function (req, res, next) {
    try {
        var u = req.body.username;
        var p = req.body.password;
        if (!u || !p) {
            reshelper.sendOtherResult(res, 400, "Username and password not found.");
            return;
        }

        var u = await repo.authenticateAsync(u, p);
        if (u != null) {
            var payload = {
                user: u //TODO: prepare user object with email, name etc.
            };
            var token = jwt.sign(payload, global.securityKey, {
                expiresIn: global.appconfig.tokenexpiresin
            });

            loginmanager.addlogin(u.UserId, token);

            var d = {
                token: token
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
        var token = tokHelper.extractToken(req);

        // decode token
        if (token) {

            // verifies secret and checks exp
            var decoded = "";
            try {
                decoded = jwt.verify(token, global.securityKey, {
                    ignoreExpiration: true
                });
            } catch (ex) {}

            if (!decoded) {
                reshelper.sendOtherResult(res, 403, "You are not authorized to access. Invalid token.");
            } else {
                loginmanager.removelogin(decoded.user.UserId);
                reshelper.sendOkResult(res, "You are successfully logged out.");
            }

        } else {
            reshelper.sendOtherResult(res, 403, "You are not authorized to access. No token found.");
        }
    } catch (e) {
        next(e);
    }
};