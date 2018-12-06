var resHelper = require("./lib/resultHelper");
var authMiddleware = require('./middlewares/authorizejwttoken');

module.exports = function (app) {
    var catCtrl = require("./controllers/categoryController");
    var authCtrl = require("./controllers/authController");

    //Routes for pages
    app.route('/')
        .get(function (req, res) {
            resHelper.sendPage(res, 200, "index.html");
        });
    app.route('/categories')
        .get(function (req, res) {
            resHelper.sendPage(res, 200, "categories.html");
        });
    app.route('/testerror')
        .get(function (req, res) {
            throw new Error("Some error occured");
        });


    //Routes for apis
    app.route('/api/authenticate')
        .post(authCtrl.authenticateAsync);

    app.route('/api/logout')
        .get(authCtrl.logout);

    app.route('/api/categories')
        .get(authMiddleware, catCtrl.listAsync);

    app.route('/api/categories/:id')
        .get(authMiddleware, catCtrl.getAsync);
};