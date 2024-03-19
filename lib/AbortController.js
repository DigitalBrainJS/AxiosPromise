import utils from './utils.js';
import EventEmitter from "./EventEmitter.js";

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

    this.emit(type, event)
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
}

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
}

export {
  _AbortController as AbortController,
  _AbortSignal as AbortSignal,
}
