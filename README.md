A minimal plugin to [ngAnnotate](https://github.com/olov/ng-annotate) for detecting Angular namespace collisions.

i.e. if you have the following in one area of your code:

```
angular.module('encore.cloud')
    .controller('MyFirstCtrl')
```

and this is another area:

```
angular.module('encore.ticketing')
    .factory('MyFirstCtrl')
```

an error will be raised.

To use this module with `ngAnnotate`, import it with `require` and pass to `ngAnnotate` with the `plugin` option, i.e.

```
const ngAnnotate = require("ng-annotate");
const nameCollision = require('../src/nameCollisionPlugin.js');

ngAnnotate(String(fs.readFileSync(filename)), {
    plugin: nameCollision
});
```

This will also work fine as a gulp task. An example of this is:

```
gulp.task('compile:detectCollision', function () {
    var scriptSourcePaths = [
        srcPath + '/src/**/*.js',
        srcPath + '/src/app.js',
        '!' + srcPath + '/src/**/*.spec.js',
    ];
    nameCollision.reset();
    return gulp.src(scriptSourcePaths)
        .pipe(plugins.plumber(function (err) {
            plugins.util.log(err.message);
            process.exit(1);
        }))
        .pipe(plugins.ngAnnotate({
            plugin: nameCollision
        }));
});//compile:detectCollision
```

Notice that when used in a gulp task, we call `nameCollision.reset()`. This is to account for something like `gulp server`, which usually keeps running and reruns all the tasks whenever your source code changes. In that situation, gulp does _not_ reload the plugins, so the same instance of `nameCollision` is being used on every run. We want to make sure that the names discovered on the previous run are all cleared out, hence calling `nameCollision.reset()`
