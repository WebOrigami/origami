import crypto from "node:crypto";
import pack from "./pack.js";

export default function hash(value, key) {
  const buffer = pack(value, key);
  return crypto.createHash("sha1").update(buffer).digest("hex");
}
