# Axios Promise

Lightweight Promises/A+ compatible implementation with cancellation, sync mode, timeouts, coroutines and signals support

<div align="center">

[![npm version](https://img.shields.io/npm/v/axios-promise.svg?style=flat-square)](https://www.npmjs.org/package/axios-promise)
[![Build status](https://img.shields.io/github/actions/workflow/status/digitalbrainjs/axiospromise/ci.yml?branch=master&label=CI&logo=github&style=flat-square)](https://github.com/digitalbrainjs/axios-promise/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/DigitalBrainJS/AxiosPromise/badge.svg?branch=master)](https://coveralls.io/github/DigitalBrainJS/AxiosPromise?branch=master)
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

## Intro

`AxiosPromise` is a `Promises/A+` compatible implementation with cancellation API extension, 
therefore, to start using it, you do not need to additionally learn a new and complex API.
All you need to know that every promise:
- has `.cancel([reason])` method
- has `.onCancel` subscriber for optional aborting long-running asynchronous operation inside a promise 

## Basic Examples

[Live demo](https://playcode.io/1424670)

```js
import { AxiosPromise } from 'axios-promise';

const p = new AxiosPromise((resolve, reject, {onCancel}) => {
  const timer = setTimeout(resolve, 1000, 123);
  onCancel((reason) => {
    console.log('clear timer', reason);
    clearTimeout(timer);
  });
}).then(
  v => console.log(`Done: ${v}`), 
  e => console.warn(`Fail: ${e}`)
);

setTimeout(()=> p.cancel(), 500);
```

Instead of using the plain `onCancel` listener you can subscribe to a `AbortSignal` instance for the same purpose.

You can also set onCancel handler by returning it from the promise executor function:

[Live demo](https://playcode.io/1449598)

```js
import { AxiosPromise } from 'axios-promise';

const p = new AxiosPromise((resolve) => {
  const timer = setTimeout(resolve, 1000, 123);
  return (reason) => {
    console.log('clear timer', reason);
    clearTimeout(timer);
  };
}).then(
  v => console.log(`Done: ${v}`), 
  e => console.warn(`Fail: ${e}`)
);

setTimeout(()=> p.cancel(), 500);
```

See [Live Playground](https://playcode.io/1411507) ([Version for Node](https://codesandbox.io/p/sandbox/quiet-sunset-km5o2b))

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
    AxiosPromise.delay(1000).listen(controller.signal).then(console.log, console.warn);
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

## Helpers
### bottleneck

A helper that creates a simple queue by decorating an asynchronous function.

`bottleneck(fn, options?: {concurrency: number, cancelRunning: boolean, sync: boolean, timeout: number, taskTimeout: number, queueTimeout: number})`

```js
  const fn = bottleneck(function* () {
    console.log('start');
    yield AxiosPromise.delay(2000);
    console.log('end');
    return 'foo'
  }, {concurrency: 1});

  const results = await Promise.allSettled([
    fn(),
    fn(),
    fn()
  ]);

  console.log(results.map(({status, reason, value}) => status + ' : ' + (reason?.toString() || value)))
```
Log:
```
start
end
start
end
start
end
[ 'fulfilled : foo', 'fulfilled : foo', 'fulfilled : foo' ]
````

### Options

`cancelRunning` - cancel running tasks if the concurrency limit is reached

```js
const fn = bottleneck(function* () {
  console.log('start');
  yield AxiosPromise.delay(2000);
  console.log('end');
  return 'foo'
}, {cancelRunning: true, concurrency: 1});

const results = await Promise.allSettled([
  fn(),
  fn(),
  fn()
]);

console.log(results.map(({status, reason, value}) => status + ' : ' + (reason?.message || value)))
```
Log:
```
start
end
[
  'rejected : CanceledError: task limit reached',
  'rejected : CanceledError: task limit reached',
  'fulfilled : foo'
]
```

`timeout/taskTimeout/queueTimeout` - use AxiosPromiseSync instead AxiosPromise

Sets appropriate timeouts

```js
(async () => {
  const fn = bottleneck(function* (t = 2000) {
    console.log('start');
    yield AxiosPromise.delay(t);
    console.log('end');
    return 'foo'
  }, {concurrency: 1, taskTimeout: 1000});

  const results = await Promise.allSettled([
    fn(),
    fn(),
    fn(500)
  ]);

  console.log(results.map(({status, reason, value}) => status + ' : ' + (reason?.toString() || value)))
})();
```

Log:

```
start
start
start
end
[
  'rejected : TimeoutError: task timeout',
  'rejected : TimeoutError: task timeout',
  'fulfilled : foo'
]
```

### Manual cancellation

```js
  const fn = bottleneck(function* (t = 2000) {
    console.log('start');
    yield AxiosPromise.delay(t);
    console.log('end');
    return 'foo'
  }, {concurrency: 1});

  const tasks = [
    fn(),
    fn(),
    fn()
  ];

  setTimeout(() => {
    tasks[1].cancel('Oops!');
  }, 500);

  const results = await Promise.allSettled(tasks);

  console.log(results.map(({status, reason, value}) => status + ' : ' + (reason?.toString() || value)))
```

Log:

```
start
end
start
end
[
  'fulfilled : foo',
  'rejected : CanceledError: Oops!',
  'fulfilled : foo'
]
```

## License

The MIT License Copyright (c) 2023 Dmitriy Mozgovoy robotshara@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
