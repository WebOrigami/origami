import * as trailingSlash from "../trailingSlash.js";
import SyncMap from "./SyncMap.js";

/**
 * Return a tree of years, months, and days from a start date to an end date.
 *
 * Both the start and end date can be provided in "YYYY-MM-DD", "YYYY-MM", or
 * "YYYY" format. If a start year is provided, but a month is not, then the
 * first month of the year will be used; if a start month is provided, but a day
 * is not, then the first day of that month will be used. Similar logic applies
 * to the end date, using the last month of the year or the last day of the
 * month.
 *
 * If a start date is omitted, today will be used, likewise for the end date.
 *
 * @typedef {string|undefined} CalendarOptionsDate
 * @typedef {( year: string, month: string, day: string ) => any} CalendarOptionsFn
 * @param {{ end?: CalendarOptionsDate, start?: CalendarOptionsDate, value: CalendarOptionsFn }} options
 * @returns {SyncMap}
 */
export default function calendarMap(options) {
  const start = dateParts(options.start);
  const end = dateParts(options.end);
  const valueFn = options.value;

  // Fill in the missing parts of the start and end dates.
  const today = new Date();

  if (start.day === undefined) {
    start.day = start.year ? 1 : today.getDate();
  }
  if (start.month === undefined) {
    start.month = start.year ? 1 : today.getMonth() + 1;
  }
  if (start.year === undefined) {
    start.year = today.getFullYear();
  }

  if (end.day === undefined) {
    end.day = end.month
      ? daysInMonth(end.year, end.month)
      : end.year
      ? 31 // Last day of December
      : today.getDate();
  }
  if (end.month === undefined) {
    end.month = end.year ? 12 : today.getMonth() + 1;
  }
  if (end.year === undefined) {
    end.year = today.getFullYear();
  }

  return yearsMap(start, end, valueFn);
}

function dateParts(date) {
  let year;
  let month;
  let day;
  if (typeof date === "string") {
    const parts = date.split("-");
    year = parts[0] ? parseInt(parts[0]) : undefined;
    month = parts[1] ? parseInt(parts[1]) : undefined;
    day = parts[2] ? parseInt(parts[2]) : undefined;
  }
  return { year, month, day };
}

function daysForMonthMap(year, month, start, end, valueFn) {
  return Object.assign(new SyncMap(), {
    get(day) {
      day = parseInt(trailingSlash.remove(day));
      return this.inRange(day)
        ? valueFn(year.toString(), twoDigits(month), twoDigits(day))
        : undefined;
    },

    inRange(day) {
      if (year === start.year && year === end.year) {
        if (month === start.month && month === end.month) {
          return day >= start.day && day <= end.day;
        } else if (month === start.month) {
          return day >= start.day;
        } else if (month === end.month) {
          return day <= end.day;
        } else {
          return true;
        }
      } else if (year === start.year) {
        if (month === start.month) {
          return day >= start.day;
        } else {
          return month > start.month;
        }
      } else if (year === end.year) {
        if (month === end.month) {
          return day <= end.day;
        } else {
          return month < end.month;
        }
      } else {
        return true;
      }
    },

    *keys() {
      const days = Array.from(
        { length: daysInMonth(year, month) },
        (_, i) => i + 1
      );
      yield* days
        .filter((day) => this.inRange(day))
        .map((day) => twoDigits(day));
    },
  });
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function monthsForYearMap(year, start, end, valueFn) {
  return Object.assign(new SyncMap(), {
    get(month) {
      month = parseInt(trailingSlash.remove(month));
      return this.inRange(month)
        ? daysForMonthMap(year, month, start, end, valueFn)
        : undefined;
    },

    inRange(month) {
      if (year === start.year && year === end.year) {
        return month >= start.month && month <= end.month;
      } else if (year === start.year) {
        return month >= start.month;
      } else if (year === end.year) {
        return month <= end.month;
      } else {
        return true;
      }
    },

    *keys() {
      const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      yield* months
        .filter((month) => this.inRange(month))
        .map((month) => twoDigits(month));
    },
  });
}

function twoDigits(number) {
  return number.toString().padStart(2, "0");
}

function yearsMap(start, end, valueFn) {
  return Object.assign(new SyncMap(), {
    get(year) {
      year = parseInt(trailingSlash.remove(year));
      return this.inRange(year)
        ? monthsForYearMap(year, start, end, valueFn)
        : undefined;
    },

    inRange(year) {
      return year >= start.year && year <= end.year;
    },

    *keys() {
      yield* Array.from(
        { length: end.year - start.year + 1 },
        (_, i) => start.year + i
      );
    },
  });
}
