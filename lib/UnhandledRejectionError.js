export default class UnhandledRejectionError extends Error{
  constructor(err, message) {
    super((message ? message + ': ' : '') + (err.message || err), {cause: err});
    this.name = 'UnhandledRejectionError';
  }
}
