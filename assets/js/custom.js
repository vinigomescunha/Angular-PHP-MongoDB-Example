var app = angular.module('Main', ['ngRoute']);
/* config routes */
app.config(function($routeProvider) {
    $routeProvider
        .when('/index', {
            templateUrl: 'view/home.html',
            controller: 'crudControler'
        })
        .when('/page/:name*', {
            templateUrl: function(url) {
                return 'view/static/' + url.name + '.html';
            },
            controller: 'AboutController'
        })
        .otherwise({
            redirectTo: '/index'
        });;
});
/* 404 not found */
app.factory('template404', function($injector) {
    return {
        responseError: function(response) {
            if (response.status === 404 && /\.html$/.test(response.config.url)) {
                response.config.url = 'view/static/404.html';
                return $injector.get('$http')(response.config);
            }
            return $q.reject(response);
        }
    };
});
app.config(function($httpProvider) {
    $httpProvider.interceptors.push('template404');
});
/* switch modal only js, modal function with id of modal and status of display */
var switchModal = function(id, d) {
        var m = document.getElementById(id);
        if (d === 'none') {
            m.className = m.className.replace(" in", "");
            m.style.display = "none";
        } else {
            m.className += " in";
            m.style.display = d;
        }
    },
    serialize = function(o) { /* serialize object from form to encode in string to ajax POST  */
        var s = [];
        for (var p in o)
            if (o.hasOwnProperty(p)) s.push(encodeURIComponent(p) + "=" + encodeURIComponent(o[p]));
        return s.join("&");
    };
app.controller('crudControler', function($scope, $http, $location) {
    $scope.informations = [], /* receive result */
        $scope.form = {}, /* receive data from form and insert into variable */
        $scope.page = 0; /* get the info about pagination */
    $scope.pagination = 0; /* number of pages */
    /* create a notification : need css custom */
    $scope.notify = function(mesg) {
        var content = document.getElementById('notification')
            .getElementsByClassName('content')[0];
        content.innerHTML = mesg;
        switchModal('notification', 'table');
        setTimeout(function() {
            switchModal('notification', 'none');
            content.innerHTML = "";
        }, 3000);
    };
    /* get commom ajax */
    $scope.ajax = function(gUrl, params, callback) {
        $http({
            method: 'POST',
            url: "request.php?" + gUrl,
            data: serialize(params),
            async: "isAsync",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        }).success(function(data) {
            callback(data);
        });
    };
    /* data population from ajax */
    $scope.populate = function(data) {
        $scope.informations = [];
        data = angular.fromJson(data);
        for (var i in data.result) $scope.informations.push(data.result[i]);
        var num = data.total > data.limit ? Math.ceil(data.total / data.limit) : 0;
        $scope.pagination = new Array(num);
    };
    /* populate form modal to update */
    $scope.populateform = function(data) {
        data = angular.fromJson(data);
        var r = data.result,
            key = Object.keys(r);
        $scope._id = key;
        $scope.name = r[key]['name'];
        $scope.email = r[key]['email'];
        $scope.address = r[key]['address'];
        $scope.formCall = "update";
    };
    /* retrieve ajax call with params, urls - if need params get to url and callback if not populate table */
    $scope.retrieve = function(o) {
        var url = o && o.url ? o.url : "a=find",
            params = o && o.params ? o.params : {},
            callback = o && o.callback ? o.callback : $scope.populate;
        url += "&page=" + $scope.page;
        $scope.ajax(url, params, function(data) {
            callback(data)
        });
    };
    /* delete function */
    $scope.delete = function(obj) {
        var id = $scope.ajax("a=delete&id=" + obj._id.$id, {}, function(data) {
            $scope.form = [];
            $scope.notify("Record deleted!");
            $scope.retrieve();
        });
    };
    /* create function */
    $scope.create = function() {
        var id = $scope.ajax("a=insert", $scope.form, function(data) {
            $scope.retrieve();
            switchModal("modalNewUser", 'none');
            $scope.notify("New record!");
        });
    };
    /* update form */
    $scope.update = function() {
        var id = $scope.ajax("a=update&id=" + $scope._id, $scope.form, function(data) {
            $scope.retrieve();
            switchModal("modalNewUser", 'none');
            $scope.notify("Updated!");
        });
    };
    /* event call data to populate update modal form */
    $scope.dispatch = function(event) {
        var e = event.target;
        switchModal(e.getAttribute('data-target-id'), 'block');
        $scope.retrieve({
            params: {
                _id: e.getAttribute('data-id')
            },
            callback: $scope.populateform
        });
    };
    /* retrieve data if pagination is clicked */
    $scope.switchPage = function(i) {
        $scope.page = i;
        $scope.retrieve();
    };
    /* submit function form - switch between update and create form */
    $scope.submit = function(event) {
        var form = $scope.formCall;
        $scope.form['name'] = $scope.name ? this.name : '';
        $scope.name = '';
        $scope.form['email'] = $scope.email ? this.email : '';
        $scope.email = '';
        $scope.form['address'] = $scope.address ? this.address : '';
        $scope.address = '';
        if (form == 'update') {
            $scope.update();
            $scope._id = "";
            $scope.formCall = "create";
        } else {
            $scope.create();
        }
    };
    $scope.retrieve();
});
app.controller('AboutController', function($scope) {
    $scope.title = "About";
    $scope.name = "Vinicius Gomes.";
    $scope.email = " vinigomescunha at gmail.com ";
    $scope.git = " github.com/vinigomescunha ";
});
