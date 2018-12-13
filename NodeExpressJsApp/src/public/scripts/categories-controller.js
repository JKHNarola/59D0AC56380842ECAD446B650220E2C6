app.controller('categoriesCtrl', function ($scope, apiService, appUtils) {
    $scope.activePage = 'cat';
    $scope.data = [];
    $scope.onInit = function () {
        $scope.onGet();
    };

    $scope.onGet = function () {
        apiService.get("/api/categories").promise
            .then(function (r) {
                if (r.status === 1) {
                    r.data.forEach(function (x) {
                        x.picture = appUtils.arrayBufferToBase64Image(x.picture.data);
                    });
                    $scope.data = r.data;
                }
            })
            .catch(function (e) {
                console.log(e);
            });
    };
});
