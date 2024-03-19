import assert from 'assert';
import {bottleneck, AxiosPromise} from "../../lib/index.js";
import sinon from "sinon";
import {promisify} from 'util';

describe('bottleneck', () => {
  it('should support for concurrency', () => {
    let pending = 0;
    const concurrency = 2;

    const fn = bottleneck(function* () {
      assert.ok(pending++ < concurrency, `pending tasks count exceeds concurrency`);
      yield AxiosPromise.delay(100);
      pending--;
    }, {concurrency});

    return Promise.all([
      fn(),
      fn(),
      fn(),
      fn(),
    ])
  });

  it('should support for cancellation of preempted tasks', () => {
    const fn = bottleneck(function* () {
      yield AxiosPromise.delay(500);
    }, {cancelRunning: true, concurrency: 2});

    return Promise.all([
      assert.rejects(fn, /CanceledError/),
      assert.rejects(fn, /CanceledError/),
      fn(),
      fn(),
    ])
  })
});
