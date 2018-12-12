app.controller('categoriesCtrl', function ($scope, apiService) {
    $scope.activePage = 'cat';
    $scope.onInit = function () {
        $scope.onGet();
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