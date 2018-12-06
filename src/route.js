var authMiddleware = require('./middlewares/authorizejwttoken');

module.exports = function (app) {
    var pagesCtrl = require("./controllers/pagesController");
    var catCtrl = require("./controllers/categoryController");
    var authCtrl = require("./controllers/authController");

    //Routes for pages
    app.route('/')
        .get(pagesCtrl.indexPage);

    app.route('/categories')
        .get(pagesCtrl.categoriesPage);

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