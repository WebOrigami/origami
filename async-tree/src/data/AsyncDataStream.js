/**
 * An AsyncData implementation that reads data from a ReadableStream and offers
 * the same data access methods as an HTTP Response object.
 *
 * @typedef {import("../../index.ts").AsyncData} AsyncData
 * @implements {AsyncData}
 */
export default class AsyncDataStream {
  /**
   * @param {ReadableStream} stream
   */
  constructor(stream) {
    this.stream = stream;
  }

  /**
   * Returns the data as an ArrayBuffer.
   */
  async arrayBuffer() {
    const bytes = await this.bytes();
    return bytes.buffer;
  }

  /**
   * Returns the data as a Blob.
   */
  async blob() {
    const bytes = await this.bytes();
    return new Blob([bytes]);
  }

  /**
   * Returns the data as a ReadableStream.
   */
  get body() {
    return this.stream;
  }

  /**
   * Returns the data as a Uint8Array.
   */
  async bytes() {
    const chunks = [];
    for await (const chunk of this.stream) {
      chunks.push(chunk);
    }

    const size = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(size);

    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  }

  /**
   * Return the data as UTF-8 text.
   */
  async text() {
    const bytes = await this.bytes();
    return new TextDecoder().decode(bytes);
  }
}
