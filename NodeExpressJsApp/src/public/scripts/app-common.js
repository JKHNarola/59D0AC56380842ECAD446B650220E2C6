var app = angular.module('app', ['ngAnimate', 'ngSanitize', 'ui.bootstrap']);

app.constant('appResources', function () {
    var obj = {};
    return obj;
});

app.factory("appConsts", function (appResources) {
    return appResources();
});

app.factory('appUtils', function () {
    var obj = {};

    obj.is$onChanges = function (changes, property) {
        return changes[property] && changes[property].currentValue && changes[property].currentValue !== changes[property].previousValue;
    };

    obj.isNullEmpty = function (v) {
        return (v ? v.toString().trim() : "").length === 0;
    };

    obj.getQueryParameterByName = function (name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }
    return obj;
});

app.directive('numberOnly', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    var transformedInput = text.replace(/[^0-9]/g, '');

                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return undefined;
            }
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});

app.directive('capitalizeFirst', function ($parse) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attr, ngModel) {
            var capitalize = function (inputValue) {
                if (inputValue) {
                    var capitalized = inputValue.charAt(0).toUpperCase() + inputValue.substring(1);

                    if (capitalized !== inputValue) {
                        ngModel.$setViewValue(capitalized);
                        ngModel.$render();
                    }
                    return capitalized;
                }
            };

            var model = $parse(attr.ngModel);
            ngModel.$parsers.push(capitalize);
            capitalize(model(scope));
        }
    };
});

app.directive('capitalizeAll', function ($parse) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attr, ngModel) {
            var capitalize = function (inputValue) {
                if (inputValue) {
                    var capitalized = inputValue.replace(/^(.)|\s(.)/g, function (v) {
                        return v.toUpperCase();
                    });

                    if (capitalized !== inputValue) {
                        ngModel.$setViewValue(capitalized);
                        ngModel.$render();
                    }
                    return capitalized;
                }
            };

            //Push process function to model
            //Apply it right now
            var model = $parse(attr.ngModel);
            ngModel.$parsers.push(capitalize);
            capitalize(model(scope));
        }
    };
});

app.directive('restrictInput', function () {

    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            var ele = element[0];
            var regex = RegExp(attrs.restrictInput);
            var value = ele.value;
            ele.addEventListener('keyup', function (e) {
                if (regex.test(ele.value) || ele.value === '') value = ele.value;
                else ele.value = value;
            });
        }
    };
});

app.directive('convertToNumber', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function (val) {
                return val ? parseInt(val, 10) : null;
            });
            ngModel.$formatters.push(function (val) {
                return val ? '' + val : null;
            });
        }
    };
});

app.filter('propsFilter', function () {
    return function (items, props) {
        var out = [];

        if (angular.isArray(items)) {
            var keys = Object.keys(props);

            items.forEach(function (item) {
                var itemMatches = false;
                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop];
                    switch (typeof item[prop]) {
                        case 'string':
                            if (item[prop].toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) itemMatches = true;
                            break;
                        case 'number':
                            if (item[prop] === text) itemMatches = true;
                            break;
                        default:
                            if (item[prop] === text) itemMatches = true;
                            break;
                    }
                    if (itemMatches) break;
                }
                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }
        return out;
    };
});

app.service('apiService', function ($window, $http, $q, login, localstorage) {
    var apiService = {};

    var prepareAuthHeaders = function () {
        return {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localstorage.getToken()
        };
    };

    apiService.post = function (url, data) {
        var d = angular.copy(data);
        var p = null;
        if (typeof d !== 'undefined' && d !== null)
            p = JSON.stringify(d);

        var canceller = $q.defer();
        var tconfig = {
            headers: prepareAuthHeaders(),
            timeout: canceller.promise
        };
        var promise = $http.post(url, p, tconfig).then(success, error);
        return {
            promise: promise,
            cancel: function (reason) {
                canceller.resolve(reason);
            }
        };
    };

    apiService.get = function (url, data) {
        var d = angular.copy(data);
        var p = "";
        if (typeof d !== 'undefined' && d !== null)
            P = '?' + $.param(d);

        var canceller = $q.defer();
        var tconfig = {
            headers: prepareAuthHeaders(),
            timeout: canceller.promise
        };
        var promise = $http.get(url + p, tconfig).then(success, error);
        return {
            promise: promise,
            cancel: function (reason) {
                canceller.resolve(reason);
            }
        };
    };

    apiService.getOnly = function (url) {
        return $http.get(url, {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(success, error);
    };

    var success = function (result) {
        if (result && result.data)
            return angular.fromJson(result.data);
        return null;
    };

    var error = function (result) {
        if (result && result.status === 401) {
            localstorage.removeItem("token");
            $window.location.href = '/?needlogin=1';
            return $q.resolve(null);
        } else {
            if (result && result.data && result.data.message) window.alert(result.data.message);
            else window.alert("Something went wrong!!");
            return $q.reject(result);
        }
    };

    return apiService;
});

app.factory("login", function ($uibModal, localstorage) {
    var obj = {};
    obj.open = function () {
        var modalInstance = $uibModal.open({
            templateUrl: '/uitemplates/loginmodal.tmpl.html',
            keyboard: true,
            backdrop: 'static',
            controller: function ($scope, apiService, $uibModalInstance, localstorage) {
                var vm = $scope;

                vm.loginApiUrl = "/api/authenticate";
                vm.pwdInputType = 'password';
                vm.isLoggingIn = false;
                vm.loginmodel = {
                    username: "",
                    password: ""
                };

                vm.hideShowPassword = function () {
                    if (vm.pwdInputType === 'password')
                        vm.pwdInputType = 'text';
                    else
                        vm.pwdInputType = 'password';
                };

                vm.onInit = function () {
                };

                vm.closePopup = function (isLoggedIn) { $uibModalInstance.close(isLoggedIn); };

                vm.onLogin = function () {
                    if (!vm.loginmodel.username || !vm.loginmodel.password) {
                        window.alert("Please enter Username and Password.");
                        return;
                    }
                    vm.isLoggingIn = true;
                    apiService.post(vm.loginApiUrl, vm.loginmodel).promise
                        .then(function (r) {
                            if (r.status === 1) {
                                localstorage.setItem("token", r.data.token);
                                localstorage.setItem("user", r.data.user);
                                vm.closePopup(true);
                            }
                            else {
                                window.alert("Invalid username or password!!");
                            }

                            vm.isLoggingIn = false;
                        })
                        .catch(function (e) {
                            console.log(e.data);
                            vm.isLoggingIn = false;
                        });
                };

                vm.onInit();
            }
        });
        modalInstance.result.then(function (res) {
            if (res) {
                setNavUi();
            }
        });
    };
    var setNavUi = obj.setNavUi = function () {
        if (localstorage.getToken()) {
            var u = localstorage.getItem("user");
            $('#lnklogin').hide();
            $('#lnkreg').hide();
            $('#lnkuser').show();
            $('#lnkuserdrop').html(u.fullname);

            $('#lnkcat').show();
        }
        else {
            $('#lnklogin').show();
            $('#lnkreg').show();
            $('#lnkuser').hide();
            $('#lnkuserdrop').html("");

            $('#lnkcat').hide();
        }
    };
    return obj;
});

app.factory("localstorage", function ($window) {
    var obj = {};
    obj.setItem = function (key, value) {
        if (typeof value === 'object' && value !== null)
            value = JSON.stringify(value);
        $window.localStorage[key] = value;
    };
    obj.addItem = function (key, value) {
        obj.setItem(key, value);
    };
    obj.removeItem = function (key) {
        $window.localStorage.removeItem(key);
    };
    obj.getItem = function (key) {
        var val = $window.localStorage[key];
        try {
            return JSON.parse(val);
        }
        catch (e) {
            return val;
        }
    };
    obj.clear = function () {
        return $window.localStorage.clear();
    };
    obj.getToken = function () {
        var x = $window.localStorage["token"];
        if (!x) return "";
        return x;
    };
    return obj;
});
