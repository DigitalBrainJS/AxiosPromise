import {CanceledError} from './CanceledError.js';

export class TimeoutError extends CanceledError {
  constructor(messageOrTimeout) {
    super(typeof messageOrTimeout === 'number' ? `${messageOrTimeout} ms timeout exceeded` : messageOrTimeout);
  }
}

TimeoutError.init('TimeoutError');

