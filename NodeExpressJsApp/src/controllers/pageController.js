exports.indexPage = function (req, res, next) {
    try {
        res.render("home", { pageTitle : "App - Home"});
    } catch (e) {
        next(e);
    }
};

exports.registerPage = function (req, res, next) {
    try {
        res.render("register", { pageTitle: "App - Registration" });
    } catch (e) {
        next(e);
    }
};

exports.emailVerificationPage = function (req, res, next) {
    try {
        res.render("verifyemail", { pageTitle: "App - Email Verification" });
    } catch (e) {
        next(e);
    }
};