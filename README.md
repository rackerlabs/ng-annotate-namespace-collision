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
