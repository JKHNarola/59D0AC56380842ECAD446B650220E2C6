var resHelper = require("../lib/resultHelper");
var emailService = require('../lib/mailservice');

module.exports = function (app) {
    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    app.use(function (err, req, res, next) {
        if (err && err.status) {
            resHelper.sendPage(res, 404, "404.html");
        } else {
            if (global.isDev) {
                console.error(err.stack);
                resHelper.sendError(req, res, err);
            } else {
                resHelper.sendPage(res, 500, "500.html");
                emailService.sendErrorMail(err, req);
            }
        }
    });
};