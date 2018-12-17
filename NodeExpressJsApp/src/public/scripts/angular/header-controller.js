app.controller('headerCtrl', function ($scope, $window, login, apiService, localstorage) {
    $scope.activePage = '';
    $scope.onInit = function () {
        login.setNavUi();
        var needlogin = getQueryParameterByName("needlogin");
        if (needlogin && needlogin === "1") {
            login.open(getQueryParameterByName("redirecturl"));
            removeQueryFromWindowUrl();
        }

        activateCurrPage();
    };

    var activateCurrPage = function () {
        var x = $window.location.pathname ? $window.location.pathname.toString() : "";
        if (x.startsWith("/categories")) {
            $scope.activePage = "categories";
        }
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
                    redirect('/?loggedout=1');
                }
            })
            .catch(function (e) {
                console.log(e);
            });
    };
});
