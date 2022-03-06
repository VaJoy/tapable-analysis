"use strict";

const CALL_DELEGATE = function (...args) {
    this.call = this._createCall("sync");
    return this.call(...args);
};

// 新增
const CALL_ASYNC_DELEGATE = function(...args) {
	this.callAsync = this._createCall("async");
	return this.callAsync(...args);
};

class Hook {
    constructor(args = [], name = undefined) {
        this._args = args;
        this.name = name;
        this.taps = [];
        this.call = CALL_DELEGATE;
        this._call = CALL_DELEGATE;
        this._callAsync = CALL_ASYNC_DELEGATE;  // 新增
		this.callAsync = CALL_ASYNC_DELEGATE;  // 新增
    }
    _createCall(type) {
        return this.compile({
            taps: this.taps,
            args: this._args,
            type: type
        });
    }
    _tap(type, options, fn) {
        if (typeof options === "string") {
            options = {
                name: options.trim()
            };
        }
        options = Object.assign({ type, fn }, options);
        this._insert(options);
    }
    tap(options, fn) {
        this._tap("sync", options, fn);
    }
    // 新增 tapAsync
    tapAsync(options, fn) {
        this._tap("async", options, fn);
    }
    // 新增 tapPromise
    tapPromise(options, fn) {
        this._tap("promise", options, fn);
    }
    _resetCompilation() {
        this.call = this._call;
        this.callAsync = this._callAsync;  // 新增
    }
    _insert(item) {
        this._resetCompilation();
        let i = this.taps.length;
        this.taps[i] = item;
    }
}

Object.setPrototypeOf(Hook.prototype, null);

module.exports = Hook;
