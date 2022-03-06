"use strict";

const CALL_DELEGATE = function (...args) {
    this.call = this._createCall("sync");
    return this.call(...args);
};

class Hook {
    constructor(args = [], name = undefined) {
        this._args = args;
        this.name = name;
        this.taps = [];
        this.call = CALL_DELEGATE; 
        this._call = CALL_DELEGATE;
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
    _resetCompilation() {
        this.call = this._call;
    }
    _insert(item) {
        this._resetCompilation();
        let i = this.taps.length;
        this.taps[i] = item;
    }
}

Object.setPrototypeOf(Hook.prototype, null);

module.exports = Hook;
