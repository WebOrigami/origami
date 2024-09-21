import assert from "node:assert";
import { describe, test } from "node:test";
import calendarTree from "../src/calendarTree.js";
import { toPlainValue } from "../src/utilities.js";

describe("calendarTree", () => {
  test("without a start or end, returns a tree for today", async () => {
    const tree = calendarTree();
    const plain = await toPlainValue(tree);
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");
    assert.deepEqual(plain, {
      [year]: {
        [month]: {
          [day]: null,
        },
      },
    });
  });

  test("returns a tree for a month range", async () => {
    const tree = calendarTree("2025-01", "2025-02");
    const plain = await toPlainValue(tree);
    assert.deepEqual(plain, {
      2025: {
        "01": {
          "01": null,
          "02": null,
          "03": null,
          "04": null,
          "05": null,
          "06": null,
          "07": null,
          "08": null,
          "09": null,
          10: null,
          11: null,
          12: null,
          13: null,
          14: null,
          15: null,
          16: null,
          17: null,
          18: null,
          19: null,
          20: null,
          21: null,
          22: null,
          23: null,
          24: null,
          25: null,
          26: null,
          27: null,
          28: null,
          29: null,
          30: null,
          31: null,
        },
        "02": {
          "01": null,
          "02": null,
          "03": null,
          "04": null,
          "05": null,
          "06": null,
          "07": null,
          "08": null,
          "09": null,
          10: null,
          11: null,
          12: null,
          13: null,
          14: null,
          15: null,
          16: null,
          17: null,
          18: null,
          19: null,
          20: null,
          21: null,
          22: null,
          23: null,
          24: null,
          25: null,
          26: null,
          27: null,
          28: null,
        },
      },
    });
  });

  test("returns a tree for a day range", async () => {
    const tree = calendarTree("2025-02-27", "2025-03-02");
    const plain = await toPlainValue(tree);
    assert.deepEqual(plain, {
      2025: {
        "02": {
          27: null,
          28: null,
        },
        "03": {
          "01": null,
          "02": null,
        },
      },
    });
  });
});
