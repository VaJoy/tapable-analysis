"use strict";

const CALL_DELEGATE = function (...args) {
    this.call = this._createCall("sync");
    return this.call(...args);
};

const CALL_ASYNC_DELEGATE = function (...args) {
    this.callAsync = this._createCall("async");
    return this.callAsync(...args);
};

class Hook {
    constructor(args = [], name = undefined) {
        this._args = args;
        this.name = name;
        this.taps = [];
        this.interceptors = [];  // 新增，用于存放拦截器
        this.call = CALL_DELEGATE;
        this._call = CALL_DELEGATE;
        this._callAsync = CALL_ASYNC_DELEGATE;
        this.callAsync = CALL_ASYNC_DELEGATE;
    }
    _createCall(type) {
        return this.compile({
            taps: this.taps,
            args: this._args,
            type: type,
            interceptors: this.interceptors  // 新增，传递给 HookCodeFactory
        });
    }
    intercept(interceptor) {  // 新增 intercept 接口
        this._resetCompilation();
        this.interceptors.push(Object.assign({}, interceptor));
        if (interceptor.register) {
            for (let i = 0; i < this.taps.length; i++) {
                this.taps[i] = interceptor.register(this.taps[i]);
            }
        }
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
    tapAsync(options, fn) {
        this._tap("async", options, fn);
    }
    tapPromise(options, fn) {
        this._tap("promise", options, fn);
    }
    _resetCompilation() {
        this.call = this._call;
        this.callAsync = this._callAsync;
    }
    _insert(item) {
        this._resetCompilation();
        let i = this.taps.length;
        this.taps[i] = item;
    }
}

Object.setPrototypeOf(Hook.prototype, null);

module.exports = Hook;
