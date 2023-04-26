import {AxiosPromise} from '../lib/index.js';

export const adapter = {
  resolved: AxiosPromise.resolve.bind(AxiosPromise),
  rejected: AxiosPromise.reject.bind(AxiosPromise),
  deferred: function () {
    var resolve;
    var reject;

    return {
      promise: new AxiosPromise(function (_resolve, _reject) {
        resolve = _resolve;
        reject = _reject;
      }),
      resolve: resolve,
      reject: reject
    };
  }
};
