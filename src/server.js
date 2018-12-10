var fs = require('fs');
var path = require("path");
var express = require('express');
var bodyParser = require('body-parser');
var routes = require('./route');
var errorhandlingMiddleware = require('./middlewares/errorhandler');
var emailService = require("./lib/mailservice");

var alternativeEmail = 'jkh@narola.email';
var configFile = __dirname + '/appconfig.json';
if (!fs.existsSync(configFile)) {
    console.error("appconfig.json file not exists!!");
    return;
}

try {
    //Set application globals
    global.appconfig = JSON.parse(fs.readFileSync(configFile));
    global.isDev = global.appconfig.env == "dev";
    global.securityKey = "CarnivalPreCarnivalSale_Carnival_Pre_CarnivalSale_Carnival_PreSale";

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
        console.log("Server is listening on port " + server.address().port + "...");
    });

} catch (err) {
    if (global.isDev)
        console.error(err.stack);
    else
        emailService.sendMail(alternativeEmail, "DemoAPi error", err.stack, true);
    return;
}