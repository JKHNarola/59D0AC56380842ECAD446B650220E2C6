const sgMail = require('@sendgrid/mail');
exports.sendMail = function (to, subject, body, isText) {
    sgMail.setApiKey(global.appconfig.emailconfig.sendgridkey);
    var msg = {
        to: to,
        from: global.appconfig.emailconfig.from,
        subject: subject,
    };
    if (isText) msg.text = body;
    else msg.html = body;
    try {
        sgMail.send(msg);
    } catch (ex) {

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

    }
};

exports.generateErrorBody = function (error, req) {
    return prepareErrorBody(error, req);
}

var prepareErrorBody = function (error, req) {
    var err = error.stack ? error.stack : error;
    var str = "<html><head><title>Some error occured</title></head><body>";
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
            var x = JSON.stringify(req.params);
            if (x && x.length > 1000) {
                x = x.substring(0, 999) + "...";
            }
            str += "<div><b>Params :</b> " + x + "</div>";
        }

        if (req.query) {
            var x = JSON.stringify(req.query);
            if (x && x.length > 1000) {
                x = x.substring(0, 999) + "...";
            }
            str += "<div><b>Query :</b> " + x + "</div>";
        }
        if (req.headers) {
            var x = JSON.stringify(req.headers);
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