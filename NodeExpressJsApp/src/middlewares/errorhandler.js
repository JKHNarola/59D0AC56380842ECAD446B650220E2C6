var resHelper = require("../lib/resultHelper");
var emailService = require('../lib/mailservice');
var logger = require('../lib/logger');

module.exports = function (app) {
    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    app.use(function (err, req, res, next) {
        if (req) {
            logger.logErrorAsync(err, req);

            if (req.path && req.path.startsWith("/api/")) {
                if (global.isDev) resHelper.sendErrorResult(res, err.message, err.stack);
                else {
                    emailService.sendErrorMailAsync(err, req);
                    resHelper.sendErrorResult(res, err.message);
                }
            }
            else {
                if (err.status && err.status === 404) resHelper.sendStaticPage(res, 404, "404.html");
                else {
                    if (global.isDev) resHelper.sendErrorPage(req, res, err);
                    else {
                        emailService.sendErrorMailAsync(err, req);
                        resHelper.sendStaticPage(res, 500, "500.html");
                    }
                }
            }
        }
    });
};