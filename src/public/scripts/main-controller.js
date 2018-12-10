app.controller('mainCtrl', function ($scope, appConsts, apiService) {
    $scope.c = appConsts;

    var onGet = function () {
        apiService.get("/api/categories").promise
            .then(function (r) {
                console.log(r);
            })
            .catch(function (e) {
                console.log(e);
            });
    }

    onGet();
});