import utils from './utils.js';
import {CanceledError} from "./CanceledError.js";
import {TimeoutError} from "./TimeoutError.js";
import {AbortController, AbortSignal} from "./AbortController.js"
import EventEmitter from "./EventEmitter.js";
import {VERSION} from "./env/data.js";

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
  global,
  setImmediate,
  isAbortController,
  asap
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
  kUncaught,
  kTag,
  kTimer
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
  'uncaught',
  'tag',
  'timer'
);

const STATE_PENDING = 0;
const STATE_FULFILLED = 1;
const STATE_REJECTED = 2;

const ATOMIC_MODE_AWAIT = false;
const ATOMIC_MODE_DETACHED = true;

const {push} = Array.prototype;

const hasConsole = typeof console !== 'undefined' && console;

const noop = () => {};

const getMethod = (obj, name) => {
  let type;
  let then;

  if(((type = typeof obj) === 'object' || type === 'function') && typeof (then = obj[name]) === 'function') {
    return then;
  }
}

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
}

export class AxiosPromise{
  constructor(executor, {signal, timeout} = {}) {
    this[kState] = STATE_PENDING;
    this[kCallbacks] = null;
    this[kInternals] = {
      signals: null
    }

    if(signal) {
      if(signal.aborted) {
        this.cancel();
        return this;
      }

      this.listen(signal);
    }

    timeout && this.timeout(timeout);

    let type;

    if(executor !== noop) {
      if ((type = typeof executor) !== 'function') {
        this[kResolveTo](new TypeError(`Promise resolver ${type} is not a function`));
        return this;
      }

      this[kDoResolve](executor);
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

  timeout(ms) {
    if (!this[kState]) {
      if (this[kTimer]) {
        clearTimeout(this[kTimer]);
        this[kTimer] = 0;
      }

      if (ms > 0) {
        this[kTimer] = setTimeout(() => {
          this[kTimer] = 0;
          this.cancel(new TimeoutError(ms))
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

  uncaught(handler = noop) {
    const appendedHandler = this[kUncaught];
    this[kUncaught] = appendedHandler && appendedHandler !== noop ? [appendedHandler, handler] : handler;
    return this;
  }

  cancel(reason, forced) {
    if (this[kFinalized]) return false;

    let target = this;
    let parent;
    let atomic = target[kAtomic];

    while (atomic === undefined && (parent = target[kParent]) && !parent[kFinalized] && (forced || typeof parent[kCallbacks] === 'function' || parent[kCallbacks].length <= 1)) {
      atomic = parent[kAtomic]
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
    if (!isAbortSignal(signal)) {
      throw TypeError('expected AbortSignal object');
    }

    const internals = this[kInternals];

    if (internals.signals) {
      internals.signals.push(signal);
    } else {
      internals.signals = [signal];
    }

    signal.addEventListener('abort', () => this.cancel());

    return this;
  }

  onCancel(listener) {
    this[kCancelCallbacks] ? this[kCancelCallbacks].push(listener) : this[kCancelCallbacks] = [listener];
  }

  get signal(){
    return (this[kInternals].controller = new AbortController()).signal;
  }

  [kUnsubscribe](chain) {
    const parentCallbacks = this[kCallbacks];
    const callback = chain[kCallback];
    if(typeof parentCallbacks === 'function' && parentCallbacks === callback) {
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

  [kFinalize](){
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

    if(canceled){
      const cancelCallbacks = this[kCancelCallbacks];

      if (cancelCallbacks) {
        invokeCallbacks(cancelCallbacks, [value]);
      }

      controller && controller.abort();
    }

    const callbacks = this[kCallbacks];

    let hasCallback;

    if(callbacks) {
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

    if(isRejected && !hasCallback && !canceled) {
      const uncaughtCallbacks = this[kUncaught];
      if (uncaughtCallbacks) {
        uncaughtCallbacks !== noop && invokeCallbacks(uncaughtCallbacks, [value])
      } else if (hasConsole && this[kAtomic] !== ATOMIC_MODE_DETACHED) {
        this.constructor._unhandledRejection(value);
      }
    }

    this[kCallbacks] = null;
    this[kParent] = null;
    this[kCancelCallbacks] = null;
    this[kInnerThenable] = null;
    this[kInternals] = null;
    this[kUncaught] = null;
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

    if (!settled) {
      this[kState] = isRejected ? STATE_REJECTED : STATE_FULFILLED;

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
        then = getMethod(value, 'then');
      } catch (err) {
        return this[kResolveTo](err, true);
      }
    }

    if (then && typeof then === 'function') {
      this[kInnerThenable] = value;
      this[kDoResolve](then, value);
    } else {
      this[kResolveTo](value, isRejected)
    }

  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    onRejected = typeof onRejected === 'function' ? onRejected : null;

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
            resolver(this[kValue], this[kState] === STATE_REJECTED)
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

  get [Symbol.toStringTag](){
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
            chains[i].cancel(reason)
          }
        } else {
          cancelRequested = true;
        }
      }

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
            chains[i].cancel(reason)
          }
        } else {
          cancelRequested = true;
        }
      }

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
    return new this((resolve, _, {onCancel})=> {
      const timer = setTimeout(resolve, ms, value);
      onCancel(()=> clearTimeout(timer));
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
        promise[kResolveTo](e, true)
      }
    }

    const onRejected = (err) => {
      try {
        next(generator.throw(err));
      } catch (e) {
        promise[kResolveTo](e, true);
      }
    }

    const next = (r) => {
      if (r.done) {
        return promise[kResolve](r.value);
      }

      const innerPromise = this.resolve(r.value).then(onFulfilled, onRejected);

      promise[kInnerThenable] = innerPromise;

      return innerPromise;
    }

    onFulfilled();

    return promise;
  }

  static _unhandledRejection(reason) {
    const source = this[kTag] ? ` @ ${this[kTag]}` : '';
    console.warn(`Unhandled AxiosPromise Rejection${source}:`, reason);
  }

  static promisify(fn, {scopeArg = false} = {}) {
    if (!isGeneratorFunction(fn)) {
      throw new TypeError(`value must be a generator function`);
    }

    const context = this;

    return function () {
      return new context((resolve, reject, scope) => {
        let generatorArgs;
        if (scopeArg) {
          generatorArgs = [scope];
          push.apply(generatorArgs, arguments);
        } else {
          generatorArgs = arguments;
        }

        context[kResolveGenerator](fn.apply(this, generatorArgs), scope)
      });
    }
  }
}

const {prototype} = AxiosPromise;

prototype[kSync] = false;

lazyBind(prototype, ['cancel', 'onCancel', 'signal']);
lazyBind(AxiosPromise,['delay', 'promisify']);

defineConstants(AxiosPromise, {
  VERSION,
  AbortController,
  AbortSignal,
  CanceledError,
  TimeoutError,
});

export class AxiosPromiseSync extends AxiosPromise {
  get [Symbol.toStringTag](){
    return 'AxiosPromiseSync';
  }
}

AxiosPromiseSync.prototype[kSync] = true;

export {
  isGenerator,
  isGeneratorFunction,
  isAsyncFunction,
  isPlainFunction,
  isContextDefined,
  lazyBind,
  defineConstants,
  symbols,
  isAbortSignal,
  global,
  isAbortController,
  setImmediate,
  asap,
  AbortSignal,
  AbortController,
  EventEmitter,
  AxiosPromise as default
};
