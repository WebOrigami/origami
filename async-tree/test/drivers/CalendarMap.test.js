import assert from "node:assert";
import { describe, test } from "node:test";
import CalendarMap from "../../src/drivers/CalendarMap.js";
import toPlainValue from "../../src/utilities/toPlainValue.js";

describe("CalendarMap", () => {
  test("without a start or end, returns a map for today", async () => {
    const map = new CalendarMap();
    const plain = await toPlainValue(map);
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");
    assert.deepEqual(plain, {
      [year]: {
        [month]: {
          [day]: `${year}-${month}-${day}`,
        },
      },
    });
  });

  test("returns a map for a month range", async () => {
    const map = new CalendarMap({
      start: "2025-01",
      end: "2025-02",
    });
    const plain = await toPlainValue(map);
    assert.deepEqual(plain, {
      2025: {
        "01": {
          "01": "2025-01-01",
          "02": "2025-01-02",
          "03": "2025-01-03",
          "04": "2025-01-04",
          "05": "2025-01-05",
          "06": "2025-01-06",
          "07": "2025-01-07",
          "08": "2025-01-08",
          "09": "2025-01-09",
          10: "2025-01-10",
          11: "2025-01-11",
          12: "2025-01-12",
          13: "2025-01-13",
          14: "2025-01-14",
          15: "2025-01-15",
          16: "2025-01-16",
          17: "2025-01-17",
          18: "2025-01-18",
          19: "2025-01-19",
          20: "2025-01-20",
          21: "2025-01-21",
          22: "2025-01-22",
          23: "2025-01-23",
          24: "2025-01-24",
          25: "2025-01-25",
          26: "2025-01-26",
          27: "2025-01-27",
          28: "2025-01-28",
          29: "2025-01-29",
          30: "2025-01-30",
          31: "2025-01-31",
        },
        "02": {
          "01": "2025-02-01",
          "02": "2025-02-02",
          "03": "2025-02-03",
          "04": "2025-02-04",
          "05": "2025-02-05",
          "06": "2025-02-06",
          "07": "2025-02-07",
          "08": "2025-02-08",
          "09": "2025-02-09",
          10: "2025-02-10",
          11: "2025-02-11",
          12: "2025-02-12",
          13: "2025-02-13",
          14: "2025-02-14",
          15: "2025-02-15",
          16: "2025-02-16",
          17: "2025-02-17",
          18: "2025-02-18",
          19: "2025-02-19",
          20: "2025-02-20",
          21: "2025-02-21",
          22: "2025-02-22",
          23: "2025-02-23",
          24: "2025-02-24",
          25: "2025-02-25",
          26: "2025-02-26",
          27: "2025-02-27",
          28: "2025-02-28",
        },
      },
    });
  });

  test("returns a map for a day range", async () => {
    const map = new CalendarMap({
      start: "2025-02-27",
      end: "2025-03-02",
      // Exercise custom value function
      value: (year, month, day) => `${year}.${month}.${day}`,
    });
    const plain = await toPlainValue(map);
    assert.deepEqual(plain, {
      2025: {
        "02": {
          27: "2025.02.27",
          28: "2025.02.28",
        },
        "03": {
          "01": "2025.03.01",
          "02": "2025.03.02",
        },
      },
    });
  });
});
