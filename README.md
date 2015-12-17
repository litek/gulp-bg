# gulp-bg

Execute command to run in the background.
Calling the returned function restarts the process if it's already running.

## Usage
Run a process in the background, and restart on changes.

```javascript
var bg = require("gulp-bg");

let bgtask;
gulp.task("server", bgtask = bg("node", "--harmony", "server.js"));

const exitCallback = (proc) => { if (proc.errorcode != 0) { process.exit(proc.errorcode); } };

gulp.task("stop", () => {
    bgtask.setCallback(exitCallback);
    bgtask.stop();
  }
});

gulp.task("default", ["server"], function() {
  gulp.watch(["server.js"], ["server"]);
});
```

## License
MIT
