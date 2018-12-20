var camelcase = require("camelcase-keys");
var sql = require("mssql");
var pool = new sql.ConnectionPool(global.appconfig.dbconfig);
var passwordHash = require('password-hash');
const uuidv1 = require('uuid/v1');
var mailService = require("../lib/mailservice");
var crypto = require("../lib/cryptohelper");
const utils = require("../lib/utils");

exports.authenticateAsync = async function (username, password) {
    if (!pool.connected)
        await pool.connect();
    var result = await pool.request()
        .input('username', sql.VarChar, username)
        .query("SELECT * FROM USERS WHERE Username=@username");
    if (pool.connected)
        await pool.close();

    var res = camelcase(result.recordsets[0]);
    if (res && res.length === 1 && passwordHash.verify(password, res[0].passwordHash)) {
        delete res[0]["passwordHash"];
        delete res[0]["isEmailConfirmed"];
        return res[0];
    } else
        return null;
};

exports.checkUserExistsAsync = async function (username, email) {
    if (!pool.connected)
        await pool.connect();
    var res = await pool.request()
        .input('username', sql.VarChar, username)
        .input('email', sql.VarChar, email)
        .query("SELECT * FROM USERS WHERE Username=@username or Email=@email");
    var s = false;
    s = res && res.recordsets && res.recordsets[0].length === 1;

    if (pool.connected)
        await pool.close();

    return s;
};

exports.registerAsync = async function (email, password, username, fullname) {
    if (await this.checkUserExistsAsync(username)) throw new Error("Usename or Email is already assigned to another user.");

    var transaction = new sql.Transaction(pool);
    var sstamp = uuidv1();

    if (!pool.connected)
        await pool.connect();
    await transaction.begin();
    try {
        var req = new sql.Request(transaction);
        req.input('username', sql.VarChar, username);
        req.input('email', sql.VarChar, email.toLowerCase());
        req.input('password', sql.VarChar, passwordHash.generate(password));
        req.input('fullname', sql.VarChar, fullname);
        req.input('securitystamp', sql.VarChar, sstamp);
        var result = await req.query("INSERT INTO Users (Username, Fullname, Email, PasswordHash, IsEmailConfirmed, SecurityStamp) VALUES (@username, @fullname ,@email, @password, 0, @securitystamp)");

        if (result) {
            var d = new Date();
            var expd = d.setDate(d.getDate() + parseInt(1));

            var obj = {
                type: "verifyemail",
                expiration: expd,
                key: sstamp
            };
            var url = global.appconfig.hosturl + ":" + global.appconfig.port + "/verifyemail?code=" + utils.encode(crypto.encrypt(JSON.stringify(obj)).toString()) + "&email=" + utils.encode(email);
            mailService.sendMail(email, "Verify Email", "<html><body><a href='" + url + "'>Verify Email</a></body></html>", false);
        }
        await transaction.commit();
    }
    catch (ex) {
        await transaction.rollback();
        throw ex;
    }

    if (pool.connected)
        await pool.close();
};

exports.verifyEmailAsync = async function (email, code) {
    var ex;
    if (!code) ex = new Error("Code not provided!!");

    var dCode = JSON.parse(crypto.decrypt(code));
    if (!dCode || dCode.type !== 'verifyemail') ex = new Error("Invalid code!!");

    if (ex) throw ex;

    if (!pool.connected)
        await pool.connect();
    var res = await pool.request()
        .input('email', sql.VarChar, email)
        .query("SELECT * FROM USERS WHERE Email=@email");
    if (res && res.recordsets && res.recordsets[0].length === 1) {
        var cc = camelcase(res.recordsets[0]);
        if (dCode.key !== cc[0].securityStamp && new Date(dCode.expiration) > new Date())
            ex = Error("Code expired!!");
        else {
            //Update sstamp and isemailconfirmed
            var ures = await pool.request()
                .input('securityStamp', sql.VarChar, uuidv1())
                .query("UPDATE user set SecurityStamp=@securityStamp, IsEmailConfirmed=1 WHERE UserId=@email");

        }
    }
    else {
        ex = new Error("User is not registered for the provided email.");
    }

    if (pool.connected)
        await pool.close();

    if (ex) throw ex;
};