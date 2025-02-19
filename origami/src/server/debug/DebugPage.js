import DebugTrace from "./DebugTrace.js";

const html = String.raw;
const forceLoad = [DebugTrace];

export default class DebugPage extends HTMLElement {
  constructor() {
    super();
    // this._href = "/index.html";
    // this._href = "/greet.html";
    this._href = "/g";
  }

  connectedCallback() {
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = this.template;

    this.resultPane = root.getElementById("resultPane");
    // this.resultPath = root.getElementById("resultPath");
    // this.sourceFilePath = root.getElementById("sourceFilePath");
    this.tracePane = root.getElementById("tracePane");

    this.resultPane.addEventListener("load", () => {
      const contentDocument = this.resultPane.contentDocument;
      const location = contentDocument.location;
      if (location.href !== "about:blank") {
        this.href = location.href;
        const title =
          contentDocument.title.length > 0
            ? contentDocument.title
            : contentDocument.location.pathname;
        document.title = `Debug ${title}`;
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
          --dim-text: #aaa;
          color: #f0f0f0;
          display: grid;
          grid-template-rows: minmax(auto, max-content) 1fr;
        }

        #tracePane {
          background: #222;
          font-family: monospace;
          font-size: 15px;
          /* max-height: 50%; */
          overflow: auto;
          padding: 2ch;

          ul {
            margin-bottom: 0.5rem;
            padding-left: 2ch;
          }

          > ul {
            margin: 0;
            padding: 0;
          }

          li {
            list-style: none;

            a {
              color: inherit;
              display: inline-grid;
              gap: 1ch;
              grid-template-columns: repeat(2, minmax(0, auto));
              padding: 0.25rem;
              text-decoration: none;

              &:hover {
                background: #555;
              }

              > * {
                min-width: 0;
                overflow: clip;
                text-wrap: nowrap;
              }

              code {
                font-style: normal;
              }

              span {
                color: var(--dim-text);
                font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
              }
            }
          }

          div {
            color: var(--dim-text);
            padding: 0.25rem;
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
