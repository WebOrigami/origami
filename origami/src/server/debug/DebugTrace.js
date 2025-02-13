import AttributeMarshallingMixin from "./AttributeMarshallingMixin.js";
import DebugLink from "./DebugLink.js";

const html = String.raw;
const forceLoad = [DebugLink];

export default class DebugTrace extends AttributeMarshallingMixin(HTMLElement) {
  constructor() {
    super();
    this._href = null;
    this._tracedResultPath = null;
  }

  connectedCallback() {
    super.connectedCallback?.();

    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = this.template;

    this.addEventListener("linkclick", (event) => {
      const directResult = event.detail.href === "/";
      const href = directResult
        ? this._tracedResultPath
        : `/.results${this._tracedResultPath}/-${event.detail.href}`;
      this.dispatchEvent(
        new CustomEvent("navigate", {
          bubbles: true,
          detail: {
            href,
          },
        })
      );
    });
  }

  // The href of the resource being traced
  get href() {
    return this._href;
  }
  set href(href) {
    if (href !== this._href) {
      this._href = href;
      this.render();
    }
  }

  async render() {
    const newResultPath = resultPath(this.href);
    if (newResultPath === this._tracedResultPath) {
      // Already traced
      return;
    }
    this._tracedResultPath = newResultPath;

    const tracePathname = `/.trace${newResultPath}`;
    const origin = new URL(this.href).origin;
    const traceUrl = new URL(tracePathname, origin);
    const traceResponse = await fetch(traceUrl);
    const traceHtml = await traceResponse.json();

    // sourceFilePath.textContent = new URL(url).pathname;
    this.innerHTML = traceHtml;
  }

  get template() {
    return html`
      <style>
        :host {
          --color-highlight: white;
          background: #222;
          color: #999;
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
          font-family: monospace;
          font-size: 14px;
          gap: 1rem;
          margin: 0;
          padding: 1rem;
        }

        pre {
          line-height: 1.5;
          margin: 0;
          padding: 0 0 0 2ch;
        }

        #sourceFilePath {
          /* color: var(--color-highlight); */
        }
      </style>
      <slot></slot>
    `;
  }
}

// Return the result path for a given href
function resultPath(href) {
  let keys = new URL(href).pathname.split("/");
  // Remove empty string at the beginning
  keys.shift();
  if (keys[0] === ".results") {
    // Currently showing a point in the result decomposition
    keys.shift();
    const markerIndex = keys.indexOf("-");
    if (markerIndex >= 0) {
      // Remove everything after the marker
      keys = keys.slice(0, markerIndex);
    }
  } else {
    // Raw resource from original site, use path as is
  }
  // Restore leading slash
  keys.unshift("");
  return keys.join("/");
}

customElements.define("debug-trace", DebugTrace);
