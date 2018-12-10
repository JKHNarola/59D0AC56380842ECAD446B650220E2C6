var authorize = require('./middlewares/authorizejwttoken');
var cors = require('cors');

module.exports = function (app) {
    var pagesCtrl = require("./controllers/pagesController");
    var catCtrl = require("./controllers/categoryController");
    var authCtrl = require("./controllers/authController");

    //Routes for pages
    app.route('/')
        .get(pagesCtrl.indexPage);

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
        .get(authorize, catCtrl.listAsync);

    app.route('/api/categories/:id')
        .get(authorize, catCtrl.getAsync);
};