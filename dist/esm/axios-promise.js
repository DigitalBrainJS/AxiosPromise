// AxiosPromise v0.11.3 Copyright (c) 2024 Dmitriy Mozgovoy and contributors
const {
  hasOwn = (({hasOwnProperty}) => (obj, prop) => hasOwnProperty.call(obj, prop))(Object.prototype)
} = Object;

const isFunction$1 = (thing) => typeof thing === 'function';

const _global = typeof globalThis === 'object' && globalThis ||
  (typeof global !== "undefined" && global) ||
  (typeof self !== "undefined" && self) || window;

const _setImmediate = ((setImmediateSupported, postMessageSupported) => {
  if (setImmediateSupported) {
    return setImmediate;
  }

  return postMessageSupported ? ((token, callbacks) => {
    _global.addEventListener("message", ({source, data}) => {
      if (source === _global && data === token) {
        callbacks.length && callbacks.shift()();
      }
    }, false);

    return (cb) => {
      callbacks.push(cb);
      _global.postMessage(token, "*");
    }
  })(`axios-promise@${Math.random()}`, []) : (cb) => setTimeout(cb);
})(
  typeof setImmediate === 'function',
  isFunction$1(_global.postMessage)
);

const asap$1 = typeof queueMicrotask !== 'undefined' ?
  queueMicrotask : ( typeof process !== 'undefined' && process.nextTick || _setImmediate);

const functionTypeTest = ({constructor}) => {
  const {name} = constructor;
  return (thing) => thing && isFunction$1(thing) && (thing.constructor === constructor || (name && thing.constructor.name === name));
};

const isGeneratorFunction$1 = functionTypeTest(function* () {});

const isAsyncFunction$1 = functionTypeTest(async () => {});

const isPlainFunction$1 = functionTypeTest(() => {});

const isGenerator$1 = (obj) => obj && isFunction$1(obj.next) && isFunction$1(obj.throw);

const isContextDefined$1 = (context) => context != null && context !== _global;

const lazyBind$1 = (obj, props, {bindMethods = true} = {}) => {
  const symbols = {};

  props.forEach(prop => {
    const symbol = Symbol(`${prop}Lazy`);
    const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
    const {value, get, enumerable} = descriptor;

    if('value' in descriptor && !isFunction$1(value)) {
      console.warn('skip', prop);
      return;
    }

    Object.defineProperty(obj, prop, {
      get() {
        if (hasOwn.call(this, symbol)) {
          return this[symbol];
        }

        const resolvedValue = get ? get.call(this) : value;

        const boundContext = this;

        return this[symbol] = bindMethods && isFunction$1(resolvedValue) ? function () {
          return resolvedValue.apply(isContextDefined$1(this) ? this : boundContext, arguments);
        } : resolvedValue;
      },

      set(v) {
        throw Error(`Can not rewrite prop ${prop} with ${v}`);
      },

      enumerable,
      configurable: true
    });

    symbols[prop] = symbol;
  });

  return symbols;
};

const defineConstants$1 = (obj, props, {configurable = true, enumerable = true} = {}) => {
  const descriptors = {};

  Object.getOwnPropertyNames(props).forEach((prop) => {
    descriptors[prop] = {value: props[prop], enumerable, configurable};
  });

  Object.defineProperties(obj, descriptors);
};

const isAbortSignal$1 = (thing) => {
  return thing &&
    typeof thing === 'object' &&
    typeof thing.aborted === 'boolean' &&
    isFunction$1(thing.addEventListener) &&
    isFunction$1(thing.removeEventListener);
};

const isAbortController$1 = (thing) => {
  return thing && typeof thing === 'object' && isFunction$1(thing.abort) && isAbortSignal$1(thing.signal);
};

const symbols$1 = (...tags) => ({
  * [Symbol.iterator]() {
    while (true) {
      yield Symbol(tags.shift() || '');
    }
  }
});

const utils = {
  global: _global,
  setImmediate: _setImmediate,
  asap: asap$1,
  isGeneratorFunction: isGeneratorFunction$1,
  isFunction: isFunction$1,
  isAsyncFunction: isAsyncFunction$1,
  isPlainFunction: isPlainFunction$1,
  functionTypeTest,
  isContextDefined: isContextDefined$1,
  hasOwn,
  lazyBind: lazyBind$1,
  isGenerator: isGenerator$1,
  defineConstants: defineConstants$1,
  isAbortSignal: isAbortSignal$1,
  isAbortController: isAbortController$1,
  symbols: symbols$1
};

const kInternals$1 = Symbol('internals');
const kSignature = Symbol.for(`AxiosPromise.CanceledError`);

class CanceledError extends Error {
  constructor(message, code) {
    super(message || 'This operation was aborted');
    const internal = this.constructor[kInternals$1];
    this.name = internal.name;
    this.code = code || internal.code;
  }

  static from(thing) {
    return this.isCanceledError(thing) ? thing :
      new this(thing instanceof Error ? (thing.name !== 'AbortError' ? thing.message : '') : thing);
  }

  static isCanceledError(err) {
    return !!(err && err[kSignature]);
  }

  static addSignatureTo(constructor) {
    typeof constructor === 'function' && (constructor.prototype[kSignature] = this[kInternals$1].code);
  }

  static rethrow(err, code) {
    if (this.isCanceledError(err) && (!code || code === err.code)) {
      throw err;
    }
  }

  static init(name, code) {
    this[kInternals$1] = {
      name,
      code: code || 'ERR_' + name.toUpperCase().replace(/ERROR$/, '')
    };

    this.addSignatureTo(this);
  }
}

CanceledError.init('CanceledError');

class TimeoutError extends CanceledError {
  constructor(messageOrTimeout, code) {
    super(typeof messageOrTimeout === 'number' ? `${messageOrTimeout} ms timeout exceeded` : messageOrTimeout, code);
  }
}

TimeoutError.init('TimeoutError');

class EventEmitter {
  constructor(events) {
    this._events = events || {};
  }

  on(event, listener, prepend) {
    const events = this._events;
    const listeners = events[event];

    events['newListener'] && this.emit('newListener', event, listener);

    if (!listeners) {
      events[event] = listener;
    } else if (typeof listeners === 'function') {
      events[event] = prepend ? [listener, listeners] : [listeners, listener];
    } else {
      prepend ? listener.unshift(listener) : listeners.push(listener);
    }

    return this;
  }

  off(event, listener) {
    const events = this._events;
    const listeners = events[event];
    let found = false;

    if (listeners) {
      if (typeof listeners === 'function') {
        if (listeners === listener) {
          events[event] = null;
          found = true;
        }
      } else {
        let i = listeners.length;
        while (i--) {
          if (listeners[i] === listener) {
            listeners.splice(i, 1);
            found = true;
            break;
          }
        }
      }
    }

    found && events['removeListener'] && this.emit('removeListener', event, listener);

    return found;
  }

  emit(event) {
    let listeners = this._events[event];
    if (!listeners) return false;

    const args = Array.from(arguments).slice(1);

    if (typeof listeners === 'function') {
      listeners.apply(null, args);
    } else {
      const l = listeners.length;
      l > 1 && (listeners = listeners.slice());
      for (let i = 0; i < l; i++) {
        listeners[i].apply(null, args);
      }
    }
    return true;
  }

  once(event, listener, prepend) {
    const once = () => {
      this.off(event, once);
      listener.apply(null, arguments);
    };

    return this.on(event, once, prepend);
  }

  listenerCount(event) {
    const listeners = this._events[event];
    return listeners ? (typeof listeners === 'function' ? 1 : listeners.length) : 0;
  }
}

const {prototype: prototype$1} = EventEmitter;

prototype$1.addEventListener = prototype$1.on;
prototype$1.removeEventListener = prototype$1.off;

const [kSignal, kAborted, kAbort, kReason] = utils.symbols('signal', 'aborted', 'abort', 'reason');

const hasNativeSupport = typeof AbortController === 'function'
  && typeof AbortSignal === 'function' && 'reason' in new AbortController().signal;

const _AbortSignal = hasNativeSupport ? AbortSignal : class AbortSignal extends EventEmitter{
  constructor() {
    super();
    this[kAborted] = false;
  }

  get aborted() {
    return this[kAborted];
  }

  get reason() {
    return this[kReason];
  }

  [kAbort](reason) {
    if (!this[kAborted]) {
      this[kAborted] = true;
      this[kReason] = reason;
      this.dispatchEvent('abort');
    }
  }

  dispatchEvent(type) {
    const event = {
      type,
      target: this
    };

    let listener;

    typeof (listener = this['on' + type]) === 'function' && listener.call(this, event);

    this.emit(type, event);
  }

  throwIfAborted() {
    if (this[kAborted]) {
      throw this[kReason];
    }
  }

  get [Symbol.toStringTag]() {
    return 'AbortSignal'
  }

  toString() {
    return '[object AbortSignal]'
  }
};

const _AbortController = hasNativeSupport ? AbortController : class AbortControllerPolyfill {
  constructor() {
    this[kSignal] = null;
  }

  get signal() {
    return this[kSignal] || (this[kSignal] = new _AbortSignal());
  }

  abort(reason) {
    this.signal[kAbort](reason);
  }

  get [Symbol.toStringTag]() {
    return 'AbortController'
  }

  toString() {
    return '[object AbortController]'
  }
};

const VERSION = "0.11.3";

class UnhandledRejectionError extends Error{
  constructor(err, message) {
    super((message ? message + ': ' : '') + (err.message || err), {cause: err});
    this.name = 'UnhandledRejectionError';
  }
}

const {
  isGenerator,
  isFunction,
  isGeneratorFunction,
  isAsyncFunction,
  isPlainFunction,
  isContextDefined,
  lazyBind,
  defineConstants,
  symbols,
  isAbortSignal,
  global: global$1,
  setImmediate: setImmediate$1,
  isAbortController,
  asap,
  drop
} = utils;

const kPromiseSign = Symbol.for('AxiosPromise');

const [
  kState,
  kValue,
  kCallbacks,
  kDoResolve,
  kResolveTo,
  kResolve,
  kParent,
  kInnerThenable,
  kCanceled,
  kFinalized,
  kSync,
  kCallback,
  kCancelCallbacks,
  kInternals,
  kFinalize,
  kUnsubscribe,
  kResolveGenerator,
  kAtomic,
  kCanceledWith,
  kTag,
  kTimer,
  kUnhandledFlag
] = symbols(
  'state',
  'value',
  'callbacks',
  'doResolve',
  'resolveTo',
  'resolve',
  'parent',
  'innerThenable',
  'canceled',
  'finalized',
  'sync',
  'callback',
  'cancelCallbacks',
  'internals',
  'finalize',
  'unsubscribe',
  'resolveGenerator',
  'atomic',
  'canceledWith',
  'tag',
  'timer',
  'unhandledFlag'
);

const STATE_PENDING = 0;
const STATE_FULFILLED = 1;
const STATE_REJECTED = 2;

const ATOMIC_MODE_AWAIT = false;
const ATOMIC_MODE_DETACHED = true;

const {push} = Array.prototype;

const hasConsole = typeof console !== 'undefined' && console;

const noop = () => {};

const getThen = (obj) => {
  let type;
  let then;

  if(((type = typeof obj) === 'object' || type === 'function') && typeof (then = obj.then) === 'function') {
    return then;
  }
};

const invokeCallbacks = (callbacks, args, that) => {
  if(!callbacks) return false;

  if (typeof callbacks === 'function') {
    callbacks.apply(that, args);
    return true;
  } else {
    const {length} = callbacks;
    for (let i = 0; i < length; i++) {
      callbacks[i].apply(that, args);
    }
    return !!length;
  }
};

const [trackUnhandled, untrackUnhandled] = ((trackQueue, length) => {
  let timer;

  const handler = () => {
    timer = 0;
    let l = trackQueue.length;
    let p;
    for (let i = 0; i < l; i++) {
      (p = trackQueue[i]).constructor._unhandledRejection(p[kValue], p);
    }
    trackQueue = [];
  };

  return [(promise) => {
    trackQueue.push(promise);
    length++;
    timer || (timer = setTimeout(handler));
  }, (promise) => {
    const index = trackQueue.indexOf(promise);
    if (index < 0) return;
    length--;
    if (!length) {
      timer && clearTimeout(timer);
      timer = 0;
      trackQueue = [];
    } else {
      trackQueue.splice(index, 1);
    }
  }];
})([], 0);

class AxiosPromise {
  constructor(executor, {signal, timeout} = {}) {
    this[kState] = STATE_PENDING;
    this[kCallbacks] = null;
    this[kInternals] = {
      signals: null
    };

    if (signal) {
      if (signal.aborted) {
        this.cancel(signal.reason);
        return this;
      }

      this.listen(signal);
    }

    timeout && this.timeout(timeout);

    let type;

    if (executor !== noop) {
      if ((type = typeof executor) !== 'function') {
        this[kResolveTo](new TypeError(`Promise resolver ${type} is not a function`));
        return this;
      }

      const maybeOnCancelSubscriber = this[kDoResolve](executor);

      if (maybeOnCancelSubscriber && isFunction(maybeOnCancelSubscriber)) {
        this.onCancel(maybeOnCancelSubscriber);
      }
    }
  }

  [kDoResolve](fn, fnContext) {
    let done = false;

    try {
      return fn.call(fnContext,
        (value) => {
          if (done) return;
          done = true;
          this[kResolve](value, false);
        }, (reason) => {
          if (done) return;
          done = true;
          this[kResolveTo](reason, true);
        }, this);
    } catch (e) {
      if (done) return;
      done = true;
      this[kResolveTo](e, true);
    }
  }

  timeout(ms, errorOrMessage) {
    if (!this[kState]) {
      if (this[kTimer]) {
        clearTimeout(this[kTimer]);
        this[kTimer] = 0;
      }

      if (ms > 0) {
        this[kTimer] = setTimeout(() => {
          this[kTimer] = 0;
          this.cancel(TimeoutError.from(errorOrMessage || ms));
        }, ms);
      }
    }
    return this;
  }

  tag(tag) {
    if (!arguments.length) {
      return this[kTag] || '';
    }
    this[kTag] = String(tag);
    return this;
  }

  atomic(mode = ATOMIC_MODE_AWAIT) {
    const promise = this.then();

    promise[kAtomic] = (this[kAtomic] = !!mode);

    return promise;
  }

  static atomic(chain, mode = ATOMIC_MODE_AWAIT) {
    return this.resolve(chain, {atomic: mode})
  }

  cancel(reason, forced) {
    if (this[kFinalized]) return false;

    let target = this;
    let parent;
    let atomic = target[kAtomic];

    while (atomic === undefined && (parent = target[kParent]) && !parent[kFinalized] && (forced || typeof parent[kCallbacks] === 'function' || parent[kCallbacks].length <= 1)) {
      atomic = parent[kAtomic];
      target = parent;
    }

    reason = CanceledError.from(reason);

    if (atomic === ATOMIC_MODE_AWAIT) {
      target[kCanceledWith] = reason;
      return true;
    }

    const innerThenable = target[kInnerThenable];

    if (!(innerThenable && typeof innerThenable.cancel === 'function' && innerThenable.cancel(reason)) && !target[kCanceled]) {
      reason.scope = target;
      target[kResolveTo](reason, true);
    }

    return true;
  }

  listen(signal) {
    if (signal != null && !this[kFinalized]) {
      if (!isAbortSignal(signal)) {
        throw TypeError('expected AbortSignal object');
      }

      const internals = this[kInternals];

      if (internals.signals) {
        internals.signals.push(signal);
      } else {
        internals.signals = [signal];
      }

      signal.addEventListener('abort', () => this.cancel(signal.reason));
    }

    return this;
  }

  onCancel(listener) {
    this[kCancelCallbacks] ? this[kCancelCallbacks].push(listener) : this[kCancelCallbacks] = [listener];
  }

  get signal() {
    return (this[kInternals].controller = new _AbortController()).signal;
  }

  [kUnsubscribe](chain) {
    const parentCallbacks = this[kCallbacks];
    const callback = chain[kCallback];
    if (typeof parentCallbacks === 'function' && parentCallbacks === callback) {
      this[kCallbacks] = null;
    } else {
      let i = parentCallbacks.length;
      while (i--) {
        if (parentCallbacks[i] === callback) {
          return parentCallbacks.splice(i, 1);
        }
      }
    }
  }

  [kFinalize]() {
    this[kFinalized] = true;

    let value = this[kValue];
    let isRejected = this[kState] === STATE_REJECTED;
    let canceled = this[kCanceled];
    const internals = this[kInternals];
    const {signals, controller} = internals;
    const parent = this[kParent];

    if (!isRejected && this[kCanceledWith]) {
      canceled = true;
      isRejected = true;
      value = this[kCanceledWith];
    }

    if (parent && !parent[kFinalized]) { // Premature resolving - unsubscribe from parent chain
      parent[kUnsubscribe](this);
    }

    this[kTimer] && clearTimeout(this[kTimer]);

    if (signals) {
      let i = signals.length;
      while (i--) {
        signals[i].removeEventListener('abort', this.cancel);
      }
    }

    if (canceled) {
      const cancelCallbacks = this[kCancelCallbacks];

      if (cancelCallbacks) {
        invokeCallbacks(cancelCallbacks, [value]);
      }

      controller && controller.abort(value);
    }

    const callbacks = this[kCallbacks];

    let hasCallback;

    if (callbacks) {
      if (typeof callbacks === 'function') {
        hasCallback = true;
        callbacks(value, isRejected);
      } else {
        const {length} = callbacks;
        hasCallback = length;
        for (let i = 0; i < length; i++) {
          callbacks[i](value, isRejected);
        }
      }
    }

    if (isRejected && !hasCallback && !canceled) {
      if (hasConsole && this[kAtomic] !== ATOMIC_MODE_DETACHED) {
        this[kUnhandledFlag] = true;
        trackUnhandled(this);
      }
    }

    this[kCallbacks] = null;
    this[kParent] = null;
    this[kCancelCallbacks] = null;
    this[kInnerThenable] = null;
    this[kInternals] = null;
    this[kTimer] = null;
  }

  [kResolveTo](value, isRejected) {
    if (this[kFinalized]) return;

    const settled = this[kState];

    if (isRejected && CanceledError.isCanceledError(value)) {
      this[kCanceled] = true;
    } else if (settled) {
      return;
    }

    this[kValue] = value;
    this[kState] = isRejected ? STATE_REJECTED : STATE_FULFILLED;

    if (!settled) {
      this[kSync] ? this[kFinalize]() : asap(() => this[kFinalize]());
    }
  }

  [kResolve](value, isRejected) {
    const {constructor} = this;
    let then;

    if (this === value) {
      return this[kResolveTo](new TypeError(`circular reference to ${value}`), true);
    }

    if (value && isGenerator(value)) {
      then = (value = constructor[kResolveGenerator](value, new constructor(noop))).then;
    } else if (value) {
      try {
        then = getThen(value);
      } catch (err) {
        return this[kResolveTo](err, true);
      }
    }

    if (then && typeof then === 'function') {
      this[kInnerThenable] = value;
      this[kDoResolve](then, value);
    } else {
      this[kResolveTo](value, isRejected);
    }

  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    onRejected = typeof onRejected === 'function' ? onRejected : null;

    this[kUnhandledFlag] && untrackUnhandled(this);

    return new this.constructor(($, $$, promise) => {
      let invoked;

      const resolver = (value, isRejected) => {
        if (invoked) return;

        invoked = true;

        const handler = isRejected ? onRejected : onFulfilled;

        try {
          promise[kResolve](handler ? handler(value, promise) : value, isRejected && !handler);
        } catch (err) {
          promise[kResolveTo](err, true);
        }
      };

      promise[kParent] = this;

      if (this[kFinalized]) {
        return this[kSync] ?
          resolver(this[kValue], this[kState] === STATE_REJECTED) :
          asap(() => {
            resolver(this[kValue], this[kState] === STATE_REJECTED);
          });
      }

      promise[kCallback] = resolver;

      const callbacks = this[kCallbacks];

      if (callbacks) {
        typeof callbacks === 'function' ? this[kCallbacks] = [callbacks, resolver] : callbacks.push(resolver);
      } else {
        this[kCallbacks] = resolver;
      }
    });
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  finally(callback) {
    let {constructor} = this;

    return isFunction(callback) ? this.then(
      (value, scope) => constructor.resolve(callback({value, status: 'fulfilled'}, scope)).then(() => value),
      (reason, scope) => constructor.resolve(callback({reason, status: 'rejected'}, scope)).then(() => {
        throw reason;
      })) : this.then(callback, callback);
  }

  static allSettled(promises) {
    return this.all(Array.from(promises).map(promise => promise.then(value => ({
        status: 'fulfilled', value
      }), (reason) => ({
        status: 'rejected', reason
      }))
    ))
  }

  get [Symbol.toStringTag]() {
    return 'AxiosPromise';
  }

  toString() {
    const tag = this[kTag];
    return `${this[Symbol.toStringTag]}${tag ? '#' + tag : ''}{${['pending', 'fulfilled', 'rejected'][this[kState]]}}`
  }

  static resolve(value, options) {
    const atomic = options != null ? !!options.atomic : undefined;

    if (value instanceof this && value[kSync] === this[kSync] && value[kAtomic] === atomic) {
      return value;
    }
    const promise = new this(resolve => resolve(value));

    atomic && (promise[kAtomic] = atomic);

    return promise;
  }

  static reject(reason) {
    return new this((_, reject) => reject(reason));
  }

  static all(promises) {
    return new this((resolve, reject, {onCancel}) => {
      const {length} = promises = Array.from(promises);

      if (!length) {
        resolve([]);
        return;
      }

      const chains = new Array(length);
      const results = new Array(length);
      let cancelRequested;
      let subscribed;
      let canceled;
      let counter = 0;

      const cancel = (reason) => {
        if (subscribed) {
          canceled = true;
          for (let i = 0; i < length; i++) {
            chains[i].cancel(reason);
          }
        } else {
          cancelRequested = true;
        }
      };

      const _reject = (reason) => {
        reject(reason);
        !canceled && cancel();
      };

      for (let i = 0; i < length; i++) {
        chains[i] = this.resolve(promises[i]).then((value) => {
          results[i] = value;
          if (++counter === length) {
            resolve(value);
          }
        }, _reject);
      }

      subscribed = true;

      cancelRequested ? cancel() : onCancel(cancel);
    })
  }

  static race(promises) {
    return new this((resolve, reject, {onCancel}) => {
      const {length} = promises = Array.from(promises);

      if (!length) {
        return;
      }

      const chains = new Array(length);
      let cancelRequested;
      let subscribed;
      let canceled;

      const cancel = (reason) => {
        if (subscribed) {
          canceled = true;
          for (let i = 0; i < length; i++) {
            chains[i].cancel(reason);
          }
        } else {
          cancelRequested = true;
        }
      };

      const _reject = (reason) => {
        try {
          reject(reason);
        } finally {
          !canceled && cancel();
        }
      };

      for (let i = 0; i < length; i++) {
        chains[i] = this.resolve(promises[i]).then((value) => {
          resolve(value);
          !canceled && cancel();
        }, _reject);
      }

      subscribed = true;

      cancelRequested ? cancel() : onCancel(cancel);
    })
  }

  static delay(ms, value) {
    return new this((resolve, _, {onCancel}) => {
      const timer = setTimeout(resolve, ms, value);
      onCancel(() => clearTimeout(timer));
    });
  }

  static isCanceledError(thing) {
    return CanceledError.isCanceledError(thing);
  }

  static isAxiosPromise(thing) {
    return !!(thing && thing[kPromiseSign]);
  }

  static [kResolveGenerator](generator, promise) {
    const onFulfilled = (result) => {
      try {
        next(generator.next(result));
      } catch (e) {
        promise[kResolveTo](e, true);
      }
    };

    const onRejected = (err) => {
      try {
        next(generator.throw(err));
      } catch (e) {
        promise[kResolveTo](e, true);
      }
    };

    const next = (r) => {
      if (r.done) {
        return promise[kResolve](r.value);
      }

      promise[kInnerThenable] = this.resolve(r.value).then(onFulfilled, onRejected);
    };

    onFulfilled();

    return promise;
  }

  static _unhandledRejection(unhandledError, p) {
    console.error(new UnhandledRejectionError(unhandledError, p[kTag] ? `@[${p[kTag]}]` : ''));
  }

  static promisify(fn, {scopeArg = false, scopeContext = false} = {}) {
    if (fn && fn[kPromiseSign]) return fn;

    if (!isFunction(fn)) {
      throw TypeError('value must be a function');
    }

    let promisified;
    const context = this;

    if (isGeneratorFunction(fn)) {
      promisified = function () {
        return new context((resolve, reject, scope) => {
          let generatorArgs;
          if (scopeArg) {
            generatorArgs = [scope];
            push.apply(generatorArgs, arguments);
          } else {
            generatorArgs = arguments;
          }

          context[kResolveGenerator](fn.apply(scopeContext || !this || this === global$1 ? scope : this, generatorArgs), scope);
        });
      };
    } else {
      promisified = function () {
        try {
          return context.resolve(fn.apply(this, arguments));
        } catch (err) {
          return context.reject(err);
        }
      };
    }

    promisified[kPromiseSign] = true;
    promisified.original = fn;

    return promisified;
  }

  static promisifyAll(obj, {reducer, ...options} = {}) {
    const descriptors = Object.getOwnPropertyDescriptors(obj);
    let ret, value;

    Object.entries(descriptors).forEach(([key, descriptor]) => {
      if ('value' in descriptor && isGeneratorFunction(value = descriptor.value) && descriptor.configurable &&
        (!reducer || (ret = reducer.call(obj, key, value)))) {
        Object.defineProperty(obj, ret || key, {
          ...descriptor,
          value: this.promisify(value, options)
        });
      }
    });
  }
}

const {prototype} = AxiosPromise;

prototype[kSync] = false;

lazyBind(prototype, ['cancel', 'onCancel', 'signal']);
lazyBind(AxiosPromise,['delay', 'promisify']);

defineConstants(AxiosPromise, {
  VERSION,
  AbortController: _AbortController,
  AbortSignal: _AbortSignal,
  CanceledError,
  TimeoutError,
});

class AxiosPromiseSync extends AxiosPromise {
  get [Symbol.toStringTag](){
    return 'AxiosPromiseSync';
  }
}

AxiosPromiseSync.prototype[kSync] = true;

const bottleneck = (fn, {concurrency = 1, cancelRunning, sync, timeout, taskTimeout, queueTimeout} = {}) => {
  const queue = [];
  const running = [];
  let pending = 0;

  const constructor = sync ? AxiosPromiseSync : AxiosPromise;

  fn = constructor.promisify(fn);

  return function(...args) {
    let done;
    let pushed;

    const promise = new constructor((resolve) => {
      if (pending++ < concurrency) {
        return resolve();
      }

      if (cancelRunning && running[0]) {
        running.shift().cancel('task limit reached');
      }

      return queue.push(resolve);
    })
      .timeout(queueTimeout, 'queue timeout')
      .then(() => {
        return constructor.resolve(fn.apply(this, args)).timeout(taskTimeout, 'task timeout')
      }).finally(() => {
        done = true;
        pending--;
        if (pushed) {
          const index = running.indexOf(promise);
          running.splice(index, 1);
        }
        queue.length && queue.shift()();
      });

    if (!done) {
      pushed = true;
      running.push(promise);
    }

    return promise.timeout(timeout);
  }
};

export { _AbortController as AbortController, _AbortSignal as AbortSignal, AxiosPromise, AxiosPromiseSync, CanceledError, EventEmitter, TimeoutError, asap, bottleneck, AxiosPromise as default, defineConstants, global$1 as global, isAbortController, isAbortSignal, isAsyncFunction, isContextDefined, isGenerator, isGeneratorFunction, isPlainFunction, lazyBind, setImmediate$1 as setImmediate, symbols };
//# sourceMappingURL=axios-promise.js.map
