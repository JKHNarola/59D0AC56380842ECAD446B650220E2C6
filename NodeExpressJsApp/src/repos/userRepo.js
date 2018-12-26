var path = require("path");
var fs = require('fs');
var camelcase = require("camelcase-keys");
var sql = require("mssql");
var passwordHash = require('password-hash');
const uuidv1 = require('uuid/v1');
var mailService = require("../lib/mailservice");
var crypto = require("../lib/cryptohelper");
const utils = require("../lib/utils");

var pool = new sql.ConnectionPool(global.appconfig.dbconfig);
var connectPoolAsync = async function () {
    if (!pool.connected)
        await pool.connect();
};
var closePoolAsync = async function () {
    if (pool.connected)
        await pool.close();
};

exports.authenticateAsync = async function (username, password) {
    await connectPoolAsync();
    var result = await pool.request()
        .input('username', sql.VarChar, username)
        .query("SELECT * FROM USERS WHERE Username=@username and IsEmailConfirmed=1");
    await closePoolAsync();

    var res = camelcase(result.recordsets[0]);
    if (res && res.length === 1 && passwordHash.verify(password, res[0].passwordHash)) {
        delete res[0]["passwordHash"];
        delete res[0]["isEmailConfirmed"];
        delete res[0]["securityStamp"];
        delete res[0]["profilePic"];
        return res[0];
    } else
        return null;
};

exports.getProfilePicAsync = async function (userid) {
    await connectPoolAsync();
    var result = await pool.request()
        .input('userid', sql.Int, userid)
        .query("SELECT ProfilePic FROM USERS WHERE UserId=@userid");
    await closePoolAsync();

    var res = camelcase(result.recordsets[0]);
    if (res && res.length === 1) {
        return res[0].profilePic;
    } else
        return null;
};

exports.checkUserExistsAsync = async function (username, email) {
    await connectPoolAsync();
    var res = await pool.request()
        .input('username', sql.VarChar, username)
        .input('email', sql.VarChar, email)
        .query("SELECT * FROM USERS WHERE Username=@username or Email=@email");
    var s = false;
    s = res && res.recordsets && res.recordsets[0].length === 1;

    await closePoolAsync();

    return s;
};

exports.registerAsync = async function (email, password, username, fullname, profilePic) {
    if (await this.checkUserExistsAsync(username)) throw new Error("Usename or Email is already assigned to another user.");

    var transaction = new sql.Transaction(pool);
    var sstamp = uuidv1().toString();

    await connectPoolAsync();
    await transaction.begin();
    try {
        var req = new sql.Request(transaction);
        req.input('username', sql.VarChar, username);
        req.input('email', sql.VarChar, email.toLowerCase());
        req.input('password', sql.VarChar, passwordHash.generate(password));
        req.input('fullname', sql.VarChar, fullname);
        req.input('securitystamp', sql.VarChar, sstamp);
        req.input('profilePic', sql.Image, profilePic);
        var result = await req.query("INSERT INTO Users (Username, Fullname, Email, PasswordHash, IsEmailConfirmed, SecurityStamp, ProfilePic) VALUES (@username, @fullname ,@email, @password, 0, @securitystamp, @profilePic)");

        if (result) {
            var d = new Date();
            var expd = d.setDate(d.getDate() + parseInt(4));

            var obj = {
                type: "verifyemail",
                expiration: expd,
                key: sstamp
            };
            var url = global.appconfig.hosturl + ":" + global.appconfig.port + "/verifyemail?code=" + utils.encode(crypto.encrypt(JSON.stringify(obj)).toString()) + "&email=" + utils.encode(email);
            var str = "<html><body><a href='" + url + "'>Verify Email</a></body></html>";
            var file = path.join(__dirname, "..", "views", "templates", "verifyemail.html");
            if (fs.existsSync(file)) {
                str = fs.readFileSync(file).toString();
                str = utils.replaceAll(str, '[fullname]', fullname);
                str = utils.replaceAll(str, '[verifyaccounturl]', url);
                str = utils.replaceAll(str, '[expdatetime]', new Date(expd).toString());
            }

            await mailService.sendMailAsync(email, "App - Verify Email", str, false);
        }
        await transaction.commit();
    }
    catch (ex) {
        await transaction.rollback();
        throw ex;
    }

    await closePoolAsync();
};

exports.verifyEmailAsync = async function (email, code) {
    var ex;
    if (!code) ex = new Error("Code not provided!!");

    var dCode = JSON.parse(crypto.decrypt(code));
    if (!dCode || dCode.type !== 'verifyemail') ex = new Error("Invalid code!!");

    if (ex) throw ex;

    var j = null;
    await connectPoolAsync();
    var res = await pool.request()
        .input('email', sql.VarChar, email)
        .query("SELECT * FROM USERS WHERE Email=@email");
    if (res && res.recordsets && res.recordsets[0].length === 1) {
        var cc = camelcase(res.recordsets[0]);
        if (cc[0].isEmailConfirmed)
            j = 2;
        else if (dCode.key !== cc[0].securityStamp && new Date(dCode.expiration) > new Date())
            ex = new Error("Code expired!!"); //TODO: Delete account for re-register
        else {
            var ures = await pool.request()
                .input('securityStamp', sql.VarChar, uuidv1().toString())
                .input('userId', sql.Int, cc[0].userId)
                .query("UPDATE users set SecurityStamp=@securityStamp, IsEmailConfirmed=1 WHERE UserId=@userId");
            if (ures) j = 1;
            else ex = new Error("Verification failed.");
        }
    }
    else
        ex = new Error("User is not registered or email is not verified for the provided email.");

    await closePoolAsync();

    if (ex) throw ex;
    return j;
};

exports.getAsync = async function (id, isRemoveSecurityFields) {
    await connectPoolAsync();
    var result = await pool.request()
        .input('userId', sql.Int, id)
        .query("SELECT * FROM USERS WHERE UserId=@userId and IsEmailConfirmed=1");
    await closePoolAsync();

    var res = camelcase(result.recordsets[0]);
    if (res && res.length === 1) {
        if (isRemoveSecurityFields) {
            delete res[0]["passwordHash"];
            delete res[0]["isEmailConfirmed"];
            delete res[0]["securityStamp"];
        }
        return res[0];
    } else
        return null;
};

exports.saveAsync = async function (obj, isSaveAll) {
    var ex;
    await connectPoolAsync();
    var u;
    if (isSaveAll) {
        u = await pool.request()
            .input('securityStamp', sql.VarChar, obj.securityStamp)
            .input('userId', sql.Int, obj.userId)
            .input('fullname', sql.VarChar, obj.fullname)
            .input('email', sql.VarChar, obj.email)
            .input('passwordHash', sql.VarChar, obj.passwordHash)
            .input('username', sql.VarChar, obj.username)
            .input('profilePic', sql.Image, obj.profilePic)
            .input('isEmailConfirmed', sql.Bit, obj.isEmailConfirmed)
            .query("UPDATE users set SecurityStamp=@securityStamp, IsEmailConfirmed=@isEmailConfirmed, Fullname=@fullname, Username=@username, ProfilePic=@profilePic, Email=@email, PasswordHash=@passwordHash WHERE UserId=@userId");
        if (!u) ex = new Error("User update failed.");
    }
    else {
        u = await pool.request()
            .input('userId', sql.Int, obj.userId)
            .input('fullname', sql.VarChar, obj.fullname)
            .input('profilePic', sql.Image, obj.profilePic)
            .query("UPDATE users set Fullname=@fullname, ProfilePic=@profilePic WHERE UserId=@userId");
        if (!u) ex = new Error("User update failed.");
    }

    await closePoolAsync();

    if (ex) throw ex;
};

exports.changePasswordAsync = async function (userid, oldpasswd, newpasswd) {
    var ex;
    var r = false;
    await connectPoolAsync();
    var result = await pool.request()
        .input('userId', sql.Int, userid)
        .query("SELECT * FROM USERS WHERE UserId=@userId and IsEmailConfirmed=1");
    var res = camelcase(result.recordsets[0]);
    if (res && res.length === 1) {
        if (passwordHash.verify(oldpasswd, res[0].passwordHash)) {
            var u = await pool.request()
                .input('userId', sql.Int, userid)
                .input('password', sql.VarChar, passwordHash.generate(newpasswd))
                .query("UPDATE users set PasswordHash=@password WHERE UserId=@userId");
            if (u) r = true;
            else r = null;
        }
    } else
        ex = new Error("User is not registered or email is not verified for the provided id.");

    await closePoolAsync();

    if (ex) throw ex;
    return r;
};

exports.requestForgotPassword = async function (email) {
    var ex;
    await connectPoolAsync();
    var result = await pool.request()
        .input('email', sql.VarChar, email)
        .query("SELECT * FROM USERS WHERE Email=@email and IsEmailConfirmed=1");
    var res = camelcase(result.recordsets[0]);
    if (res && res.length === 1) {
        var d = new Date();
        var expd = d.setDate(d.getDate() + parseInt(2));

        var obj = {
            type: "resetpassword",
            expiration: expd,
            key: res[0].securityStamp
        };
        var url = global.appconfig.hosturl + ":" + global.appconfig.port + "/resetpassword?code=" + utils.encode(crypto.encrypt(JSON.stringify(obj)).toString()) + "&email=" + utils.encode(email);
        var str = "<html><body><a href='" + url + "'>Reset Your Password</a></body></html>";
        var file = path.join(__dirname, "..", "views", "templates", "resetpasswd.html");
        if (fs.existsSync(file)) {
            str = fs.readFileSync(file).toString();
            str = utils.replaceAll(str, '[fullname]', res[0].fullname);
            str = utils.replaceAll(str, '[resetpasswordurl]', url);
            str = utils.replaceAll(str, '[expdatetime]', new Date(expd).toString());
        }

        await mailService.sendMailAsync(email, "App - Reset Password", str, false);
    } else
        ex = new Error("User is not registered or email is not verified for the provided email.");

    await closePoolAsync();

    if (ex) throw ex;
};

exports.resetPasswordAsync = async function (email, code, newpasswd) {
    var ex;
    if (!code) ex = new Error("Code not provided!!");

    var dCode = JSON.parse(crypto.decrypt(code));
    if (!dCode || dCode.type !== 'resetpassword') ex = new Error("Invalid code!!");

    if (ex) throw ex;

    var j = false;
    await connectPoolAsync();
    var res = await pool.request()
        .input('email', sql.VarChar, email)
        .query("SELECT * FROM USERS WHERE Email=@email and IsEmailConfirmed=1");
    if (res && res.recordsets && res.recordsets[0].length === 1) {
        var cc = camelcase(res.recordsets[0]);
        if (dCode.key !== cc[0].securityStamp && new Date(dCode.expiration) > new Date())
            ex = new Error("Code expired!!");
        else {
            var ures = await pool.request()
                .input('securityStamp', sql.VarChar, uuidv1().toString())
                .input('userId', sql.Int, cc[0].userId)
                .input('password', sql.VarChar, passwordHash.generate(newpasswd))
                .query("UPDATE users set SecurityStamp=@securityStamp, PasswordHash=@password WHERE UserId=@userId");
            if (ures) j = true;
            else ex = new Error("Reset password failed.");
        }
    }
    else
        ex = new Error("User is not registered or email is not verified for the provided email.");

    await closePoolAsync();

    if (ex) throw ex;
    return j;
};
