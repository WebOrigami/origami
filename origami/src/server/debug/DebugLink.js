import AttributeMarshallingMixin from "./AttributeMarshallingMixin.js";

const html = String.raw;

export default class DebugLink extends AttributeMarshallingMixin(HTMLElement) {
  constructor() {
    super();
    this._href = null;
  }

  get href() {
    return this._href;
  }
  set href(href) {
    this._href = href;
  }

  connectedCallback() {
    super.connectedCallback?.();

    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = this.template;

    this.addEventListener("click", (event) => {
      // document.querySelectorAll(".selected").forEach((selected) => {
      //   selected.classList.remove("selected");
      // });
      // event.target.classList.add("selected");
      event.stopPropagation();
      this.dispatchEvent(
        new CustomEvent("linkclick", {
          bubbles: true,
          detail: {
            href: this.href,
          },
        })
      );
    });
    this.addEventListener("mouseleave", (event) => {
      event.target.classList.remove("highlight");
    });
    this.addEventListener("mouseover", (event) => {
      event.target.classList.add("highlight");
      let current = event.target.parentElement;
      while (current) {
        current.classList.remove("highlight");
        current = current.parentElement;
      }
    });
  }

  get template() {
    return html`
      <style>
        :host {
          --link-background: transparent;
          border: 1px solid var(--link-border);
          cursor: pointer;
          display: inline-block;
        }

        :host(.highlight) {
          --link-background: #444;
        }

        :host(.selected) {
          --link-background: #666;
          color: white;
          font-weight: bold;
        }

        :host {
          background: var(--link-background);
        }

        ::slotted(debug-link) {
          border-top: none;
          border-bottom: none;
        }
      </style>
      <slot></slot>
    `;
  }
}

customElements.define("debug-link", DebugLink);
