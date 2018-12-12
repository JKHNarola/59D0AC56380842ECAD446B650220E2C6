exports.index = function (req, res, next) {
    try {
        res.render("home", { pageTitle : "App - Home"});
    } catch (e) {
        next(e);
    }
};