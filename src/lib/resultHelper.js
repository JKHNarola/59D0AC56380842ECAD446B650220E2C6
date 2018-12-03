var path = require("path");
var emailService = require("../lib/mailservice");

exports.sendOkResult = function (res, message, data, status) {
    prepareHeader(res);
    res.statusCode = 200;
    var x = {};
    if (status) x.status = status;
    if (message) x.message = message;
    if (data) x.data = data;
    res.send(JSON.stringify(x));
}

exports.sendErrorResult = function (res, message, data, status) {
    prepareHeader(res);
    res.statusCode = 500;
    var x = {};
    if (status) x.status = status;
    if (message) x.message = message;
    if (data) x.data = data;
    res.send(JSON.stringify(x));
}

exports.sendOtherResult = function (res, statuscode, message, data, status) {
    prepareHeader(res);
    res.statusCode = statuscode;
    var x = {};
    if (status) x.status = status;
    if (message) x.message = message;
    if (data) x.data = data;
    res.send(JSON.stringify(x));
}

exports.sendPage = function (res, statuscode, pagename) {
    prepareHeader(res, "html");
    res.statusCode = statuscode;
    res.sendFile(path.join(__dirname, '..', 'views', pagename));
}

exports.sendError = function (req, res, error) {
    prepareHeader(res, "html");
    res.statusCode = 500;
    var s = error.stack ? error.stack : error;
    res.send(emailService.generateErrorBody(error, req));
}

var prepareHeader = function (res, contenttype) {
    if (!contenttype) contenttype = 'application/json';
    else if (contenttype.toLowerCase().includes("htm")) contenttype = "text/html";
    res.setHeader('Content-Type', contenttype);
}