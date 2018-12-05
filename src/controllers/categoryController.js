const reshelper = require('../lib/resultHelper');
const repo = require("../repos/categoryRepo");

exports.listAsync = async function (req, res) {
    var data = await repo.listAsync();
    reshelper.sendOkResult(res, "", data, 1);
};

exports.getAsync = async function (req, res) {
    var id = req.params.id;
    if (!id) {
        reshelper.sendOtherResult(res, 400, "Id not found");
        return;
    }
    
    var data = await repo.getAsync(id);
    if (typeof (data) == "undefined")
        reshelper.sendOtherResult(res, 404, "Not found");
    else
        reshelper.sendOkResult(res, "", data, 1);
};