var app = angular.module('bsui', ['ngRoute']);

app.config(function($routeProvider) {
    $routeProvider
        .when('/hosts', {
          templateUrl : 'partial/host-list',
          controller  : 'HostListCtrl'
        })
        .when('/hosts/add', {
          templateUrl : 'partial/host-add',
          controller  : 'HostAddCtrl'
        })
        .when('/cdn', {
          templateUrl : 'partial/cdn-list',
          controller  : 'CDNListCtrl'
        })
        .when('/cdn/add', {
          templateUrl : 'partial/cdn-add',
          controller  : 'CDNAddCtrl'
        })
});


function MainCtrl($scope) {
    $scope.context = {};

    $scope.initSemanticElements = function() {
        $('.ui.checkbox').checkbox();
    }

    $scope.initSemanticElements();
}

function HostListCtrl($scope, $http) {
    $scope.context.page = 'hosts';

    $scope.params = {
        query: ''
    };

    $scope.hosts = []

    $scope.loadHosts = function() {
        $http.get('/api/hosts', {
            params: $scope.params
        }).then(function(response) {
            $scope.hosts = response.data.data;
        }, function(response) {
            console.log(response);
        })
    }

    $scope.$watch('params.query', function(val) {
        $scope.loadHosts();
    });
}

function HostAddCtrl($scope, $http) {
    $scope.context.page = 'hosts';
    $scope.initSemanticElements();

    $scope.form = {};
    $scope.errors = [];
    $scope.fieldErrors = [];

    $scope.message = null;

    $scope.submitForm = function () {
        $http.post('/api/hosts', $scope.form).then(function(result) {
            $scope.form = {};
            $scope.errors = [];
            $scope.fieldErrors = {};

            $scope.message = {
                class: 'success',
                text: 'Host successfully created'
            }
        }, function(response) {
            var errors = response.data.errors;
            $scope.errors = errors;
            $scope.fieldErrors = _.groupBy(errors, 'source');
        });
    }
}

function CDNListCtrl($scope) {
    $scope.context.page = 'cdn';

    $scope.cdns = [
        {
            name: 'Akamai CDN',
            id: 'akamai',
            edge_servers: [
                '1.2.3.4',
                '22.123.2.87'
            ],
            fronts: [
                'www.airbnb.com'
            ],
            sni: true
        }
    ]
}

function CDNAddCtrl($scope, $http) {
    $scope.context.page = 'cdn';
    $scope.initSemanticElements();

    function resetForm() {
        $scope.form = {
            edges: [''],
            sni: "original"
        }
        $scope.errors = [];
        $scope.fieldErrors = {};
    }

    resetForm();


    $scope.$watchCollection('form.edges', function(val, oldVal) {
        if (val[val.length-1]) {
            $scope.form.edges.push('');
        }
    });

    $scope.foo = function () {
        $scope.form.edges.push($scope.pendingEdge);
        $scope.pendingEdge = '';
    }

    $scope.submitForm = function () {
        $http.post('/api/cdns', $scope.form).then(function(result) {
            resetForm();
            
            $scope.message = {
                class: 'success',
                text: 'CDN successfully created'
            }
        }, function(response) {
            var errors = response.data.errors;
            $scope.errors = errors;
            $scope.fieldErrors = _.groupBy(errors, 'source');
        });
    }
}

app.controller('MainCtrl', ['$scope', MainCtrl]);
app.controller('HostListCtrl', ['$scope', '$http', HostListCtrl]);
app.controller('HostAddCtrl', ['$scope', '$http', HostAddCtrl]);
app.controller('CDNListCtrl', ['$scope', CDNListCtrl]);
app.controller('CDNAddCtrl', ['$scope', '$http', CDNAddCtrl]);
