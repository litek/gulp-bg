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

## Ability to send options to spawn
The final arguement should be an the spawn options object: 
```
{
  cwd: undefined,
  env: process.env
}
```

(https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)

```javaScript
gulp.task("server", bgtask = bg("node", "--harmony", "server.js", {env: 'development'}));
```

## License
MIT
