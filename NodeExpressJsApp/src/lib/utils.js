var qs = require('querystring');

exports.encode = function (input) {
    return qs.escape(input);
};