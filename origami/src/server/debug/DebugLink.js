import AttributeMarshallingMixin from "./AttributeMarshallingMixin.js";

export default class DebugLink extends AttributeMarshallingMixin(HTMLElement) {
  constructor() {
    super();
    this._href = null;
  }

  get href() {
    return this._href;
  }
  set href(value) {
    this._href = value;
  }

  connectedCallback() {
    super.connectedCallback?.();

    // this.addEventListener("mouseover", (event) => {
    //   event.target.classList.add("highlight");
    //   let current = event.target.parentElement;
    //   while (current) {
    //     current.classList.remove("highlight");
    //     current = current.parentElement;
    //   }
    // });
    this.addEventListener("click", (event) => {
      // document.querySelectorAll(".selected").forEach((selected) => {
      //   selected.classList.remove("selected");
      // });
      // event.target.classList.add("selected");
      event.stopPropagation();
      this.dispatchEvent(
        new CustomEvent("navigate", {
          bubbles: true,
          detail: {
            href: this.href,
          },
        })
      );
    });
    // this.addEventListener("mouseleave", (event) => {
    //   event.target.classList.remove("highlight");
    // });
  }
}

customElements.define("debug-link", DebugLink);
