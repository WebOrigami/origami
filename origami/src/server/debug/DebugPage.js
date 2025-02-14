import DebugTrace from "./DebugTrace.js";

const html = String.raw;
const forceLoad = [DebugTrace];

export default class DebugPage extends HTMLElement {
  constructor() {
    super();
    // this._href = "/index.html";
    this._href = "/g";
  }

  connectedCallback() {
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = this.template;

    this.resultPane = root.getElementById("resultPane");
    // this.resultPath = root.getElementById("resultPath");
    // this.sourceFilePath = root.getElementById("sourceFilePath");
    this.tracePane = root.getElementById("tracePane");

    this.tracePane.addEventListener("navigate", (event) => {
      this.href = event.detail.href;
      console.log(this.href);
    });

    this.resultPane.addEventListener("load", () => {
      const location = this.resultPane.contentDocument.location;
      if (location.href !== "about:blank") {
        this.href = location.href;
      }
    });

    this.render();
  }

  // The href of the resource shown in the result pane
  get href() {
    return this._href;
  }
  set href(href) {
    if (href !== this._href) {
      this._href = href;
      this.render();
    }
  }

  render() {
    if (this.resultPane.contentDocument.location.href !== this.href) {
      this.resultPane.src = this.href;
    } else if (
      !this.href.startsWith(".result") &&
      this.tracePane.href !== this.href
    ) {
      this.tracePane.href = this.href;
    }
  }

  get template() {
    // <div>
    // Source file:
    // <span id="sourceFilePath" class="path"></span>
    // </div>

    // <div>
    // Result path:
    // <span id="resultPath" class="path"></span>
    // </div>

    return html`
      <style>
        :host {
          display: grid;
          grid-template-rows: auto 1fr;
        }

        #tracePane {
          debug-context::before {
            content: "=";
            margin-right: 0.25rem;
            visibility: hidden;
          }

          debug-context.selected + debug-context.selected::before {
            visibility: visible;
          }
        }

        #resultPane {
          border: 0;
          height: 100%;
          width: 100%;
        }
      </style>
      <debug-trace id="tracePane"></debug-trace>
      <iframe id="resultPane" name="resultPane"></iframe>
    `;
  }
}

customElements.define("debug-page", DebugPage);
