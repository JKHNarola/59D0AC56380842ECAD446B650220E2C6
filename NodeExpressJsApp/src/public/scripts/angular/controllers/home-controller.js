app.controller('homeCtrl', function ($scope, snackbar) {
    $scope.onInit = function () {
    };

    $scope.onShowError = function () {
        snackbar.showError("Something went wrong", 3000);
    };
    $scope.onShowInfo = function () {
        snackbar.showInfo("Some information", 3000);
    };
    $scope.onShowWarning = function () {
        snackbar.showWarning("Some warning!!", 2000);
    };
    $scope.onShowSuccess = function () {
        snackbar.showSuccess("Succedded!!", 2000);
    };
});