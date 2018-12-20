exports.index = function (req, res, next) {
    try {
        res.render("home", { pageTitle : "App - Home"});
    } catch (e) {
        next(e);
    }
};

exports.register = function (req, res, next) {
    try {
        res.render("register", { pageTitle: "App - Registration" });
    } catch (e) {
        next(e);
    }
};