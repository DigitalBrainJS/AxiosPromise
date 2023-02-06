import {AxiosPromise} from '../lib/index.js';

/*export const adapter = {
  resolved: Promise.resolve.bind(Promise),
  rejected: Promise.reject.bind(Promise),
  deferred: function () {
    var resolve;
    var reject;

    return {
      promise: new Promise(function (_resolve, _reject) {
        resolve = _resolve;
        reject = _reject;
      }),
      resolve: resolve,
      reject: reject
    };
  }
};*/


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
