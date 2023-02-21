# Axios Promise

Lightweight Promises/A+ compatible implementation with cancellation, sync mode, timeouts, coroutines and signals support

<div align="center">

[![npm version](https://img.shields.io/npm/v/axios-promise.svg?style=flat-square)](https://www.npmjs.org/package/axios-promise)
[![CDNJS](https://img.shields.io/cdnjs/v/axios-promise.svg?style=flat-square)](https://cdnjs.com/libraries/axios-promise)
[![Build status](https://img.shields.io/github/actions/workflow/status/digitalbrainjs/axios-promise/ci.yml?branch=master&label=CI&logo=github&style=flat-square)](https://github.com/digitalbrainjs/axios-promise/actions/workflows/ci.yml)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/axios-promise?style=flat-square)](https://bundlephobia.com/package/axios-promise@latest)
[![npm downloads](https://img.shields.io/npm/dm/axios-promise.svg?style=flat-square)](https://npm-stat.com/charts.html?package=axios-promise)

</div>

## Installing

Using npm:

```bash
$ npm install axios-promise
```

```js
import {AxiosPromise, AxiosPromiseSync} from 'axios-promise';
```

## Basic Examples

See [Live Playground](https://codesandbox.io/s/tender-pond-wy5ujx?file=/src/index.js)

```js
function cancelableFetch(url) {
    return new AxiosPromise((resolve, reject, {signal}) => {
        fetch(url, {signal}).then(resolve, reject)
    });
}

const p = cancelableFetch('http://httpbin.org/get').then((response) => response.json()).then(console.log);

// p.cancel();
```

OR

````js
const p = cancelableFetch('http://httpbin.org/get').then(function*(response) {
  const json = yield response.json();
  console.log(json);
});
````

OR

````js
const requestJSON = AxiosPromise.promisify(function*({signal}, url) {
  const response = yield fetch(url, {signal});
  const json = yield response.json();
  console.log(json);
}, {scopeArg: true});

const p = requestJSON('http://httpbin.org/get');

// p.cancel();
````

## Features

- no dependencies, less than `5KB` gzipped

- provides two classes: 
    - `AxiosPromise` - Promises/A+ compatible implementation
    - `AxiosPromiseSync` - a subclass of `AxiosPromise` but with synchronous chains resolution

- recursive cancellation by rejecting the deepest promise in the chain with a special `CanceledError` reason

    > Note: AxiosPromise passes an additional scope argument to the executor function and `then` handlers, which refers to the promise context.
    
    ```js
    const p = new AxiosPromise((resolve, reject, scope) => {
      const timer = setTimeout(resolve, 1000);
      scope.onCancel(() => clearTimeout(timer));
    }).then((value, scope) => console.log(value), (reason, scope) => console.warn(reason));
    
    setTimeout(() => p.cancel(), 100);
    ```
  
- cancellable delay helper
    ```js
    await AxiosPromise.delay(1000, 'foo');
    ```  

- timeouts - each promise has a `timeout` setter

    ```js
    await AxiosPromise.delay(1000).timeout(100);
    ```

- subscribing to an external `AbortSignal`

    ```js
    const controller = new AbortController();
    AxiosPromise.delay(1000).listen(controller).then(console.log, console.warn);
    setTimeout(() => controller.abort(), 100);
    ```

- Providing an `AbortSignal` to subscribe - every promise has a `signal` getter that you can subscribe to

    ```js
    AxiosPromise.delay(1000).timeout(100).signal.addEventListener('abort', () => console.log('canceled'));
    ```

- atomic chains - makes sub-chain not cancellable when canceled from upper chain
    - `AWAIT = false` mode (default value) - waits for the atomic sub-chain to resolve before canceling the upper chain

        ```js
        const p = AxiosPromise.delay(1000).atomic(false).then(() => AxiosPromise.delay(1000)).then(console.log, console.warn);
        
        p.cancel(); // will wait for the first promise and then cancel the rest
        ```

    - `DETACHED = true` mode - does not wait for the atomic sub-chain to resolve, but cancels the upper chain.

        ```js
        const p = AxiosPromise.delay(1000).atomic(true).then(() => AxiosPromise.delay(1000)).then(console.log, console.warn);
        
        p.cancel(); // will keep the first promise pending and cancel the rest of the chain
        ```
- coroutines - write flat cancelable code as if you were using ECMA asynchronous functions

    ```js
    const myAsyncFunc = AxiosPromise.promisify(function*(str) {
      const newStr = yield AxiosPromise.delay(1000, 'Hello ') + str;
      return newStr;
    });
  
    const p = myAsyncFunc(123).then(function*(value) {
      yield AxiosPromise.delay(1000);
      console.log(`It supports generators in then method, result is:`, value);
    });
  
    //p.cancel();
    ```
- `.all` method will cancel all pending promises if one rejected 
- `.race` method will cancel all pending promises if one resolved 
- `finally` method handles a status entry as the first argument

## Error handling

Cancelling chain means rejecting its deepest promise with a `CanceledError` reason.

```js
const p = new AxiosPromise((resolve, reject, {onCancel}) => {
  const timer = setTimeout(()=> {
    Math.random() > 0.5 ? reject(new Error('Oops!')) : resolve('foo');
  }, 1000);
  onCancel(() => clearTimeout(timer));
}).then((value) => {
  return value + 'bar';
}).catch((err) => {
  // re-throw the error if this is an instance of CanceledError to handle it with upper chains
  CanceledError.rethow(err);
  console.log('Error', err)
});
```

> Note: uncaught `CanceledError` rejection won't lead to `unhandledrejection` warning 

## License

The MIT License Copyright (c) 2023 Dmitriy Mozgovoy robotshara@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
