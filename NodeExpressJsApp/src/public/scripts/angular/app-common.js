var app = angular.module('app', ['ngSanitize', 'ui.bootstrap', 'uiCropper', "ladda"]);

//#region factories
app.factory('appUtils', function () {
    var obj = {};

    obj.isChanged = function (changes, property) {
        return changes[property] && changes[property].currentValue && changes[property].currentValue !== changes[property].previousValue ? true : false;
    };

    return obj;
});

app.factory("login", function ($uibModal, localstorage, messagebox) {
    var obj = {};
    obj.open = function (redirectUrl) {
        var modalInstance = $uibModal.open({
            templateUrl: '/uitemplates/loginmodal.tmpl.html',
            animation: true,
            keyboard: true,
            backdrop: 'static',
            size: 'sm',
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
                        messagebox.showWarning("Warning", "Please enter Username and Password.");
                        return;
                    }
                    vm.isLoggingIn = true;
                    apiService.post(vm.loginApiUrl, vm.loginmodel).promise
                        .then(function (r) {
                            if (r.status === 1) {
                                localstorage.setItem("token", r.data.token);
                                localstorage.setItem("user", r.data.user);
                                getProfilePic().then(function (respic) {
                                    if (respic && respic.status === 1 && respic.data) {
                                        var u = localstorage.getItem("user");
                                        u.profilePic = arrayBufferToBase64Image(respic.data.data);
                                        localstorage.setItem("user", u);
                                    }

                                    if (redirectUrl)
                                        redirect(redirectUrl);
                                    else
                                        vm.closePopup(true);
                                });
                            }
                            else {
                                messagebox.showWarning("Warning", "Invalid Username or Password.");
                            }

                            vm.isLoggingIn = false;
                        })
                        .catch(function (e) {
                            console.log(e.data);
                            vm.isLoggingIn = false;
                        });
                };

                var getProfilePic = function () {
                    return apiService.get('/api/user/pic').promise;
                };

                vm.onInit();
            },
            windowClass: 'show transparent-modal',
            backdropClass: 'show'
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
            $('#userpic').attr('src', u.profilePic);
            $('#userfullname').html(u.fullname);

            $('#lnkcat').show();
        }
        else {
            $('#lnklogin').show();
            $('#lnkreg').show();
            $('#lnkuser').hide();
            $('#userpic').attr('src', '');
            $('#userfullname').html('');

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

app.factory("messagebox", function ($uibModal) {
    var open = function (config) {
        var modalInstance = $uibModal.open({
            templateUrl: '/uitemplates/messagebox.tmpl.html',
            animation: true,
            keyboard: true,
            backdrop: 'static',
            size: config.size ? config.size : "md",
            controller: function ($scope, $uibModalInstance) {
                var vm = $scope;
                vm.title = config.title;
                vm.text = config.text;
                vm.subText = config.subText;
                vm.icon = config.icon;
                vm.isOk = config.isOk ? config.isOk : false;
                vm.isCancel = config.isCancel ? config.isCancel : false;
                vm.isYes = config.isYes ? config.isYes : false;
                vm.isNo = config.isNo ? config.isNo : false;
                vm.isCustomContent = config.isCustomContent ? config.isCustomContent : false;
                vm.content = config.content;
                vm.showIcon = config.showIcon ? config.showIcon : true;

                vm.onInit = function () {
                };

                vm.closePopup = function (t) { $uibModalInstance.close(t); };

                vm.onInit();
            },
            windowClass: 'show',
            backdropClass: 'show'
        });
        modalInstance.result.then(function (res) {
            if (typeof res !== 'undefined') {
                switch (res) {
                    case "ok":
                        config.okCallback();
                        break;
                    case "cancel":
                        config.cancelCallback();
                        break;
                    case "yes":
                        config.yesCallback();
                        break;
                    case "no":
                        config.noCallback();
                        break;
                    default:
                        break;
                }
            }
        });
    };

    var obj = {};
    obj.showInfo = function (title, message, submessage, callback, size) {
        if (typeof callback === "undefined") callback = function () {
            return;
        };

        var config = {
            title: title,
            text: message,
            subText: submessage,
            icon: "info",
            size: size,
            isOk: true,
            okCallback: callback
        };
        open(config);
    };
    obj.showSuccess = function (title, message, submessage, callback, size) {
        if (typeof callback === "undefined") callback = function () {
            return;
        };

        var config = {
            title: title,
            text: message,
            subText: submessage,
            icon: "success",
            size: size,
            isOk: true,
            okCallback: callback
        };
        open(config);
    };
    obj.showError = function (title, message, submessage, callback, size) {
        if (typeof callback === "undefined") callback = function () {
            return;
        };

        var config = {
            title: title,
            text: message,
            subText: submessage,
            icon: "error",
            size: size,
            isOk: true,
            okCallback: callback
        };
        open(config);
    };
    obj.showWarning = function (title, message, submessage, callback, size) {
        if (typeof callback === "undefined") callback = function () {
            return;
        };

        var config = {
            title: title,
            text: message,
            subText: submessage,
            icon: "warning",
            size: size,
            isOk: true,
            okCallback: callback
        };
        open(config);
    };
    obj.showCustom = function (title, content, callback, size) {
        if (typeof callback === "undefined") callback = function () {
            return;
        };

        var config = {
            title: title,
            isOk: true,
            okCallback: callback,
            isCustomContent: true,
            content: content,
            size: size
        };
        open(config);
    };

    obj.confirm = function (title, message, submessage, okCallback, cancelCallback, size) {
        if (typeof okCallback === "undefined") throw new Error("okCallback not provided");
        if (typeof cancelCallback === "undefined") cancelCallback = function () { return; };

        var config = {
            title: title,
            text: message,
            subText: submessage,
            showIcon: false,
            isOk: true,
            isCancel: true,
            okCallback: okCallback,
            cancelCallback: cancelCallback,
            size: size
        };
        open(config);
    };
    obj.confirmYesNo = function (title, message, submessage, yesCallback, noCallback, size) {
        if (typeof yesCallback === "undefined") throw new Error("yesCallback is not provided!!");
        if (typeof noCallback === "undefined") throw new Error("noCallback is not provided!!");

        var config = {
            title: title,
            text: message,
            subText: submessage,
            showIcon: false,
            isYes: true,
            isNo: true,
            yesCallback: yesCallback,
            noCallback: noCallback,
            size: size
        };
        open(config);
    };
    obj.confirmCustom = function (title, content, okCallback, cancelCallback, size) {
        if (typeof okCallback === "undefined") throw new Error("okCallback not provided");
        if (typeof cancelCallback === "undefined") cancelCallback = function () { return; };

        var config = {
            title: title,
            isCustomContent: true,
            content: content,
            isOk: true,
            isCancel: true,
            okCallback: okCallback,
            cancelCallback: cancelCallback,
            size: size
        };
        open(config);
    };
    obj.confirmCustomYesNo = function (title, content, yesCallback, noCallback, size) {
        if (typeof yesCallback === "undefined") throw new Error("yesCallback is not provided!!");
        if (typeof noCallback === "undefined") throw new Error("noCallback is not provided!!");

        var config = {
            title: title,
            isCustomContent: true,
            content: content,
            isYes: true,
            isNo: true,
            yesCallback: yesCallback,
            noCallback: noCallback,
            size: size
        };
        open(config);
    };

    return obj;
});

app.factory("snackbar", function () {
    var show = function (config) {
        var maindiv = '<div id="snbarea" class="notification-area"></div> ';
        if (!document.getElementById("snbarea")) {
            var wrapper = document.createElement('div');
            //wrapper.classList = ['row'];
            wrapper.innerHTML = maindiv;
            document.body.appendChild(wrapper);
        }
        var dt = new Date();
        var snbid = "snb" + dt.getHours().toString() + dt.getMinutes().toString() + dt.getSeconds().toString() + dt.getMilliseconds().toString();

        var i = "";
        if (!config.icon) config.icon = "";
        switch (config.icon.toString().toLowerCase()) {
            case "i":
            case "info":
            case "information":
                i = "zmdi-info text-info";
                break;
            case "e":
            case "err":
            case "error":
            case "f":
            case "fail":
            case "failure":
            case "false":
                i = "zmdi-close-circle text-danger";
                break;
            case "s":
            case "success":
            case "t":
            case "true":
                i = "zmdi-check-circle text-success";
                break;
            case "w":
            case "warn":
            case "warning":
                i = "zmdi-alert-circle text-warning";
                break;
            default:
                i = "zmdi-info text-info";
                break;
        }

        var snb = '<table class="notification" cellspacing="10"><tr><td class="snb-icon"><i style="font-size: 40px;" class="zmdi ' + i + ' " aria-hidden="true"></i></td><td class="snb-txt"><span class="message">' + config.message + '</span></td>';
        if (config.isRetry && config.retryCallback)
            snb += '<td align="right" width="0"><div id="' + snbid + 'retry" class="btn btn-lnk text-warning"><strong>RETRY</strong></div></td>';
        if (config.isClose)
            snb += '<td align="right" width="0"><div id="' + snbid + 'close" class="btn btn-lnk text-info"><strong>CLOSE</strong></div></td>';
        snb += '</tr></table>';

        var d = document.createElement("div");
        d.id = snbid;
        d.innerHTML = snb;
        d.classList.add(['bounceInLeft']);
        document.getElementById("snbarea").appendChild(d);

        var close = function () {
            var f = document.getElementById(snbid);
            if (f) jQuery("#" + snbid).fadeOut("fast", null, function () { $(this).remove(); });
            if (config.retryCallback) config.retryCallback = function () { };
            if (config.closeCallback) config.closeCallback();
        };

        var closeAndRetry = function () {
            config.closeCallback = function () { };
            jQuery("#" + snbid).fadeOut("fast", null, function () { $(this).remove(); });
            if (config.retryCallback) config.retryCallback();
        };

        var cl = document.getElementById(snbid + "close");
        if (cl) cl.addEventListener("click", close);

        var r = document.getElementById(snbid + "retry");
        if (r) r.addEventListener("click", closeAndRetry);

        if (config.timeout) {
            setTimeout(close, config.timeout);
        }
    };

    var obj = {};
    obj.showInfo = function (message, timeout, displayClose, closeCallback, retryCallback) {
        var c = {
            message: message,
            icon: "info",
            isClose: displayClose,
            timeout: timeout,
            closeCallback: closeCallback,
            isRetry: retryCallback ? true : false,
            retryCallback: retryCallback
        };
        if (!timeout) c.isClose = true;
        show(c);
    };
    obj.showError = function (message, timeout, displayClose, closeCallback, retryCallback) {
        var c = {
            message: message,
            icon: "err",
            isClose: displayClose,
            timeout: timeout,
            closeCallback: closeCallback,
            isRetry: retryCallback ? true : false,
            retryCallback: retryCallback
        };
        if (!timeout) c.isClose = true;
        show(c);
    };
    obj.showWarning = function (message, timeout, displayClose, closeCallback, retryCallback) {
        var c = {
            message: message,
            icon: "warn",
            isClose: displayClose,
            timeout: timeout,
            closeCallback: closeCallback,
            isRetry: retryCallback ? true : false,
            retryCallback: retryCallback
        };
        if (!timeout) c.isClose = true;
        show(c);
    };
    obj.showSuccess = function (message, timeout, displayClose, closeCallback, retryCallback) {
        var c = {
            message: message,
            icon: "success",
            isClose: displayClose,
            timeout: timeout,
            closeCallback: closeCallback,
            isRetry: retryCallback ? true : false,
            retryCallback: retryCallback
        };
        if (!timeout) c.isClose = true;
        show(c);
    };
    return obj;
});
//#endregion factories

//#region services
app.service('apiService', function ($window, $http, $q, localstorage, messagebox, snackbar) {
    var prepareAuthHeaders = function () {
        return {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localstorage.getToken()
        };
    };

    var apiService = {};
    apiService.get = function (url, data, withoutauth) {
        var d = angular.copy(data);
        var p = "";
        if (!isNullEmptyUndefined(d))
            P = '?' + $.param(d);

        var canceller = $q.defer();
        var c = withoutauth ?
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: canceller.promise
            }
            :
            {
                headers: prepareAuthHeaders(),
                timeout: canceller.promise
            };
        return {
            promise: $http.get(url + p, c).then(onSuccess, onError),
            cancel: function (reason) {
                canceller.resolve(reason);
            }
        };
    };
    apiService.post = function (url, data, withoutauth) {
        var d = angular.copy(data);
        var p = null;
        if (!isNullEmptyUndefined(d))
            p = JSON.stringify(d);

        var canceller = $q.defer();
        var c = withoutauth ?
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: canceller.promise
            }
            :
            {
                headers: prepareAuthHeaders(),
                timeout: canceller.promise
            };
        return {
            promise: $http.post(url, p, c).then(onSuccess, onError),
            cancel: function (reason) {
                canceller.resolve(reason);
            }
        };
    };

    var onSuccess = function (result) {
        if (result && result.data)
            return angular.fromJson(result.data);
        return null;
    };
    var onError = function (result) {
        if (!result)
            return $q.reject(null);

        switch (result.status) {
            case 401:
                localstorage.removeItem("token");
                redirect('/?needlogin=1&redirecturl=' + encodeUrl($window.location.pathname));
                break;
            case 400:
                if (result.data && result.data.message)
                    snackbar.showError(result.data.message);
                else
                    return $q.reject(result);
                break;
            case 500:
                if (result && result.data && result.data.message)
                    messagebox.showError("Error occured", result.data.message, result.data.data ? result.data.data.split("\n").join("<br />&nbsp;&nbsp;&nbsp;&nbsp;") : "", null, 'lg');
                else
                    messagebox.showError("Error occured", "Something went wrong!!", "Some error occured while processing your request. Please try again or contact admin.");
                break;
            default:
                return $q.reject(result);
        }
        return $q.resolve({ status: -9999, data: null, message: null });
    };

    return apiService;
});
//#endregion

//#region filters
app.filter('trusted', ['$sce', function ($sce) {
    return function (text) {
        return $sce.trustAsHtml(text);
    };
}]);
//#endregion

//#region directives
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

app.directive("compareTo", function () {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function (scope, element, attributes, ngModel) {

            ngModel.$validators.compareTo = function (modelValue) {
                return modelValue === scope.otherModelValue;
            };

            scope.$watch("otherModelValue", function () {
                ngModel.$validate();
            });
        }
    };
});
//#endregion