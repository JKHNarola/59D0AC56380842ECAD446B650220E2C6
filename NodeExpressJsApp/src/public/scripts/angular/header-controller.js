app.controller('headerCtrl', function ($scope, login, apiService, localstorage) {
    $scope.onInit = function () {
        login.setNavUi();
        var needlogin = getQueryParameterByName("needlogin");
        if (needlogin && needlogin === "1")
            login.open(getQueryParameterByName("redirecturl"));
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
                    redirect('/');
                }
            })
            .catch(function (e) {
                console.log(e);
            });
    };
});
