var camelCase = require("camelcase-keys");
var sql = require("mssql");
var pool = new sql.ConnectionPool(global.appconfig.dbconfig);

exports.listAsync = async function () {
    if (!pool.connected)
        await pool.connect();
    var result = await pool.query("SELECT CategoryID, CategoryName, Description, Picture FROM CATEGORIES");
    if (pool.connected)
        await pool.close();
    return camelCase(result.recordsets[0]);
};

exports.getAsync = async function (id) {
    if (!pool.connected)
        await pool.connect();
    var result = await pool.request()
        .input('id', sql.Int, id)
        .query("SELECT CategoryID, CategoryName, Description, Picture FROM CATEGORIES WHERE CategoryID=@id");
    if (pool.connected)
        await pool.close();

    if (result.recordsets[0][0])
        return camelCase(result.recordsets[0][0]);
    else
        return;
};