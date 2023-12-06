export default class EventEmitter {
  constructor(events) {
    this._events = events || {};
  }

  on(event, listener, prepend) {
    const events = this._events
    const listeners = events[event];

    events['newListener'] && this.emit('newListener', event, listener);

    if (!listeners) {
      events[event] = listener
    } else if (typeof listeners === 'function') {
      events[event] = prepend ? [listener, listeners] : [listeners, listener];
    } else {
      prepend ? listener.unshift(listener) : listeners.push(listener);
    }

    return this;
  }

  off(event, listener) {
    const events = this._events
    const listeners = events[event];
    let found = false;

    if (listeners) {
      if (typeof listeners === 'function') {
        if (listeners === listener) {
          events[event] = null;
          found = true;
        }
      } else {
        let i = listeners.length;
        while (i--) {
          if (listeners[i] === listener) {
            listeners.splice(i, 1);
            found = true;
            break;
          }
        }
      }
    }

    found && events['removeListener'] && this.emit('removeListener', event, listener);

    return found;
  }

  emit(event) {
    let listeners = this._events[event];
    if (!listeners) return false;

    const args = Array.from(arguments).slice(1);

    if (typeof listeners === 'function') {
      listeners.apply(null, args);
    } else {
      const l = listeners.length;
      l > 1 && (listeners = listeners.slice());
      for (let i = 0; i < l; i++) {
        listeners[i].apply(null, args);
      }
    }
    return true;
  }

  once(event, listener, prepend) {
    const once = () => {
      this.off(event, once);
      listener.apply(null, arguments);
    };

    return this.on(event, once, prepend);
  }

  listenerCount(event) {
    const listeners = this._events[event];
    return listeners ? (typeof listeners === 'function' ? 1 : listeners.length) : 0;
  }
}

const {prototype} = EventEmitter;

prototype.addEventListener = prototype.on;
prototype.removeEventListener = prototype.off;
