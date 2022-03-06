"use strict";

const Hook = require("./Hook");
const HookCodeFactory = require("./HookCodeFactory");

class SyncBailHookCodeFactory extends HookCodeFactory {
	content({ onDone, onResult }) {
		return this.callTapsSeries({
			onDone,
			onResult: (i, result, next) =>
				`if(${result} !== undefined) {\n${onResult(
					result
				)};\n} else {\n${next()}}\n`,
		});
	}
}

const factory = new SyncBailHookCodeFactory();

const COMPILE = function(options) {
	factory.setup(this, options);
	return factory.create(options);
};

function SyncBailHook(args = [], name = undefined) {
	const hook = new Hook(args, name);
	hook.constructor = SyncBailHook;
	hook.compile = COMPILE;
	return hook;
}

SyncBailHook.prototype = null;

module.exports = SyncBailHook;
