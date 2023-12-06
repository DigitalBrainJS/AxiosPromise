import assert from 'assert';
import {EventEmitter} from "../../lib/index.js";
import sinon from "sinon";

describe('Event Emitter', () => {
  describe('emit', () => {
    it('should not crash when the listener is removed during emit', () =>{
      const once = sinon.spy();
      const regular = sinon.spy();

      const ee = new EventEmitter();

      ee.once('test', once);
      ee.on('test', regular);

      ee.emit('test');
      ee.emit('test');

      assert(once.calledOnce);
      assert(regular.calledTwice);
    })
  });
});
