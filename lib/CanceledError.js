const kInternals = Symbol('internals');
const kSignature = Symbol.for(`AxiosPromise.CanceledError`);

export class CanceledError extends Error {
  constructor(message, code) {
    super(message || 'canceled');
    const internal = this.constructor[kInternals];
    this.name = internal.name;
    this.code = code || internal.code;
  }

  static from(thing) {
    return this.isCanceledError(thing) ? thing : new this(thing instanceof Error ? thing.message : thing);
  }

  static isCanceledError(err) {
    return !!(err && err[kSignature]);
  }

  static addSignature(constructor) {
    typeof constructor === 'function' && (constructor.prototype[kSignature] = this[kInternals].code);
  }

  static rethrow(err, code) {
    if (this.isCanceledError(err) && (!code || code === err.code)) {
      throw err;
    }
  }

  static init(name, code) {
    this[kInternals] = {
      name,
      code: code || 'ERR_' + name.toUpperCase().replace(/ERROR$/, '')
    }

    this.addSignature(this);
  }
}

CanceledError.init('CanceledError');
