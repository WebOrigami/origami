const listenersKey = Symbol("listeners");

export default function EventTargetMixin(Base) {
  // Based on https://github.com/piranna/EventTarget.js
  return class EventTarget extends Base {
    constructor(...args) {
      super(...args);
      this[listenersKey] = {};
    }

    addEventListener(type, callback) {
      if (!callback) {
        return;
      }

      let listenersOfType = this[listenersKey][type];
      if (!listenersOfType) {
        this[listenersKey][type] = [];
        listenersOfType = this[listenersKey][type];
      }

      // Don't add the same callback twice.
      if (listenersOfType.includes(callback)) {
        return;
      }

      listenersOfType.push(callback);
    }

    dispatchEvent(event) {
      if (!(event instanceof Event)) {
        throw TypeError("Argument to dispatchEvent must be an Event");
      }

      let stopImmediatePropagation = false;
      let defaultPrevented = false;

      if (!event.cancelable) {
        Object.defineProperty(event, "cancelable", {
          value: true,
          enumerable: true,
        });
      }
      if (!event.defaultPrevented) {
        Object.defineProperty(event, "defaultPrevented", {
          get: () => defaultPrevented,
          enumerable: true,
        });
      }
      // 2023-09-11: Setting isTrusted causes exception on Glitch
      // if (!event.isTrusted) {
      //   Object.defineProperty(event, "isTrusted", {
      //     value: false,
      //     enumerable: true,
      //   });
      // }
      if (!event.target) {
        Object.defineProperty(event, "target", {
          value: this,
          enumerable: true,
        });
      }
      if (!event.timeStamp) {
        Object.defineProperty(event, "timeStamp", {
          value: new Date().getTime(),
          enumerable: true,
        });
      }

      event.preventDefault = function () {
        if (this.cancelable) {
          defaultPrevented = true;
        }
      };
      event.stopImmediatePropagation = function () {
        stopImmediatePropagation = true;
      };
      event.stopPropagation = function () {
        // This is a no-op because we don't support event bubbling.
      };

      const type = event.type;
      const listenersOfType = this[listenersKey][type] || [];
      for (const listener of listenersOfType) {
        if (stopImmediatePropagation) {
          break;
        }
        listener.call(this, event);
      }

      return !event.defaultPrevented;
    }

    removeEventListener(type, callback) {
      if (!callback) {
        return;
      }

      let listenersOfType = this[listenersKey][type];
      if (!listenersOfType) {
        return;
      }

      // Remove callback from listeners.
      listenersOfType = listenersOfType.filter(
        (listener) => listener !== callback
      );

      // If there are no more listeners for this type, remove the type.
      if (listenersOfType.length === 0) {
        delete this[listenersKey][type];
      } else {
        this[listenersKey][type] = listenersOfType;
      }
    }
  };
}
