var resHelper = require('../lib/resultHelper');
var jwt = require('jsonwebtoken');

// module.exports = function (router) {
//     router.use(function (req, res, next) {
//         var token = req.body.token || req.query.token;
//         if (!token)
//             token = req.headers['Authorization'].replace('Bearer ', "");

//         // decode token
//         if (token) {

//             // verifies secret and checks exp
//             jwt.verify(token, global.securityKey, function (err, decoded) {
//                 if (err) {
//                     resHelper.sendOtherResult(res, 403, "Invalid or expired token");
//                     return;
//                 } else {
//                     // if everything is good, save to request for use in other routes
//                     req.decoded = decoded;
//                     next();
//                 }
//             });

//         } else {
//             resHelper.sendOtherResult(res, 403, "No token found");
//             return;
//         }
//         next();
//     });
// }
module.exports = function (req, res, next) {
    var token = req.body.token || req.query.token;
    if (!token) {
        var authheader = req.headers['authorization'];
        token = authheader ? authheader.replace('Bearer ', "") : null;
    }

    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, global.securityKey, function (err, decoded) {
            if (err) {
                resHelper.sendOtherResult(res, 403, "Invalid or expired token");
                return;
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {
        resHelper.sendOtherResult(res, 403, "No token found");
        return;
    }
    next();
}