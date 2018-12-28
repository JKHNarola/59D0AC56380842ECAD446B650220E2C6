const reshelper = require('../lib/resultHelper');
const repo = require("../repos/userRepo");

exports.checkUserExistsAsync = async function (req, res, next) {
    try {
        var u = req.body.username;
        var e = req.body.email;
        if (u || e) {
            var isExists = await repo.checkUserExistsAsync(u, e);
            reshelper.sendOkResult(res, isExists ? "Username/email already exists." : "Username/email not exists.", { isExists: isExists }, 1);
        }
        else reshelper.sendOtherResult(res, 400, "Username/email not provided.");
    }
    catch (e) {
        next(e);
    }
};

exports.registerAsync = async function (req, res, next) {
    try {
        var u = req.body.username;
        var p = req.body.password;
        var f = req.body.fullname;
        var e = req.body.email;
        if (!u || !p || !f || !e) {
            reshelper.sendOtherResult(res, 400, "Required fields not provided.");
            return;
        }

        var pic = null;
        var base64 = req.body.profilePic;
        if (base64) pic = new Buffer(base64.replace(/^data:image\/(png|gif|jpeg);base64,/, ''), 'base64');

        await repo.registerAsync(e, p, u, f, pic);

        reshelper.sendOkResult(res, "User registration successful.", null, 1);
    }
    catch (e) {
        next(e);
    }
};

exports.verifyEmailAsync = async function (req, res, next) {
    try {
        var e = req.body.email;
        var c = req.body.code;
        if (!e || !c) {
            reshelper.sendOtherResult(res, 400, "Email or Code not provided.");
            return;
        }

        var x = await repo.verifyEmailAsync(e, c);
        if (x === null) reshelper.sendOkResult(res, "Email is already verified.", null, 2);
        else reshelper.sendOkResult(res, "Email successfully verified.", null, 1);
    }
    catch (e) {
        next(e);
    }
};

exports.getProfilePicAsync = async function (req, res, next) {
    try {
        var user = req.decodedToken.user;
        var id = user ? user.userId : -1;
        if (id === -1) {
            reshelper.sendOtherResult(res, 400, "Userid not provided.");
            return;
        }

        var pic = await repo.getProfilePicAsync(id);
        reshelper.sendOkResult(res, "Profile picture.", pic, 1);
    }
    catch (e) {
        next(e);
    }
};

exports.saveAsync = async function (req, res, next) {
    try {
        var id = req.body.userId ? req.body.userId : -1;
        if (id === -1) {
            reshelper.sendOtherResult(res, 400, "Userid not provided.");
            return;
        }
        var pic = null;
        var base64 = req.body.profilePic;
        if (base64) pic = new Buffer(base64.replace(/^data:image\/(png|gif|jpeg);base64,/, ''), 'base64');

        var user = {
            userId: id,
            fullname: req.body.fullname,
            profilePic: pic
        };

        await repo.saveAsync(user);
        reshelper.sendOkResult(res, "Proifle saved.", null, 1);
    }
    catch (e) {
        next(e);
    }
};

exports.getAsync = async function (req, res, next) {
    try {
        var user = req.decodedToken.user;
        var id = user ? user.userId : -1;
        if (id === -1) {
            reshelper.sendOtherResult(res, 400, "Userid not provided.");
            return;
        }

        var p = await repo.getAsync(id, true);
        if (!p)
            reshelper.sendOtherResult(res, 404, "User's proifle not found.", null);
        else
            reshelper.sendOkResult(res, "User's proifle found.", p, 1);
    }
    catch (e) {
        next(e);
    }
};

exports.changePasswordAsync = async function (req, res, next) {
    try {
        var user = req.decodedToken.user;
        var id = user ? user.userId : -1;
        var np = req.body.newpasswd;
        var op = req.body.oldpasswd;
        if (id === -1 || !np || !op) {
            reshelper.sendOtherResult(res, 400, "Required fields not provided.");
            return;
        }


        var isSuccess = await repo.changePasswordAsync(id, op, np);
        if (isSuccess !== null && isSuccess === false)
            reshelper.sendErrorResult(res, "Your current password didn't matched.");
        else if (isSuccess)
            reshelper.sendOkResult(res, "Your password is successfully changed.", null, 1);
        else
            reshelper.sendErrorResult(res, "Couldn't change your password.");
    }
    catch (e) {
        next(e);
    }
};

exports.requestForgotPasswordAsync = async function (req, res, next) {
    try {
        var email = req.query.email;
        if (!email) {
            reshelper.sendOtherResult(res, 400, "Email id not provided.");
            return;
        }

        await repo.requestForgotPassword(email);
        reshelper.sendOkResult(res, "Reset password link successfully to provided email.", null, 1);
    }
    catch (e) {
        next(e);
    }
};

exports.resetPasswordAsync = async function (req, res, next) {
    try {
        var email = req.body.email;
        var code = req.body.code;
        var np = req.body.newpasswd;
        if (!np) {
            reshelper.sendOtherResult(res, 400, "New password not provided.");
            return;
        }

        var isSuccess = await repo.resetPasswordAsync(email, code, np);
        if (isSuccess)
            reshelper.sendOkResult(res, "Password is successfully reset.", null, 1);
        else
            reshelper.sendErrorResult(res, "Couldn't reset password.");
    }
    catch (e) {
        next(e);
    }
};
