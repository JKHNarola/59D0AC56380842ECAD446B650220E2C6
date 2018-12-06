exports.addlogin = function (userid, token) {
    if (!global.logins) global.logins = [];
    var filtered = global.logins.filter(function (x) {
        return x.id == userid;
    });

    if (filtered && filtered.length == 1) {
        filtered[0].token = token;
        filtered[0].time = new Date()
    } else {
        global.logins.push({
            id: userid,
            token: token,
            time: new Date()
        });
    }
};

exports.removelogin = function (userid) {
    if (!global.logins) {
        global.logins = [];
        return;
    }

    var filtered = global.logins.filter(function (x) {
        return x.id == userid;
    });

    if (filtered && filtered.length == 1) {
        var i = global.logins.indexOf(filtered[0]);
        if (i > -1) global.logins.splice(i, 1);
    }
};

exports.isUserLoggedOut = function (userid) {
    if (!global.logins) {
        global.logins = [];
        return true;
    }

    var filtered = global.logins.filter(function (x) {
        return x.id == userid;
    });

    return !(filtered && filtered.length == 1);
};