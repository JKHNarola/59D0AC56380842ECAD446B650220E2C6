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
                        x.picture = arrayBufferToBase64(x.picture.data);

                    });
                    $scope.data = r.data;
                }
            })
            .catch(function (e) {
                console.log(e);
            });
    };

    var arrayBufferToBase64 = function (buffer) {
        var binary = '';
        var bytes = new Uint16Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };
});
