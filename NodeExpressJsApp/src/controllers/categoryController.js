var utils = require("../lib/utils");
const reshelper = require('../lib/resultHelper');
const repo = require("../repos/categoryRepo");

exports.listAsync = async function (req, res, next) {
    try {
        var data = await repo.listAsync();
        reshelper.sendOkResult(res, "", data, 1);
    } catch (e) {
        next(e);
    }
};

exports.getAsync = async function (req, res, next) {
    try {
        utils.copyParam();

        var id = req.params.id;
        if (!id) {
            reshelper.sendOtherResult(res, 400, "Id not found");
            return;
        }

        var data = await repo.getAsync(id);
        if (typeof data === "undefined")
            reshelper.sendOtherResult(res, 404, "Not found");
        else
            reshelper.sendOkResult(res, "", data, 1);
    } catch (e) {
        next(e);
    }
};