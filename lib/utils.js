const {
  hasOwn = (({hasOwnProperty}) => (obj, prop) => hasOwnProperty.call(obj, prop))(Object.prototype)
} = Object;

const {toStringTag} = Symbol;

const isFunction = (thing) => typeof thing === 'function';

const _global = typeof globalThis === 'object' && globalThis ||
  (typeof global !== "undefined" && global) ||
  (typeof self !== "undefined" && self) || window

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
  isFunction(_global.postMessage)
);

const asap = typeof queueMicrotask !== 'undefined' ?
  queueMicrotask : ( typeof process !== 'undefined' && process.nextTick || _setImmediate);

const functionTypeTest = ({constructor}) => {
  const {name} = constructor;
  return (thing) => thing && isFunction(thing) && (thing.constructor === constructor || (name && thing.constructor.name === name));
}

const isGeneratorFunction = functionTypeTest(function* () {});

const isAsyncFunction = functionTypeTest(async () => {});

const isPlainFunction = functionTypeTest(() => {});

const isGenerator = (obj) =>
  obj && typeof obj === 'object' && typeof obj.next === 'function' && typeof obj.throw === 'function' &&
  obj[toStringTag] === 'Generator';

const isContextDefined = (context) => context != null && context !== _global;

const lazyBind = (obj, props, {bindMethods = true} = {}) => {
  const symbols = {};

  props.forEach(prop => {
    const symbol = Symbol(`${prop}Lazy`);
    const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
    const {value, get, enumerable} = descriptor;

    if('value' in descriptor && !isFunction(value)) {
      return;
    }

    Object.defineProperty(obj, prop, {
      get() {
        if (hasOwn.call(this, symbol)) {
          return this[symbol];
        }

        const resolvedValue = get ? get.call(this) : value;

        const boundContext = this;

        return this[symbol] = bindMethods && isFunction(resolvedValue) ? function () {
          return resolvedValue.apply(isContextDefined(this) ? this : boundContext, arguments);
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
}

const defineConstants = (obj, props, {configurable = true, enumerable = true} = {}) => {
  const descriptors = {};

  Object.getOwnPropertyNames(props).forEach((prop) => {
    descriptors[prop] = {value: props[prop], enumerable, configurable}
  })

  Object.defineProperties(obj, descriptors);
};

const isAbortSignal = (thing) => {
  return thing &&
    typeof thing === 'object' &&
    typeof thing.aborted === 'boolean' &&
    isFunction(thing.addEventListener) &&
    isFunction(thing.removeEventListener);
}

const isAbortController = (thing) => {
  return thing && typeof thing === 'object' && isFunction(thing.abort) && isAbortSignal(thing.signal);
};

const symbols = (...tags) => ({
  * [Symbol.iterator]() {
    while (true) {
      yield Symbol(tags.shift() || '');
    }
  }
})

export default {
  global: _global,
  setImmediate: _setImmediate,
  asap,
  isGeneratorFunction,
  isFunction,
  isAsyncFunction,
  isPlainFunction,
  functionTypeTest,
  isContextDefined,
  hasOwn,
  lazyBind,
  isGenerator,
  defineConstants,
  isAbortSignal,
  isAbortController,
  symbols
}
