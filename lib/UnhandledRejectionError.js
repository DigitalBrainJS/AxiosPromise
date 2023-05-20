export default class UnhandledRejectionError extends Error{
  constructor(err, message) {
    super((message ? message + ': ' : '') + err.message, {cause: err});
    err.name = 'UnhandledRejectionError';
  }
}
