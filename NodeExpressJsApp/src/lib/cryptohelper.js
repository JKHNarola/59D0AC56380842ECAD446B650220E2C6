var crypto = require('crypto');

exports.encrypt = function (plainText) {
    var cipher = crypto.createCipher('aes-256-ctr', global.securityKey);
    var crypted = cipher.update(plainText, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
};

exports.decrypt = function (cipherText) {
    var decipher = crypto.createDecipher('aes-256-ctr', global.securityKey);
    var dec = decipher.update(cipherText, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
};
