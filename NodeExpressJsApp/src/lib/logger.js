var path = require("path");
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(path.join('..', 'logs.db'));

exports.init = function () {
    db.serialize(function () {
        db.run("CREATE TABLE IF NOT EXISTS Errors (Id INTEGER AUTOINCREMENT, )");

        var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
        for (var i = 0; i < 10; i++) {
            stmt.run("Ipsum " + i);
        }
        stmt.finalize();

        db.each("SELECT rowid AS id, info FROM lorem", function (err, row) {
            console.log(row.id + ": " + row.info);
        });
    });

    db.close();
}