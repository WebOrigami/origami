/**
 * A transform stream that ensures the final chunk ends with a newline.
 */
export default class FinalNewlineStream extends TransformStream {
  constructor() {
    let lastChunk = null;

    super({
      flush(controller) {
        // Check if the last chunk ends with a newline
        if (!lastChunk.endsWith?.("\n")) {
          // Append a newline if not
          controller.enqueue("\n");
        }
      },

      transform(chunk, controller) {
        controller.enqueue(chunk);
        lastChunk = chunk;
      },
    });
  }
}
