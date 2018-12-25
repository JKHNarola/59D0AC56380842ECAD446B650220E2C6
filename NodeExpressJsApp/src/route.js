module.exports = function (app) {
    var authorize = require('./middlewares/authorizejwttoken');

    var pageCtrl = require("./controllers/pageController");
    var catCtrl = require("./controllers/categoryController");
    var authCtrl = require("./controllers/authController");
    var userCtrl = require("./controllers/userController");

    //Pages
    app.route('/')
        .get(pageCtrl.indexPage);

    app.route('/signup')
        .get(pageCtrl.registerPage);

    app.route('/manageprofile')
        .get(pageCtrl.manageProfileage);

    app.route('/verifyemail')
        .get(pageCtrl.emailVerificationPage);

    app.route('/categories')
        .get(catCtrl.index);

    app.route('/testerror')
        .get(function (req, res) {
            throw new Error("Some error occured.");
        });


    //Apis
    app.route('/api/authenticate')
        .post(authCtrl.authenticateAsync);
    app.route('/api/logout')
        .get(authCtrl.logout);

    app.route('/api/register')
        .post(userCtrl.registerAsync);
    app.route('/api/checkuserexists')
        .post(userCtrl.checkUserExistsAsync);
    app.route('/api/verifyemail')
        .post(userCtrl.verifyEmailAsync);
    app.route('/api/user/pic')
        .get(authorize, userCtrl.getProfilePicAsync);
    app.route('/api/user')
        .get(authorize, userCtrl.getAsync)
        .post(authorize, userCtrl.saveAsync);

    app.route('/api/categories')
        .get(authorize, catCtrl.listAsync);
    app.route('/api/categories/:id')
        .get(authorize, catCtrl.getAsync);
};