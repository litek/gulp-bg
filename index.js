"use strict";
var spawn = require("child_process").spawn,
    colors = require("chalk");

var Child = function(cmd, args, opts) {
  this.cmd = cmd;
  this.args = args;
  this.opts = opts || {};
  this.errorcode = 0;

  process.on("exit", function() {
    if (!this.running) return;
    this.proc.kill("SIGTERM");
  }.bind(this));

  process.on("SIGTERM", function() {
    process.exit();
  });
};

Child.prototype.start = function() {
  if (this.running) return;
  var sig = "["+colors.green("bg")+"]";
  console.log(sig, "Starting", this.cmd, this.args.join(" "));

  if(typeof this.opts.stdio === 'undefined') {
    this.opts.stdio = 'inherit';
  }

  this.proc = spawn(this.cmd, this.args, this.opts);

  this.proc.on("exit", this.exit.bind(this));

  this.running = true;
};

Child.prototype.restart = function() {
  if (!this.running) return this.start();

  this.proc.removeAllListeners("exit").on("exit", function() {
    this.running = false;
    this.start();
  }.bind(this));

  this.proc.kill("SIGTERM");
};

Child.prototype.stop = function() {
  this.proc.kill("SIGTERM");
};

Child.prototype.exit = function(code) {
  this.running = false;
  if(code != null)
    this.errorcode = code;
  var msg = "Exited with code " + this.errorcode;
  var sig = "["+colors[this.errorcode === 0 ? "gray" : "red"]("bg")+"]";
  console.log(sig, msg);
  if (this.cb) {
    this.cb(this);
  }
};

Child.prototype.setCallback = function(cb) {
  this.cb = cb;
}

var plugin = module.exports = function(cmd, args, opts) {
  var child = new Child(cmd, args, opts);

  var fn = child.restart.bind(child);
  fn.stop = child.stop.bind(child);
  fn.setCallback = child.setCallback.bind(child);

  return Object.defineProperty(fn, 'proc', {
    get: function() {
      return child.proc;
    }
  });
};
