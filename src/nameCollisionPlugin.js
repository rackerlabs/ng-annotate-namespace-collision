"use strict";
const _ = require('lodash');
const chainedRegular = 4;

const reserved = [
    'provider',
    'value',
    'constant',
    'bootstrap',
    'config',
    'factory',
    'directive',
    'filter',
    'run',
    'controller',
    'service',
    'animation',
    'invoke',
    'store',
    'decorator',
    'component',
];

var ctx;
var names = {};

// Copied from ng-annotate-main.js
var isReDef = function (node, ctx) {
    return ctx.re.test(ctx.srcForRange(node.range));
};


// copied from ng-annotate-main.js
var isLongDef = function (node) {
    return node.callee &&
        node.callee.object && node.callee.object.name === 'angular' &&
        node.callee.property && node.callee.property.name === 'module';
};



module.exports = {
    init: function(_ctx) {
        // ctx contains a bunch of helpers and data
        // stash it away so you can use it inside match
        ctx = _ctx;

    },
    match: function(node) {
        if (node.type === 'Literal') {
            // A 'Literal' is some string, like "AccountContactsController", but also _every_ other string in
            // our code
            
            if (node.$parent.type === 'CallExpression') {
                // This means that our node is part of a function/method call

                var callee = node.$parent.callee;
                var obj = callee.object; // identifier or expression
                var method = callee.property; // identifier
                if (callee.type === 'MemberExpression') {
                    // This means the CallExpression above is part of a method call, i.e. the callee is a member
                    // of some object (ex. foo.bar('baz') would match, but bar('baz') would not)

                    // Is the name of the method being called one of the special Angular methods? It has to both have
                    // the same name as an Angular method, and have `angular.module(...)` at the
                    // root of its object chain
                    var hasAngularModuleRoot = (obj.$chained === chainedRegular || isReDef(obj, ctx) || isLongDef(obj));

                    // Is the method being called one that we care about?
                    var methodCheck = _.contains(reserved, method.name);

                    if (!(hasAngularModuleRoot && methodCheck)) {
                        return false;
                    }

                    for(var n = 0; n < 42; n++) {
                        // Go up through the node's call tree to discover the name of the Angular module
                        // that this belongs to, i.e. the XYZ in angular.module('XYZ')
                        // The proper way to do this would be `while (!isLongDep(obj)) { ... }`,
                        // but we'll arbitrarily max out at 42 to ensure we don't hit some infinite
                        // loop corner case I didn't think about
                        if (!obj.callee || !obj.callee.object) {
                            /*
                             * Something funny happened, and we're not able to backtrack to
                             * find the angular.module() that our node lives in.
                             * Known cases of this include having an object with a `.value()` method
                             * on it. The object won't be part of an angular.module() chain, but we'll
                             * still get down this far because the hasAngularModuleRoot check isn't 
                             * great (I blame the `isReDef()` function)
                             */
                            return;
                        }
                        if (isLongDef(obj)) {
                            break;
                        }
                        obj = obj.callee.object;
                    }

                    // obj is the "module" in "angular.module(...)", and `arguments[0].value` is the first
                    // parameter passed to `module()`
                    var module = obj.arguments[0].value;

                    // The original literal, "AccountContactsController"
                    var name = node.value;

                    if (_.has(names, name)) {
                        throw new Error('DUPLICATE DETECTED - ' +
                                        name +
                                        '` found in modules: `' +
                                        names[name].module +
                                        '` as a `' +
                                        names[name].method +
                                        '` and `' +
                                        module +
                                        '` as a `' +
                                        method.name + '`');
                    } else {
                        names[node.value] = {
                            module: module,
                            method: method.name
                        };
                    }
                }
            }
        }

    },

    /**
     * This is not part of the ng-annotate API. We use it explicitly to cleanly reset the
     * state of the plugin between test runs
     */
    reset: function () {
        names = {};
    }
};
