var camelcase = require("camelcase-keys");
var sql = require("mssql");
var pool = new sql.ConnectionPool(global.appconfig.dbconfig);
var passwordHash = require('password-hash');

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

exports.registerAsync = async function (email, password, username, fullname) {
    if (!pool.connected)
        await pool.connect();
    var result = await pool.request()
        .input('username', sql.VarChar, username)
        .input('email', sql.VarChar, email)
        .input('password', sql.VarChar, passwordHash.generate(password))
        .input('fullname', sql.VarChar, fullname)
        .query("SELECT * FROM USERS WHERE Username=@username");
    if (pool.connected)
        await pool.close();

    var res = camelcase(result.recordsets[0]);
    if (res && res.length === 1 && passwordHash.verify(password, res[0].password)) {
        delete res[0]["password"];
        delete res[0]["isEmailConfirmed"];
        return res[0];
    } else
        return null;
};