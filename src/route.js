var resHelper = require("./lib/resultHelper");

module.exports = function (app) {
    var catCtrl = require("./controllers/categoryController");

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
    app.route('/api/categories')
        .get(async (req, res, next) => {
            try {
                await catCtrl.listAsync(req, res);
            } catch (e) {
                next(e);
            }
        });

    app.route('/api/categories/:id')
        .get(async (req, res, next) => {
            manipulateReq(req);
            try {
                await catCtrl.getAsync(req, res);
            } catch (e) {
                next(e);
            }
        });

    var manipulateReq = function (req) {
        req.orgParams = req.params;
    }
};