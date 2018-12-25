var qs = require('querystring');
var reqHelper = require('./reqHelper');
var jwt = require('jsonwebtoken');

exports.encode = function (input) {
    return qs.escape(input);
};

exports.decodeToken = function (req) {
    var token = reqHelper.extractToken(req);

    // decode token
    if (token) {

        // verifies secret and checks exp
        var decoded = "";
        try {
            decoded = jwt.verify(token, global.securityKey, { ignoreExpiration: true });
        } catch (ex) {
            //No need to handle error
        }

        if (decoded) return decoded;
    }

    return null;
};

exports.getUserFromToken = function (req) {
    var decoded = this.decodeToken(req);
    if (decoded) return decoded.user;
    return null;
};

exports.replaceAll = function (input, target, replacement) {
    return input.split(target).join(replacement);
}