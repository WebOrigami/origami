/**
 * A wrapper around a ReadableStream that caches the data as it is read so that
 * it can be read multiple times.
 */
export default class StreamBuffer {
  /**
   * @param {ReadableStream} stream
   */
  constructor(stream) {
    this._bytes = null;
    this._stream = stream;
  }

  /**
   * Returns the data as a Uint8Array.
   */
  async bytes() {
    if (!this._bytes) {
      // Read the stream, which will cache the bytes
      // @ts-ignore The unused `chunk` is intentional
      for await (const chunk of this.stream) {
        // Do nothing; the loop itself causes the stream to be read
      }
    }
    return this._bytes;
  }

  get read() {
    return this._bytes !== null;
  }

  /**
   * Returns the original stream.
   */
  get stream() {
    if (this._bytes) {
      return ReadableStream.from(this._bytes);
    }

    let totalLength = 0;
    const chunks = [];
    const streamBuffer = this;

    const cacheStream = new TransformStream({
      transform(chunk, controller) {
        // Save the chunk
        const array =
          chunk instanceof Uint8Array ? chunk : new TextEncoder().encode(chunk);
        chunks.push(array);
        totalLength += chunk.length;

        // Enqueue the chunk to the transformed stream
        controller.enqueue(chunk);
      },

      flush() {
        // Create a single Uint8Array to hold all the data
        const bytes = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          bytes.set(chunk, offset);
          offset += chunk.length;
        }

        streamBuffer._bytes = bytes;
      },
    });

    return this._stream.pipeThrough(cacheStream);
  }

  /**
   * Return the data as UTF-8 text.
   */
  async text() {
    const bytes = await this.bytes();
    return new TextDecoder().decode(bytes);
  }
}
