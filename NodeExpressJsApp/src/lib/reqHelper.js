exports.extractToken = function (req) {
    var token = req.body.token || req.query.token || req.body.t || req.query.t || req.body.tok || req.query.tok;
    if (!token) {
        var authheader = req.headers['authorization'];
        token = authheader ? authheader.replace('Bearer ', "") : null;
    }

    return token;
};

//Hack
exports.copyParam = function (req) {
    req.orgParams = req.params;
};