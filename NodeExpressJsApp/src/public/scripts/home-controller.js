app.controller('homeCtrl', function ($scope, apiService) {
    $scope.onInit = function () {
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