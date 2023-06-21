import EventTargetMixin from "../../src/framework/EventTargetMixin.js";
import assert from "../assert.js";

class EventTargetTest extends EventTargetMixin(Object) {}

describe("EventTargetMixin", () => {
  it("add and dispatch event", () => {
    const fixture = new EventTargetTest();
    const event = new Event("test");
    let callCount = 0;
    const callback = () => {
      callCount++;
    };
    fixture.addEventListener("test", callback);
    // Add twice, ensure that the callback is only called once.
    fixture.addEventListener("test", callback);
    const dispatched = fixture.dispatchEvent(event);
    assert(dispatched);
    assert.equal(callCount, 1);
  });

  it("dispatch event with no listeners", () => {
    const fixture = new EventTargetTest();
    const event = new Event("test");
    const takeDefaultAction = fixture.dispatchEvent(event);
    assert(takeDefaultAction);
  });

  it("remove event listener", () => {
    const fixture = new EventTargetTest();
    const event = new Event("test");
    let callCount = 0;
    const callback = () => {
      callCount++;
    };
    fixture.addEventListener("test", callback);
    fixture.removeEventListener("test", callback);
    fixture.dispatchEvent(event);
    assert.equal(callCount, 0);
  });

  it("stop immediate propagation", () => {
    const fixture = new EventTargetTest();
    const event = new Event("test");
    let callCount = 0;
    fixture.addEventListener("test", (event) => {
      callCount++;
      event.stopImmediatePropagation();
    });
    fixture.addEventListener("test", () => {
      callCount++;
    });
    fixture.dispatchEvent(event);
    assert.equal(callCount, 1);
  });

  it("prevent default", () => {
    const fixture = new EventTargetTest();
    const event = new Event("test");
    fixture.addEventListener("test", (event) => {
      event.preventDefault();
    });
    const takeDefaultAction = fixture.dispatchEvent(event);
    assert(!takeDefaultAction);
    assert(event.defaultPrevented);
  });
});
