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

    if (result.recordsets[0].length == 1 && result.recordsets[0][0].Password == password) {
        delete result.recordsets[0][0]["Password"];
        delete result.recordsets[0][0]["UserId"];
        delete result.recordsets[0][0]["IsEmailConfirmed"];
        return result.recordsets[0][0];
    } else
        return null;
};