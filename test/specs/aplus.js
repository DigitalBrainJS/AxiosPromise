import {adapter} from '../adapter.js';
import tests from 'promises-aplus-tests';

describe("Promises/A+ Tests", function () {
  tests.mocha(adapter, {

  });
});
