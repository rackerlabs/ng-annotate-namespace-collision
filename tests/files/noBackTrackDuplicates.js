angular.module('foo')
.factory('bar', function ($provide) {
    $provide.value('a', function () {});
    $provide.value('a', function () {});
});
