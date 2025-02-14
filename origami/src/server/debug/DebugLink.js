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
      let current = event.target;
      while (current && !(current instanceof DebugLink)) {
        current = event.target.parentElement;
      }
      if (current) {
        current.classList.add("highlight");
        current = current.parentElement;
        while (current) {
          current.classList.remove("highlight");
          current = current.parentElement;
        }
      }
    });
  }

  get template() {
    return html`
      <style>
        :host {
          --link-background: transparent;
          --border-color: #666;
          --padding: 0.4rem;
          border-bottom-width: 0;
          border-color: var(--border-color);
          border-left-width: 1px;
          border-right-width: 1px;
          border-style: solid;
          border-top-width: 0;
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

        ::slotted(debug-link:first-child) {
          border-left: none;
        }
        ::slotted(debug-link:last-child) {
          border-right: none;
        }

        ::slotted(debug-link:not(:has(*))) {
          padding-left: var(--padding);
          padding-right: var(--padding);
        }
        ::slotted(span) {
          padding-left: var(--padding);
          padding-right: var(--padding);
        }
      </style>
      <slot></slot>
    `;
  }
}

customElements.define("debug-link", DebugLink);
