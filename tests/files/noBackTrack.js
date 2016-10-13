angular.module('foo')
.factory('bar', function () {
    var x = {
        value: function () {}
    };

    x.value('a', function () {});
});
