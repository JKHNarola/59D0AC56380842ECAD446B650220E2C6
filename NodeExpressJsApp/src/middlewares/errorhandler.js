var resHelper = require("../lib/resultHelper");
var emailService = require('../lib/mailservice');
var chalk = require('chalk');

module.exports = function (app) {
    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    app.use(function (err, req, res, next) {
        if (req && req.path && req.path.startsWith("/api/")) {
            if (global.isDev) {
                console.log(chalk.redBright(err.message), chalk.redBright(err.stack));
                resHelper.sendErrorResult(res, err.message, err.stack);
            } else {
                resHelper.sendErrorResult(res, err.message);
                emailService.sendErrorMail(err, req);
            }
        }
        else {
            if (err && err.status && err.status === 404) {
                resHelper.sendPage(res, 404, "404.html");
            } else {
                if (global.isDev) {
                    console.log(chalk.redBright(err.message), chalk.redBright(err.stack));
                    resHelper.showErrorPage(req, res, err);
                } else {
                    resHelper.sendPage(res, 500, "500.html");
                    emailService.sendErrorMail(err, req);
                }
            }
        }
    });
};