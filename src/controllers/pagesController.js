var resHelper = require("../lib/resultHelper");

exports.indexPage = function (req, res, next) {
    try {
        // resHelper.sendPage(res, 200, "index.html");
        res.render("index");
    } catch (e) {
        next(e);
    }
}
