var resHelper = require('../lib/resultHelper');
var jwt = require('jsonwebtoken');
var loginmanager = require('../lib/loginmanager');
var reqHelper = require("../lib/reqHelper");

module.exports = function (req, res, next) {
    var token = reqHelper.extractToken(req);

    // decode token
    if (token) {

        // verifies secret and checks exp
        var decoded = "";
        try {
            decoded = jwt.verify(token, global.securityKey);
        } catch (ex) {}

        if (!decoded || loginmanager.isUserLoggedOut(decoded.user.UserId)) {
            resHelper.sendOtherResult(res, 403, "You are not authorized to access. Access token is invalid or expired.");
            return;
        } else {
            req.decoded = decoded;
            next();
        }

    } else {
        resHelper.sendOtherResult(res, 403, "You are not authorized to access. No access token found.");
        return;
    }
}