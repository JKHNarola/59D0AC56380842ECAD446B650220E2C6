var resHelper = require('../lib/resultHelper');
var jwt = require('jsonwebtoken');
var loginmanager = require('../lib/loginmanager');
var tokHelper = require("../lib/tokenhelper");

module.exports = function (req, res, next) {
    var token = tokHelper.extractToken(req);

    // decode token
    if (token) {

        // verifies secret and checks exp
        var decoded = "";
        try {
            decoded = jwt.verify(token, global.securityKey);
        } catch (ex) {}

        if (!decoded || loginmanager.isUserLoggedOut(decoded.user.UserId)) {
            resHelper.sendOtherResult(res, 403, "You are not authorized to access. Invalid or expired token.");
            return;
        } else {
            req.decoded = decoded;
            next();
        }

    } else {
        resHelper.sendOtherResult(res, 403, "You are not authorized to access. No token found.");
        return;
    }
}