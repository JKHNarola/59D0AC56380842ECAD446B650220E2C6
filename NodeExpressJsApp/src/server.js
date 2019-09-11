var express = require('express');
var app = express();

var fs = require('fs');
var path = require("path");
var bodyParser = require('body-parser');
var morgan = require('morgan');
var chalk = require('chalk');
var useragent = require('express-useragent');

var routes = require('./route');
var errorhandlingMiddleware = require('./middlewares/errorhandler');
var emailService = require("./lib/mailservice");
var logger = require('./lib/logger');

try {
    //#region Init Sqlite3 Logger
    logger.initAsync();
    //#endregion

    //#region Set application globals
    var configFile = path.join(__dirname, 'appconfig.json');
    if (fs.existsSync(configFile))
        global.appconfig = JSON.parse(fs.readFileSync(configFile).toString().trim());

    if (!global.appconfig) global.appconfig = {};
    if (!global.appconfig.env) global.appconfig.env = process.env.env ? process.env.env.toString() : "prod";
    if (!global.appconfig.port) global.appconfig.port = process.env.PORT || 3334;
    if (!global.appconfig.dbconfig) global.appconfig.dbconfig = process.env.dbconfig ? JSON.parse(process.env.dbconfig.toString()) : null;
    if (!global.appconfig.emailconfig) global.appconfig.emailconfig = process.env.emailconfig ? JSON.parse(process.env.emailconfig.toString()) : null;
    if (!global.appconfig.tokentimespan) global.appconfig.tokentimespan = process.env.tokentimespan ? process.env.tokentimespan.toString() : "1h";
    if (!global.appconfig.hosturl) global.appconfig.hosturl = process.env.hosturl ? process.env.hosturl.toString() : null;
    global.securityKey = process.env.securitykey || null;

    global.isDev = global.appconfig.env === "dev";

    console.log(global.appconfig);

    if (!global.appconfig.env ||
        !global.appconfig.port ||
        !global.appconfig.dbconfig ||
        !global.appconfig.emailconfig ||
        !global.appconfig.tokentimespan ||
        !global.appconfig.hosturl ||
        !global.securityKey
    ) {
        logger.logInfoAsync("Missing required application configurations!!", global.appconfig).then(function () {
            throw new Error("Missing required application configurations!!");
        });
    }

    console.log("");
    console.log(chalk.cyan("Environment: ") + chalk.cyanBright(global.appconfig.env) + chalk.reset());
    //#endregion

    //#region Useragent
    app.use(useragent.express());
    //#endregion

    //#region Console logs for all requests
    if (global.isDev)
        app.use(morgan(function (tokens, req, res) {
            var t;
            var s = tokens.status(req, res);
            switch (s) {
                case "500":
                    t = chalk.redBright(tokens.status(req, res));
                    break;
                case "400":
                case "404":
                    t = chalk.yellowBright(tokens.status(req, res));
                    break;
                case "200":
                    t = chalk.greenBright(tokens.status(req, res));
                    break;
                default:
                    t = chalk.cyanBright(tokens.status(req, res));
                    break;
            }

            var m;
            var ms = tokens['response-time'](req, res);

            if (ms <= 2000)
                m = chalk.green(tokens['response-time'](req, res));
            else if (ms <= 10000)
                m = chalk.yellow(tokens['response-time'](req, res));
            else if (ms > 10000)
                m = chalk.red(tokens['response-time'](req, res));

            var u = chalk.white(tokens.url(req, res));
            var meth = chalk.whiteBright(tokens.method(req, res));
            return meth + ' ' + t + ' ' + m + ' ' + u;
        }));
    //#endregion

    //#region Body parser config for API Post body
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
    app.use(bodyParser.json({ limit: '50mb', extended: true }));
    //#endregion

    //#region Viewengine setup
    app.set('views', path.join(__dirname, '/views'));
    app.set("view engine", "ejs");
    //#endregion

    //#region Allow static files
    app.use(express.static(__dirname + '/public'));
    //#endregion

    //#region Configure routes
    routes(app);
    //#endregion

    //#region Configure global error handler
    errorhandlingMiddleware(app);
    //#endregion

    //#region Start listening on configured port
    var server = app.listen(global.appconfig.port, async function () {
        await logger.logInfoAsync("Server started", { portno: server.address().port });
        console.log(chalk.green("Server listening on: ") + chalk.greenBright('http://localhost:' + server.address().port));
        console.log("");
    });
    //#endregion

} catch (err) {
    if (err && err.stack) {
        console.log(chalk.redBright(err));
        var txt = new Date().toString() + "\r\n" + err.stack.toString() + "\r\n\r\n";
        fs.appendFileSync("logs.txt", txt);
        emailService.sendErrorMailAsync("jigu.khanpara@gmail.com", "App server init error", err.stack, true);
    }
}