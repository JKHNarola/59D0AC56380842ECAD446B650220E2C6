var token = "";

var app = angular.module('app', []);
app.constant('appResources', function () {
    var obj = {};
    return obj;
});

app.factory("appConsts", function (appResources) {
    return appResources();
});

app.factory('appUtils', function (appConst) {
    var obj = {};

    obj.is$onChanges = function (changes, property) {
        return changes[property] && changes[property].currentValue && changes[property].currentValue != changes[property].previousValue;
    }

    obj.isNullEmpty = function (v) {
        return (v ? v.toString().trim() : "").length == 0;
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

                    //Capitalize all words (after space)
                    //var capitalized = inputValue.replace(/^(.)|\s(.)/g, function(v) { return v.toUpperCase(); });

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
                if (regex.test(ele.value) || ele.value == '') value = ele.value;
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

app.directive('compareTo', function () {
    return {
        require: 'ngModel',
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function (scope, element, attrs, ngModel) {
            ngModel.$validators.compareTo = function (modelValue) {
                return modelValue == scope.otherModelValue;
            };

            scope.$watch("otherModelValue", function () {
                ngModel.$validate();
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
                    switch (typeof (item[prop])) {
                        case 'string':
                            if (item[prop].toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) itemMatches = true;
                            break;
                        case 'number':
                            if (item[prop] == text) itemMatches = true;
                        default:
                            if (item[prop] == text) itemMatches = true;
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

app.service('apiService', ['$http', '$q', 'appConsts', function ($http, $q, appConsts) {
    var apiService = {};
    var config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    };

    apiService.post = function (url, data) {
        var input = angular.copy(data);
        if (input != null)
            input = JSON.stringify(input);

        var canceller = $q.defer();
        var tconfig = {
            headers: config.headers,
            timeout: canceller.promise
        };
        var promise = $http.post(url, data, tconfig).then(success, error);
        return {
            promise: promise,
            cancel: function (reason) {
                canceller.resolve(reason);
            }
        };
    }

    apiService.get = function (url, data) {
        var input = angular.copy(data);
        if (input != null) {
            input = JSON.stringify(input);
        }
        var canceller = $q.defer();
        var tconfig = {
            headers: config.headers,
            timeout: canceller.promise
        };
        var promise = $http.get(url, data, tconfig).then(success, error);
        return {
            promise: promise,
            cancel: function (reason) {
                canceller.resolve(reason);
            }
        };
    }

    apiService.getOnly = function (url) {
        return $http.get(url, {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(success, error);
    };

    var success = function (result) {
        if (result != null && result.data != null && result.data.d != null) {
            var x = result.data.d;
            return angular.fromJson(result.data);
        } else null;
    };

    var error = function (result) {
        if (result.status == 401) {
            //TODO: Handle unauthorized
            // window.location.href = "/relogin.aspx";
        } else {
            if (result.data && result.data.message) window.alert(result.data.message);
            else window.alert("Something went wrong!!");
        }
        return $q.reject(result);
    };

    return apiService;

}]);

console.log(app);