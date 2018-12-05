var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var routes = require('./route');
var errorhandlingMiddleware = require('./middlewares/errorhandler');

//Set application globals
global.appconfig = JSON.parse(fs.readFileSync(__dirname + '/appconfig.json'));
global.isDev = global.appconfig.env == "dev";
global.securityKey = "CarnivalPreCarnivalSale_Carnival_Pre_CarnivalSale_Carnival_PreSale";
var port = global.appconfig.port;

var app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//Allow static files
app.use(express.static(__dirname + '/public'));

routes(app);
errorhandlingMiddleware(app);

var server = app.listen(port, function () {
    var port = server.address().port;
    console.log("Listening on port " + port);
});