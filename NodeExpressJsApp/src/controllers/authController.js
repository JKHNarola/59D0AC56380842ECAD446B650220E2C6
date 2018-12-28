const reshelper = require('../lib/resultHelper');
const repo = require("../repos/userRepo");
var jwt = require('jsonwebtoken');
var loginmanager = require('../lib/loginmanager');
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
        var token = utils.getToken(req);

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