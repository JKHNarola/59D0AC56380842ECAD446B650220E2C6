var fs = require('fs');
var path = require("path");
var express = require('express');
var bodyParser = require('body-parser');
var routes = require('./route');
var errorhandlingMiddleware = require('./middlewares/errorhandler');
var emailService = require("./lib/mailservice");

try {
    //Set application globals
    var configFile = path.join(__dirname, 'appconfig.json');
    if (fs.existsSync(configFile))
        global.appconfig = JSON.parse(fs.readFileSync(configFile));

    if (!global.appconfig) global.appconfig = {};
    if (!global.appconfig.env) global.appconfig.env = process.env.env ? process.env.env.toString() : "prod";
    if (!global.appconfig.port) global.appconfig.port = process.env.PORT || 3500;
    if (!global.appconfig.dbconfig) global.appconfig.dbconfig = process.env.dbconfig ? JSON.parse(process.env.dbconfig.toString()) : null;
    if (!global.appconfig.emailconfig) global.appconfig.emailconfig = process.env.emailconfig ? JSON.parse(process.env.emailconfig.toString()) : null;
    if (!global.appconfig.tokentimespan) global.appconfig.tokentimespan = process.env.tokentimespan ? process.env.tokentimespan.toString() : "1h";
    global.securityKey = process.env.securitykey || null;

    global.isDev = global.appconfig.env === "dev";

    if (!global.appconfig.env ||
        !global.appconfig.port ||
        !global.appconfig.dbconfig ||
        !global.appconfig.emailconfig ||
        !global.appconfig.tokentimespan ||
        !global.securityKey) {
        throw new Error("Missing required application configurations!!");
    }

    var app = express();

    //Body parser config for API Post body
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());

    //Viewengine setup
    app.set('views', path.join(__dirname, '/views'));
    app.set("view engine", "ejs");

    //Allow static files
    app.use(express.static(__dirname + '/public'));

    //Configure routes
    routes(app);

    //Configure global error handler
    errorhandlingMiddleware(app);

    //Start listening on configured port
    var server = app.listen(global.appconfig.port, function () {
        console.info("Server is listening on port " + server.address().port + "...");
    });

} catch (err) {
    if (global.isDev)
        console.error(err.stack);
    else
        emailService.sendMail("jkh@narola.email", "DemoAPi error", err.stack, true);
    return;
}