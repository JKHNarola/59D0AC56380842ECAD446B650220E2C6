var camelcase = require("camelcase-keys");
var sql = require("mssql");
var pool = new sql.ConnectionPool(global.appconfig.dbconfig);

exports.authenticateAsync = async function (username, password) {
    if (!pool.connected)
        await pool.connect();
    var result = await pool.request()
        .input('username', sql.VarChar, username)
        .query("SELECT * FROM USERS WHERE Username=@username");
    if (pool.connected)
        await pool.close();

    var res = camelcase(result.recordsets[0]);
    if (res.length === 1 && res[0].password === password) {
        delete res[0]["password"];
        delete res[0]["isEmailConfirmed"];
        return res[0];
    } else
        return null;
};