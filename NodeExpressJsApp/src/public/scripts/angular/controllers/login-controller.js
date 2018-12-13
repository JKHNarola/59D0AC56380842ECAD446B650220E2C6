app.controller('loginCtrl', function ($window, $scope, login, appUtils, apiService, localstorage) {
    $scope.onInit = function () {
        login.setNavUi();
        var needlogin = appUtils.getQueryParameterByName("needlogin");
        if (needlogin && needlogin === "1")
            login.open(appUtils.getQueryParameterByName("redirecturl"));
    };

    $scope.openLogin = function () {
        login.open();
    };

    $scope.onLogout = function () {
        apiService.get("/api/logout").promise
            .then(function (r) {
                console.log(r);
                if (r.status === 1) {
                    localstorage.clear();
                    appUtils.redirect('/');
                }
            })
            .catch(function (e) {
                console.log(e);
            });
    };
});