import AttributeMarshallingMixin from "./AttributeMarshallingMixin.js";
import DebugLink from "./DebugLink.js";

const html = String.raw;
// @ts-ignore
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
          --border-color: #666;
          display: block;
          line-height: 1.75;
          margin: 2px 0;
        }
      </style>
      <slot></slot>
    `;
  }
}

customElements.define("debug-context", DebugContext);
