// This is a crude version of the `Response` class used to enable support for
// Node 16.4 on Glitch, which is now quite old. Remove this when Glitch supports
// Node 18+.

class FakeResponse {
  constructor(body, options) {
    this.body = body;
    const headers = options.headers ?? {};
    this.headers = new Map(Object.entries(headers));
    this.status = options.status ?? 200;
    this.statusText = options.statusText ?? "ok";
  }

  isFake() {
    return true;
  }
}

export default Response = globalThis.Response ?? FakeResponse;
