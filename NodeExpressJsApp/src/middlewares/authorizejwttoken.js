var resHelper = require('../lib/resultHelper');
var jwt = require('jsonwebtoken');
var loginmanager = require('../lib/loginmanager');
var utils = require("../lib/utils");

module.exports = function (req, res, next) {
    var token = utils.getToken(req);
    if (token) {
        var decoded = "";
        try {
            decoded = jwt.verify(token, global.securityKey);
        } catch (ex) {
            //No need to handle error
        }

        if (!decoded || loginmanager.isUserLoggedOut(decoded.user.userId)) {
            resHelper.sendOtherResult(res, 401, "You are not authorized to access. Access token is invalid or expired.");
            return;
        } else {
            req.token = token;
            req.decodedToken = decoded;
            next();
        }

    } else {
        resHelper.sendOtherResult(res, 401, "You are not authorized to access. No access token found.");
        return;
    }
};