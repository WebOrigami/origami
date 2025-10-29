import ConstantMap from "../drivers/ConstantMap.js";

export default function constant(value) {
  return new ConstantMap(value);
}
