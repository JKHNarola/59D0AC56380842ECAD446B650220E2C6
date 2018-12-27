const sgMail = require('@sendgrid/mail');
var chalk = require('chalk');
var utils = require('../lib/utils');

exports.sendMailAsync = async function (to, subject, body, isText) {
    sgMail.setApiKey(global.appconfig.emailconfig.sendgridkey);
    var msg = {
        to: to,
        from: global.appconfig.emailconfig.from,
        subject: subject
    };
    if (isText) msg.text = body;
    else msg.html = body;
    try {
        await sgMail.send(msg);
    } catch (ex) {
        console.log(chalk.redBright("Error while sending mail"));
        throw ex;
    }
};

exports.sendErrorMailAsync = async function (error, req) {
    sgMail.setApiKey(global.appconfig.emailconfig.sendgridkey);
    var msg = {
        to: global.appconfig.emailconfig.errormailto,
        from: global.appconfig.emailconfig.from,
        subject: "App - Error",
        html: utils.prepareErrorBody(error, req, true)
    };

    try {
        await sgMail.send(msg);
    } catch (ex) {
        console.log(chalk.redBright("Error while sending mail"));
    }
};