const reshelper = require('../lib/resultHelper');
const repo = require("../repos/authRepo");
var jwt = require('jsonwebtoken');

exports.authenticateAsync = async function (req, res) {
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
            expiresIn: '1h'
        });

        var d = {
            token: token
        };
        reshelper.sendOkResult(res, "Authentication successful.", d, 1);
    } else
        reshelper.sendOkResult(res, "Authentication failed.", null, 0);
};