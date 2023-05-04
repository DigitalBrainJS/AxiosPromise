import assert from 'assert';
import {AxiosPromise, AxiosPromiseSync, AbortController} from "../../lib/index.js";

const noop = () => {
};

const waitForSignal = (signal) => new Promise((resolve) => signal.addEventListener('abort', resolve));


const createTimer = () => {
  let timestamp = Date.now();

  return () => Date.now() - timestamp;
}

const createTimeAssert = () => {
  let timestamp = Date.now();

  let value;

  const passed = () => (value = Date.now() - timestamp);

  return {
    passedAtLeast: (ms) => assert.ok(ms <= passed(), `${ms} ms have not passed (passed ${value} ms)`),
    passedLessThan: (ms) => assert.ok(ms > passed(), `passed more than ${ms} ms (passed ${value} ms)`)
  }
}

const assertPromiseStatus = (promise, name = 'promise') => {
  const p = Promise.allSettled([promise]);

  return {
    rejectedWith: async (reason) => {
      const [fulfilled] = await p;
      if (fulfilled.status !== 'rejected') {
        assert.fail(`${name} is not rejected`, fulfilled)
      }

      assert.deepStrictEqual(fulfilled.reason, reason);
    },

    canceledWith: async (code = 'ERR_CANCELED') => {
      const [fulfilled] = await p;
      if (fulfilled.status !== 'rejected') {
        assert.fail(`${name} is not rejected`, fulfilled)
      }

      assert.ok(AxiosPromise.isCanceledError(fulfilled.reason), 'rejected, but not cancelled');

      assert.strictEqual(fulfilled.reason.code, code);
    },

    resolvedWith: async (value) => {
      const [fulfilled] = await p;
      if (fulfilled.status !== 'fulfilled') {
        assert.fail(`${name} is not fulfilled`, fulfilled)
      }

      assert.deepStrictEqual(fulfilled.value, value);
    }
  }
}

[AxiosPromise, AxiosPromiseSync].forEach((PromiseConstructor) => {
  describe(PromiseConstructor.name, function () {

    const delay = (ms, value, reject, onCancel) => {
      return new PromiseConstructor((resolve, _reject, scope) => {
        let timer = setTimeout(reject ? _reject : resolve, ms, value);

        scope.onCancel(() => {
          clearTimeout(timer);
          timer = 0;
        });

        onCancel && scope.onCancel(onCancel);
      })
    }

    const delayNative = (ms, value) => new Promise((resolve) => setTimeout(resolve, ms, value));

    describe("cancellation", function () {
      it("should support cancellation on flat chain", async () => {
        const cancelAfter = 100;
        const timer = createTimer();
        const p = delay(500).then(() => {
          assert.fail("not canceled");
        }, (reason) => {
          if (!AxiosPromise.isCanceledError(reason)) {
            assert.fail("rejected for reasons other than cancellation");
          }

          if (timer() < cancelAfter - 10) {
            assert.fail("early cancellation");
          }
        });

        setTimeout(() => p.cancel(), cancelAfter);

        return p;
      });

      it("should support cancellation on deep chain", async () => {
        const cancelAfter = 200;
        const timer = createTimer();

        const p = delay(100).then(() => delay(500)).then(() => {
          assert.fail("not canceled");
        }, (reason) => {
          if (!AxiosPromise.isCanceledError(reason)) {
            assert.fail("rejected for reasons other than cancellation");
          }

          if (timer() < cancelAfter - 10) {
            assert.fail("early cancellation");
          }
        });

        setTimeout(() => p.cancel(), cancelAfter);

        return p;
      });

      it("should support onCancel handler", async () => {
        const cancelAfter = 200;
        const timer = createTimer();

        let invoked = false;

        const p = new PromiseConstructor((resolve, reject, {onCancel}) => {
          onCancel((reason) => {
            invoked = true;

            if (!AxiosPromise.isCanceledError(reason)) {
              assert.fail("rejected for reasons other than cancellation");
            }

            if (timer() < cancelAfter - 10) {
              assert.fail("early cancellation");
            }
          });
        }).then(() => {
          assert.fail("not canceled");
        }, () => {
          if (!invoked) {
            assert.fail('onCancel not called');
          }
        });

        setTimeout(() => p.cancel(), cancelAfter);

        return p;
      });

      it("should support returning onCancel handler from the executor function", async () => {
        const cancelAfter = 200;
        const timer = createTimer();

        let invoked = false;

        const p = new PromiseConstructor(() => {
          return (reason) => {
            invoked = true;

            if (!AxiosPromise.isCanceledError(reason)) {
              assert.fail("rejected for reasons other than cancellation");
            }

            if (timer() < cancelAfter - 10) {
              assert.fail("early cancellation");
            }
          };
        }).then(() => {
          assert.fail("not canceled");
        }, () => {
          if (!invoked) {
            assert.fail('onCancel not called');
          }
        });

        setTimeout(() => p.cancel(), cancelAfter);

        return p;
      });

      it("should support external AbortSignal", async () => {
        const cancelAfter = 100;
        const timer = createTimer();
        const controller = new AbortController();

        const p = delay(500).listen(controller.signal).then(() => {
          assert.fail("not canceled");
        }, (reason) => {
          if (!AxiosPromise.isCanceledError(reason)) {
            assert.fail("rejected for reasons other than cancellation");
          }

          if (timer() < cancelAfter - 10) {
            assert.fail("early cancellation");
          }
        });

        setTimeout(() => controller.abort(), cancelAfter);

        return p;
      });

      it("should support signal providing", async () => {
        const cancelAfter = 100;
        const timer = createTimer();

        const p = delay(500).then(() => {
          assert.fail("not canceled");
        }, (reason) => {
          if (!AxiosPromise.isCanceledError(reason)) {
            assert.fail("rejected for reasons other than cancellation");
          }

          if (timer() < cancelAfter - 10) {
            assert.fail("early cancellation");
          }

          throw reason;
        });

        setTimeout(() => p.cancel(), cancelAfter);

        return Promise.all([p.catch(noop), waitForSignal(p.signal)]);
      });

      it("should resolve .not cancelable thenables as detached chains", async () => {
        const timer = createTimeAssert();

        const p = PromiseConstructor.resolve(delayNative(200)).then(() => delay(100));

        setTimeout(() => p.cancel(), 100);

        await assertPromiseStatus(p).canceledWith();

        timer.passedAtLeast(100 - 5);
        timer.passedLessThan(200 + 5);
      });

      describe("timeouts", function () {
        it("should support timeouts", async () => {
          const cancelAfter = 100;
          const timer = createTimer();

          return delay(500).timeout(cancelAfter).then(() => {
            assert.fail("not canceled");
          }, (reason) => {
            if (!AxiosPromise.isCanceledError(reason)) {
              assert.fail("rejected for reasons other than cancellation");
            }

            if (timer() < cancelAfter - 10) {
              assert.fail("early cancellation");
            }
          });
        });
      });

      describe("atomic chain", function () {
        describe("mode ATOMIC_MODE_AWAIT", function () {
          it("should await for chain resolving before cancellation if the chain is in ATOMIC_MODE_AWAIT mode", async () => {
            const resolveDelay = 500;
            const cancelAfter = 100;
            const timer = createTimer();

            const p = delay(resolveDelay).atomic(AxiosPromise.ATOMIC_MODE_AWAIT).then(() => {
              assert.fail("not canceled");
            }, (reason) => {
              if (!AxiosPromise.isCanceledError(reason)) {
                assert.fail("rejected for reasons other than cancellation");
              }

              if (timer() < resolveDelay - 10) {
                assert.fail("early cancellation");
              }
            });

            setTimeout(() => p.cancel(), cancelAfter);

            return p;
          });
        });


        describe("mode ATOMIC_MODE_DETACHED", function () {
          it("should keep atomic chain in pending mode and cancel outer chain", async () => {
            const resolveDelay = 500;
            const cancelAfter = 100;
            const timer = createTimer();

            const pDelay = delay(resolveDelay, 'foo');

            const p = pDelay.atomic(true).then(() => {
              assert.fail("not canceled");
            }, (reason) => {
              if (!AxiosPromise.isCanceledError(reason)) {
                assert.fail("rejected for reasons other than cancellation");
              }

              if (timer() < cancelAfter - 10) {
                assert.fail("early cancellation");
              }
            });

            setTimeout(() => p.cancel(), cancelAfter);

            await delay(resolveDelay + 100);

            return Promise.all([pDelay.then((value) => {
              assert.strictEqual(value, 'foo');
            }), p]);
          });
        });
      });

      describe(".all", function () {
        it("should cancel pending chains when one rejected", async () => {
          const p1 = delay(500, new Error('test'), true);
          const p2 = delay(1000);

          try {
            await PromiseConstructor.all([p1, p2]);
          } catch (err) {
            assert.strictEqual(err.message, 'test');
          }

          await assertPromiseStatus(p2).canceledWith();
        });

        it("should cancel all pending chains on host promise cancellation", async () => {
          const p1 = delay(500);
          const p2 = delay(1000);

          const p = PromiseConstructor.all([p1, p2]);

          setTimeout(() => p.cancel(), 100);

          await Promise.all([
            assertPromiseStatus(p1).canceledWith(),
            assertPromiseStatus(p2).canceledWith()
          ]);
        });
      });

      describe(".race", function () {
        it("should cancel pending chains when one resolved", async () => {
          const p1 = delay(500);
          const p2 = delay(1000);

          try {
            await PromiseConstructor.race([p1, p2]);
          } catch (err) {
            assert.strictEqual(err.message, 'test');
          }

          await delay(100);

          await assertPromiseStatus(p2).canceledWith();
        });

        it("should cancel all pending chains on host promise cancellation", async () => {
          const p1 = delay(500);
          const p2 = delay(1000);

          const p = PromiseConstructor.race([p1, p2]);

          setTimeout(() => p.cancel(), 100);

          await assertPromiseStatus(p1).canceledWith();
          await assertPromiseStatus(p2).canceledWith();
        });
      });

      it("should be supported by generators", async () => {
        const p1 = delay(300);
        const p2 = delay(600);

        const p = PromiseConstructor.resolve().then(function* () {
          yield p1;
          yield p2;
        });

        setTimeout(() => {
          p.cancel();
        }, 100);

        await delay(100);

        await assertPromiseStatus(p, 'host promise').canceledWith('ERR_CANCELED');

        await assertPromiseStatus(p1, 'inner promise').canceledWith('ERR_CANCELED');
      });
    });

    describe('generators', () => {
      describe('then', () => {
        it("should resolve generators", async () => {
          const result = await PromiseConstructor.resolve(123).then(function* (v) {
            const x = yield delay(100, v + 1);
            return yield delay(100, x + 1);
          });

          assert.strictEqual(result, 125);
        });
      });

      describe('promisify', () => {
        it("should decorate the generator as async function", async () => {
          const result = await PromiseConstructor.promisify(function* (v) {
            const x = yield delay(100, v + 1);
            return yield delay(100, x + 1);
          })(123);

          assert.strictEqual(result, 125);
        });
      });

    });
  });

  describe('UnhandledRejection', () => {
    let originalHandler = AxiosPromise._unhandledRejection;
    let waringShowed = false;

    before(() => {
      AxiosPromise._unhandledRejection = () => {
        waringShowed = true;
      }
    });

    after(()=> {
      AxiosPromise._unhandledRejection = originalHandler;
    });

    afterEach(() => {
      waringShowed = false
    });

    it('should show unhandledRejection waring on uncaught chains', async() =>{
        new AxiosPromise((resolve, reject) =>{
          setTimeout(reject, 0, new Error('test'))
        });

        await AxiosPromise.delay(100);

        assert.ok(waringShowed);
    });

    it('should not show unhandledRejection waring with Promise.resolve', async() =>{
      const p = new AxiosPromise((resolve, reject) =>{
        setTimeout(reject, 50, new Error('test'))
      });

      await assert.rejects(p);

      await AxiosPromise.delay(100);

      assert.strictEqual(waringShowed, false);
    });

    it('should not show unhandledRejection waring with native await consuming', async() =>{
      const p = new AxiosPromise((resolve, reject) =>{
        setTimeout(reject, 50, new Error('test'))
      });

      await (async()=> {
        try {
          await p;
        } catch (err) {
          assert.strictEqual(err.message, 'test');
        }
      })();

      await AxiosPromise.delay(100);

      assert.strictEqual(waringShowed, false);
    });
  });

  describe('promisifyAll', () => {
    it('should decorate all Generator functions to async function that uses custom Promise constructor', async () => {
      const obj = {
        *foo(v) {
          return v;
        }
      };

      PromiseConstructor.promisifyAll(obj);

      const ret = obj.foo(123);
      assert.ok(ret instanceof PromiseConstructor);
      assert.strictEqual(await ret, 123);
    });

    it('should support reducer option', async () => {
      const obj = {
        *foo(v) {
          return v;
        }
      };

      PromiseConstructor.promisifyAll(obj, {reducer: (k) => k +'Async'});

      const ret = obj.fooAsync(123);
      assert.ok(ret instanceof PromiseConstructor);
      assert.strictEqual(await ret, 123);
    });
  })
});

