import { counters, volatile } from "@weborigami/language";

export default function syscount() {
  return volatile(counters);
}
