var qs = require('querystring');
var reqHelper = require('./reqHelper');
var jwt = require('jsonwebtoken');
var path = require('path');
var fs = require('fs');

exports.encode = function (input) {
    return qs.escape(input);
};

exports.decodeToken = function (req) {
    if (req.decoded)
        return req.decoded;

    var token = reqHelper.extractToken(req);
    if (token) {
        var decoded = "";
        try {
            decoded = jwt.verify(token, global.securityKey, { ignoreExpiration: true });
        } catch (ex) {
            //No need to handle error
        }
        if (decoded) return decoded;
    }

    return null;
};

exports.extractUserFromRequest = function (req) {
    var decoded = req.decoded ? req.decoded : this.decodeToken(req);
    if (decoded) return decoded.user;
    return null;
};

exports.replaceAll = function (input, target, replacement) {
    return input.split(target).join(replacement);
};

exports.toIsoString = function (d) {
    var tzo = -d.getTimezoneOffset(),
        dif = tzo >= 0 ? '+' : '-',
        pad = function (num) {
            var norm = Math.floor(Math.abs(num));
            return (norm < 10 ? '0' : '') + norm;
        };
    return d.getFullYear() +
        '-' + pad(d.getMonth() + 1) +
        '-' + pad(d.getDate()) +
        'T' + pad(d.getHours()) +
        ':' + pad(d.getMinutes()) +
        ':' + pad(d.getSeconds()) +
        dif + pad(tzo / 60) +
        ':' + pad(tzo % 60);
};

exports.getReqInfo = function (req) {
    var obj = {};
    obj.method = req && req.method ? req.method.toUpperCase() : "";
    obj.reqPath = req && req.originalUrl ? req.originalUrl : "";
    obj.body = req && req.body ? JSON.stringify(req.body, null, 4) : "";
    if (obj.body && obj.body.length > 1000) {
        obj.body = obj.body.substring(0, 999) + "...";
    }
    obj.query = req && req.query ? JSON.stringify(req.query, null, 4) : "";
    if (obj.query && obj.query.length > 1000) {
        obj.query = obj.query.substring(0, 999) + "...";
    }
    obj.params = req && req.orgParams ? JSON.stringify(req.orgParams, null, 4) : "";
    if (obj.params === "") obj.params = req && req.params ? JSON.stringify(req.params, null, 4) : "";
    if (obj.params && obj.params.length > 1000) {
        obj.params = obj.params.substring(0, 999) + "...";
    }
    obj.headers = req && req.headers ? JSON.stringify(req.headers, null, 4) : "";
    if (obj.headers && obj.headers.length > 1000) {
        obj.headers = obj.headers.substring(0, 999) + "...";
    }
    obj.hostname = req && req.hostname ? req.hostname : "";
    if (obj.hostname && obj.hostname.length > 1000) {
        obj.hostname = obj.hostname.substring(0, 999) + "...";
    }
    obj.remoteIp = req && req.ip ? req.ip : "";
    if (obj.remoteIp && obj.remoteIp.length > 1000) {
        obj.remoteIp = obj.remoteIp.substring(0, 999) + "...";
    }
    obj.user = this.extractUserFromRequest(req);
    obj.useragent = req.useragent ? req.useragent : null;

    return obj;
};

exports.prepareErrorBody = function (error, req, isForEmail) {
    var str = "";
    var errorTemplateFile = path.join(__dirname, "..", "views", "templates", "error.html");
    if (fs.existsSync(errorTemplateFile))
        str = fs.readFileSync(errorTemplateFile).toString();

    var r = this.getReqInfo(req);
    if (str !== "") {
        str = str.replace("[boxmaxwidth]", isForEmail ? "600px" : "80%");
        str = str.replace("[errmsg]", error.message ? error.message : "");
        str = str.replace("[errstack]", error.stack ? error.stack : "");
        str = str.replace("[reqmethod]", r.method);
        str = str.replace("[reqpath]", r.reqPath);
        str = str.replace("[reqbody]", r.body);
        str = str.replace("[reqquery]", r.query);
        str = str.replace("[reqparam]", r.params);
        str = str.replace("[reqheaders]", r.headers);
        str = str.replace("[reqhostname]", r.hostname);
        str = str.replace("[reqip]", r.remoteIp === "::1" ? "local" : r.remoteIp);
        str = str.replace("[reqbrowser]", r.useragent ? r.useragent.browser : "");
        str = str.replace("[userid]", r.user ? r.user.userId : "");
        return str;
    }
    else {
        var err = error.stack ? error.stack : error;
        str = "<html><head><title>Some error occured</title></head><body>";
        str += "<div><h4>Error</h4></div>";
        str += "<div>" + err + "</div>";
        str += "<br/><br/>";
        str += "<div><h4>Request</h4></div>";
        str += "<div><b>Url :</b> " + r.reqPath + "</div>";
        str += "<div><b>Method :</b> " + req.method + "</div>";
        str += "<div><b>Params :</b> " + r.params + "</div>";
        str += "<div><b>Query :</b> " + r.query + "</div>";
        str += "<div><b>Body :</b> " + r.body + "</div>";
        str += "<div><b>Headers :</b> " + r.headers + "</div>";
        str += "<div><b>Userid : </b>" + (r.user ? r.user.userid : "") + "</div>";
        str += "<div><b>Hostname : </b>" + r.hostname + "</div>";
        str += "<div><b>Ip : </b>" + r.remoteIp + "</div>";
        str += "<div><b>Browser : </b>" + (r.useragent ? r.useragent.browser : "") + "</div>";
        return str + "</body></html>";
    }
};