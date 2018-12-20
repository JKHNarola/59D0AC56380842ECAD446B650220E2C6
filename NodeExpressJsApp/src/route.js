var authorize = require('./middlewares/authorizejwttoken');

module.exports = function (app) {
    var homeCtrl = require("./controllers/homeController");
    var catCtrl = require("./controllers/categoryController");
    var authCtrl = require("./controllers/authController");

    //Routes for pages
    app.route('/')
        .get(homeCtrl.index);

    app.route('/signup')
        .get(homeCtrl.register);

    app.route('/verifyemail')
        .get(authCtrl.verifyEmailAsync);

    app.route('/categories')
        .get(catCtrl.index);

    app.route('/testerror')
        .get(function (req, res) {
            throw new Error("Some error occured");
        });


    //Routes for apis
    app.route('/api/authenticate')
        .post(authCtrl.authenticateAsync);

    app.route('/api/register')
        .post(authCtrl.registerAsync);

    app.route('/api/checkuserexists')
        .post(authCtrl.checkUserExistsAsync);

    app.route('/api/logout')
        .get(authCtrl.logout);

    app.route('/api/categories')
        .get(authorize, catCtrl.listAsync);

    app.route('/api/categories/:id')
        .get(authorize, catCtrl.getAsync);
};