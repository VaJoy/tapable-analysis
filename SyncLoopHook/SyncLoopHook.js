"use strict";

const Hook = require("./Hook");
const HookCodeFactory = require("./HookCodeFactory");

class SyncLoopHookCodeFactory extends HookCodeFactory {
	content({ onDone }) {
		// this.callTapsLooping 为新增方法
		return this.callTapsLooping({
			onDone
		});
	}
}

const factory = new SyncLoopHookCodeFactory();

const COMPILE = function(options) {
	factory.setup(this, options);
	return factory.create(options);
};

function SyncLoopHook(args = [], name = undefined) {
	const hook = new Hook(args, name);
	hook.constructor = SyncLoopHook;
	hook.compile = COMPILE;
	return hook;
}

SyncLoopHook.prototype = null;

module.exports = SyncLoopHook;
