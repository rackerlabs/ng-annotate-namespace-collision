"use strict";

const fs = require('fs');
const chai = require('chai');
const expect = chai.expect;

const ngAnnotate = require("ng-annotate");
const nameCollision = require('../src/nameCollisionPlugin.js');

function slurp(filename) {
    return String(fs.readFileSync(filename));
}

var run = function (str) {
    return function () {
        ngAnnotate(str, {
            add: true,
            plugin: nameCollision
        });
        throw new Error('No error');
    };
};

var runFile = function (filename) {
    return function () {
        ngAnnotate(slurp(filename), {
            add: true,
            plugin: nameCollision
        });
    };
};


describe('one module', function () {

    afterEach(function () {
        nameCollision.reset();
    });

    it('should throw an error when a duplicate is detected', function () {
        var t = 'angular.module("foo").controller("bar", function () {}).factory("bar", function () {})';
        expect(run(t)).to.throw(/DUPLICATE DETECTED - bar/);
    });

    it('should throw an error', function () {
        var t = 'angular.module("f").directive("a", function () {}).controller("a", function () {})';
        expect(run(t)).to.throw(/DUPLICATE DETECTED - a/);
    });

    it('should not throw an error when methods are not part of angular', function () {
        var t = '_.chain().filter("a").controller("a")';
        expect(run(t)).to.throw(/No error/);
    });

    it('should catch constants and values', function () {
        var t = 'angular.module("a").constant("b").value("b")';
        expect(run(t)).to.throw(/DUPLICATE DETECTED - b/);
    });

    it('should catch services and decorators', function () {
        var t = 'angular.module("a").service("b", function () {}).decorator("b", "efg")';
        expect(run(t)).to.throw(/DUPLICATE DETECTED - b/);
    });
    
    it('should catch directives and controllers', function () {
        var t = 'angular.module("a").directive("b", function () {}).controller("b", "efg")';
        expect(run(t)).to.throw(/DUPLICATE DETECTED - b/);
    });

});

describe('multiple modules', function () {
    it('should throw an error when a duplicate is across multiple modules', function () {
        expect(runFile('tests/files/multipleModules.js')).to.throw(/DUPLICATE DETECTED - a/);
    });
});
