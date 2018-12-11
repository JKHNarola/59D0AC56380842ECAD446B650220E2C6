app.controller('mainCtrl', function ($scope, apiService, login) {
    $scope.onInit = function () {
        login.setUi();
    };

    $scope.openLogin = function () {
        login.open();
    };

    $scope.onGet = function () {
        apiService.get("/api/categories").promise
            .then(function (r) {
                console.log(r);
            })
            .catch(function (e) {
                console.log(e);
            });
    };
});