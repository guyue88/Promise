(function (window, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(['Promise'], factory);
    } else {
        window.Promise = factory();
    }
}(this, function () {
    var PENDING = 0;
    var FULFILLED = 1;
    var REJECTED = 2;

    var async = function () {
        if (typeof process === 'object' && process !== null && typeof process.nextTick === 'function') {
            return process.nextTick;
        } else if (typeof setImmediate === 'function') {
            return setImmediate;
        }
        return setTimeout;
    }();

    function isFunction(func) {
        return typeof func === 'function';
    }

    function isArray(arr) {
        return Object.prototype.toString.call(arr) === '[object Array]';
    }

    function Promise(executor) {
        var self = this;
        this._state = PENDING;
        this._value = undefined;
        this._onResolvedCallback = [];
        this._onRejectedCallback = [];

        function resolve(value) {
            if (self._state === PENDING) {
                self._state = FULFILLED;
                self._value = value;
                for (var i = 0; i < self._onResolvedCallback.length; i++) {
                    self._onResolvedCallback[i](value);
                }
                self._onResolvedCallback = [];
            }
        }

        function reject(reason) {
            if (self._state === PENDING) {
                self._state = REJECTED;
                self._value = reason;
                for (var i = 0; i < self._onRejectedCallback.length; i++) {
                    self._onRejectedCallback[i](reason);
                }
                self._onRejectedCallback = [];
            }
        }

        try {
            // async(executor, null, resolve, reject);
            executor(resolve, reject);
        } catch (reason) {
            // async(reject, null, reason);
            reject(reason);
        }
    }

    Promise.prototype.then = function (onResolved, onRejected) {
        var self = this;
        onResolved = isFunction(onResolved) ? onResolved : function (v) {
            return v;
        };
        onRejected = isFunction(onRejected) ? onRejected : function (r) {
            throw r
        };

        return new self.constructor(function (resolve, reject) {
            function _resolve(value) {
                try {
                    var p = onResolved(value);
                    if (p instanceof Promise) {
                        p.then(resolve, reject);
                    } else {
                        resolve(p);
                    }
                } catch (e) {
                    reject(e);
                }
            }

            function _reject(reason) {
                try {
                    var p = onRejected(reason);
                    if (p instanceof Promise) {
                        p.then(resolve, reject);
                    } else {
                        resolve(p);
                    }
                } catch (e) {
                    reject(e);
                }
            }

            if (self._state === PENDING) {
                self._onResolvedCallback.push(_resolve);
                self._onRejectedCallback.push(_reject);
            } else if (self._state === FULFILLED) {
                async (_resolve, null, self._value);
                // _resolve(self._value);
            } else if (self._state === REJECTED) {
                async (_reject, null, self._value);
                // _reject(self._value);
            }
        });
    }

    Promise.prototype.catch = function (onRejected) {
        return this.then(null, onRejected);
    }

    Promise.resolve = function (data) {
        return new Promise(function (resolve) {
            resolve(data);
        });
    }

    Promise.reject = function (data) {
        return new Promise(function (resolve, reject) {
            reject(data);
        });
    }

    Promise.all = function (promiseArr) {
        if (!isArray(promiseArr)) {
            throw new TypeError("Promise.all need Array object as argument");
        }
        return new Promise(function (resolve, reject) {
            var count = len = promiseArr.length;
            var result = [];

            for (var i = 0; i < len; i++) {
                var promise = promiseArr[i];
                promise.then((function (index) {
                    return function (value) {
                        result[index] = value;
                        if (--count === 0) {
                            resolve(result);
                        }
                    }
                })(i), reject);
            }
        });
    }

    Promise.race = function (promiseArr) {
        if (!isArray(promiseArr)) {
            throw new TypeError("Promise.race need Array object as argument");
        }

        return new Promise(function (resolve, reject) {
            var len = promiseArr.length;
            for (var i = 0; i < len; i++) {
                var promise = promiseArr[i];
                promise.then(resolve, reject);
            }
        });
    }

    return Promise;
}));