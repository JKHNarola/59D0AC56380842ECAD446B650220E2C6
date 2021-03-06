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

exports.manageProfileage = function (req, res, next) {
    try {
        res.render("manageprofile", { pageTitle: "App - Manage Profile" });
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

exports.resetPasswordPage = function (req, res, next) {
    try {
        res.render("resetpassword", { pageTitle: "App - Reset Password" });
    } catch (e) {
        next(e);
    }
};

exports.categoriesPage = function (req, res, next) {
    try {
        res.render("categories", { pageTitle: "App - Categories" });
    } catch (e) {
        next(e);
    }
};