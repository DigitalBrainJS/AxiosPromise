import utils from './utils.js';
import EventEmitter from "./EventEmitter.js";

const [kSignal, kAborted, kAbort] = utils.symbols('signal', 'aborted', 'abort');

const hasNativeSupport = typeof AbortController === 'function' && typeof AbortSignal === 'function';

const _AbortSignal = hasNativeSupport ? AbortSignal : class AbortSignal extends EventEmitter{
  constructor() {
    super();
    this[kAborted] = false;
  }

  get aborted() {
    return this[kAborted];
  }

  [kAbort]() {
    if (!this[kAborted]) {
      this[kAborted] = true;
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
