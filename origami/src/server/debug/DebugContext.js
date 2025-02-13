import AttributeMarshallingMixin from "./AttributeMarshallingMixin.js";
import DebugLink from "./DebugLink.js";

const html = String.raw;
const forceLoad = [DebugLink];

export default class DebugContext extends AttributeMarshallingMixin(
  HTMLElement
) {
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
  }

  get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <slot></slot>
    `;
  }
}

customElements.define("debug-context", DebugContext);
