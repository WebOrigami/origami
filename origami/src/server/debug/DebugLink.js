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
          cursor: pointer;
          display: inline-block;
        }

        :host(.selected) {
          /* background: color-mix(in oklch, SelectedItem, white 90%); */
          background: #666;
          color: white;
          font-weight: bold;
        }

        :host,
        ::slotted(*) {
          text-decoration: var(--text-decoration);
          text-decoration-color: currentColor;
          text-underline-offset: 4px;
        }

        :host(.highlight) {
          --text-decoration: underline;
        }
      </style>
      <slot></slot>
    `;
  }
}

customElements.define("debug-link", DebugLink);
