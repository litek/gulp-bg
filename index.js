"use strict";
var spawn = require("child_process").spawn,
    colors = require("chalk");

var Child = function(cmd, args) {
  this.cmd = cmd;
  this.args = args;

  process.on("exit", function() {
    if (!this.running) return;
    this.proc.kill("SIGTERM");
  }.bind(this));
};

Child.prototype.start = function() {
  if (this.running) return;
  var sig = "["+colors.green("bg")+"]";
  console.log(sig, "Starting", this.cmd, this.args.join(" "));

  this.proc = spawn(this.cmd, this.args);

  this.proc.stdout.on("data", this.log);
  this.proc.stderr.on("data", this.err);
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

Child.prototype.exit = function(code) {
  var fn = code === 0 ? "log" : "err";
  this[fn]("Exited with code "+code);
  this.running = false;
};

Child.prototype.log = function(buff) { 
  var msg = buff.toString().trim();
  var sig = "["+colors.gray("bg")+"]";
  console.log(sig, msg);
};

Child.prototype.err = function(buff) {
  var msg = buff.toString().trim();
  var sig = "["+colors.red("bg")+"]";

  if (!msg) return;
  console.log(sig, msg);
};

var plugin = module.exports = function(cmd, args) {
  if (!(args instanceof Array)) {
    args = Array.prototype.slice.call(arguments, 1);
  }
  
  var child = new Child(cmd, args);

  return child.restart.bind(child);
};
