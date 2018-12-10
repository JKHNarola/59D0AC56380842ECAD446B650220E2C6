var fs = require('fs');
var path = require("path");
const sgMail = require('@sendgrid/mail');

exports.sendMail = function (to, subject, body, isText) {
    sgMail.setApiKey(global.appconfig.emailconfig.sendgridkey);
    var msg = {
        to: to,
        from: global.appconfig.emailconfig.from,
        subject: subject
    };
    if (isText) msg.text = body;
    else msg.html = body;
    try {
        sgMail.send(msg);
    } catch (ex) {
        //No need to handle error
    }
};

exports.sendErrorMail = function (error, req) {
    sgMail.setApiKey(global.appconfig.emailconfig.sendgridkey);
    var msg = {
        to: global.appconfig.emailconfig.errormailto,
        from: global.appconfig.emailconfig.from,
        subject: "DemoApi error",
        html: prepareBody(error, req)
    };


    try {
        sgMail.send(msg);
    } catch (ex) {
        //No need to handle error
    }
};

exports.generateErrorBody = function (error, req) {
    return prepareErrorBody(error, req);
};

//TODO code cleanup
var prepareErrorBody = function (error, req) {
    var str = "";
    var errorTemplateFile = path.join(__dirname, "..", "views", "staticpages", "errortemplate.html");
    if (fs.existsSync(errorTemplateFile))
        str = fs.readFileSync(errorTemplateFile).toString();

    if (str !== "") {
        str = str.replace("[errmsg]", error.message ? error.message : "");
        str = str.replace("[errstack]", error.stack ? error.stack : "");
        str = str.replace("[reqmethod]", req && req.method ? req.method.toUpperCase() : "");
        str = str.replace("[reqpath]", req && req.originalUrl ? req.originalUrl : "");

        var body = req && req.body ? JSON.stringify(req.body) : "";
        if (body && body.length > 1000) {
            body = body.substring(0, 999) + "...";
        }
        str = str.replace("[reqbody]", body);

        var query = req && req.query ? JSON.stringify(req.query) : "";
        if (query && query.length > 1000) {
            query = query.substring(0, 999) + "...";
        }
        str = str.replace("[reqquery]", query);

        var params = req && req.orgParams ? JSON.stringify(req.orgParams) : "";
        if (params === "") params = req && req.params ? JSON.stringify(req.params) : "";
        if (params && params.length > 1000) {
            params = params.substring(0, 999) + "...";
        }
        str = str.replace("[reqparam]", params);

        var headers = req && req.headers ? JSON.stringify(req.headers) : "";
        if (headers && headers.length > 1000) {
            headers = headers.substring(0, 999) + "...";
        }
        str = str.replace("[reqheaders]", headers);

        var hostname = req && req.hostname ? req.hostname : "";
        if (hostname && hostname.length > 1000) {
            hostname = hostname.substring(0, 999) + "...";
        }
        str = str.replace("[reqhostname]", hostname);        

        var ip = req && req.ip ? req.ip : "";
        if (ip && ip.length > 1000) {
            ip = ip.substring(0, 999) + "...";
        }
        str = str.replace("[reqip]", ip);   

        return str;
    }
    else {
        var err = error.stack ? error.stack : error;
        str = "<html><head><title>Some error occured</title></head><body>";
        str += "<div><h4>Error</h4></div>";
        str += "<div>" + err + "</div>";
        str += "<br/><br/>";

        if (req) {
            str += "<div><h4>Request</h4></div>";
            str += "<div><b>Url :</b> " + req.originalUrl + "</div>";
            if (req.method) str += "<div><b>Method :</b> " + req.method + "</div>";
            if (req.orgParams) {
                var x = JSON.stringify(req.orgParams);
                if (x && x.length > 1000) {
                    x = x.substring(0, 999) + "...";
                }
                str += "<div><b>Params :</b> " + x + "</div>";
            } else if (req.params) {
                x = JSON.stringify(req.params);
                if (x && x.length > 1000) {
                    x = x.substring(0, 999) + "...";
                }
                str += "<div><b>Params :</b> " + x + "</div>";
            }

            if (req.query) {
                x = JSON.stringify(req.query);
                if (x && x.length > 1000) {
                    x = x.substring(0, 999) + "...";
                }
                str += "<div><b>Query :</b> " + x + "</div>";
            }

            if (req.body) {
                x = JSON.stringify(req.body);
                if (x && x.length > 1000) {
                    x = x.substring(0, 999) + "...";
                }
                str += "<div><b>Body :</b> " + x + "</div>";
            }

            if (req.headers) {
                x = JSON.stringify(req.headers);
                if (x && x.length > 1000) {
                    x = x.substring(0, 999) + "...";
                }
                str += "<div><b>Headers :</b> " + x + "</div>";
            }
            if (req.hostname) str += "<div>Hostname : " + req.hostname + "</div>";
            if (req.ip) str += "<div><b>Ip :,</b> " + req.ip + "</div>";
        }
        return str + "</body></html>";
    }
};