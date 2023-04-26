import {CanceledError} from './CanceledError.js';

export class TimeoutError extends CanceledError {
  constructor(messageOrTimeout, code) {
    super(typeof messageOrTimeout === 'number' ? `${messageOrTimeout} ms timeout exceeded` : messageOrTimeout, code);
  }
}

TimeoutError.init('TimeoutError');

