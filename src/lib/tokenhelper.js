exports.extractToken = function (req) {
    var token = req.body.token || req.query.token;
    if (!token) {
        var authheader = req.headers['authorization'];
        token = authheader ? authheader.replace('Bearer ', "") : null;
    }

    return token;
};