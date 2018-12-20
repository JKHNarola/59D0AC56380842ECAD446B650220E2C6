var authorize = require('./middlewares/authorizejwttoken');

module.exports = function (app) {
    var pageCtrl = require("./controllers/pageController");
    var catCtrl = require("./controllers/categoryController");
    var authCtrl = require("./controllers/authController");

    //Routes for pages
    app.route('/')
        .get(pageCtrl.indexPage);

    app.route('/signup')
        .get(pageCtrl.registerPage);

    app.route('/verifyemail')
        .get(pageCtrl.emailVerificationPage);

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

    app.route('/api/verifyemail')
        .post(authCtrl.verifyEmailAsync);

    app.route('/api/logout')
        .get(authCtrl.logout);

    app.route('/api/categories')
        .get(authorize, catCtrl.listAsync);

    app.route('/api/categories/:id')
        .get(authorize, catCtrl.getAsync);
};