var fs = require('fs');
var path = require("path");
var utils = require("../lib/utils");

exports.sendOkResult = function (res, message, data, status) {
    prepareHeader(res);
    res.statusCode = 200;
    var x = {};
    if (typeof status !== 'undefined' && status !== null) x.status = status;
    if (message) x.message = message;
    if (data) x.data = data;
    res.send(JSON.stringify(x));
};

exports.sendErrorResult = function (res, message, data, status) {
    prepareHeader(res);
    res.statusCode = 500;
    var x = {};
    if (status) x.status = status;
    if (message) x.message = message;
    if (data) x.data = data;
    res.send(JSON.stringify(x));
};

exports.sendOtherResult = function (res, statuscode, message, data, status) {
    prepareHeader(res);
    res.statusCode = statuscode;
    var x = {};
    if (status) x.status = status;
    if (message) x.message = message;
    if (data) x.data = data;
    res.send(JSON.stringify(x));
};

exports.sendStaticPage = function (res, statuscode, pagename) {
    prepareHeader(res, "html");
    res.statusCode = statuscode;
    var f = path.join(__dirname, '..', 'views', "staticpages", pagename);
    if (fs.existsSync(f))
        res.sendFile(f);
    else
        this.sendOtherResult(res, 500, "View file " + pagename + " not exists.");
};

exports.sendErrorPage = function (req, res, error) {
    prepareHeader(res, "html");
    res.statusCode = 500;
    res.send(utils.prepareErrorBody(error, req));
};

var prepareHeader = function (res, contenttype) {
    if (!contenttype) contenttype = 'application/json';
    else if (contenttype.toLowerCase().includes("htm")) contenttype = "text/html";
    res.setHeader('Content-Type', contenttype);
};