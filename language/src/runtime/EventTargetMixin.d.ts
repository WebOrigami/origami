import { Mixin } from "../../index.ts";

declare const EventTargetMixin: Mixin<{
  addEventListener(type: string, listener: EventListener): void;
  dispatchEvent(event: Event): boolean;
  removeEventListener(type: string, listener: EventListener): void;
}>;

export default EventTargetMixin;
