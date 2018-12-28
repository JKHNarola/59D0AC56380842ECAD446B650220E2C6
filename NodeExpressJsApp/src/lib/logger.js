const sqlite = require('sqlite-async');
const utils = require('./utils');
var path = require('path');
var dbfile = path.join('src', 'logs.db');
var db;

exports.initAsync = async function () {
    try {
        db = await sqlite.open(dbfile, sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE);
        await db.run("CREATE TABLE IF NOT EXISTS Errors (Id INTEGER PRIMARY KEY AUTOINCREMENT, Message TEXT NULL, Stack TEXT NULL, Browser TEXT NULL, Ip TEXT NULL, Header TEXT NULL, Path TEXT NULL, Method TEXT NULL, Query TEXT NULL, Body TEXT NULL, Params TEXT NULL, UserId TEXT NULL, TimeStamp DATETIME NOT NULL)");
        await db.run("CREATE TABLE IF NOT EXISTS Logs (Id INTEGER PRIMARY KEY AUTOINCREMENT, Message TEXT NULL, Data TEXT NULL, TimeStamp DATETIME NOT NULL)");
        await db.close();
    }
    catch (ex) {
        //ignore
    }
};

exports.logInfoAsync = async function (message, data) {
    try {
        db = await sqlite.open(dbfile, sqlite.OPEN_READWRITE);
        var params = [message, data ? JSON.stringify(data) : '', utils.toIsoString(new Date())];
        var st = await db.prepare("INSERT INTO Logs (Message, Data, TimeStamp) VALUES (?,?,?)");
        await st.run(params);
        await st.finalize();
        await db.close();
    }
    catch (ex) {
        //ignore
    }
};

exports.logErrorAsync = async function (err, req) {
    try {
        var r = utils.getReqInfo(req);
        db = await sqlite.open(dbfile, sqlite.OPEN_READWRITE);
        var st = await db.prepare("INSERT INTO Errors (Message, Stack, Browser, Ip, Header, Path, Method, Query, Body, Params, UserId, TimeStamp) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)");
        var p = [err ? err.message : null, err && err.stack ? err.stack.toString() : null, r.useragent ? r.useragent.browser : null, r.remoteIp ? r.remoteIp : null, r.headers, r.reqPath, r.method, r.query, r.body, r.params, r.user ? r.user.userId : null, utils.toIsoString(new Date())];
        await st.run(p);
        await st.finalize();
        await db.close();
    }
    catch (ex) {
        //ignore
    }
};