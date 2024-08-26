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
 * @param {string} [start] - Start date in "YYYY-MM-DD", "YYYY-MM", or "YYYY"
 * format
 * @param {string} [end] - End date in "YYYY-MM-DD", "YYYY-MM", or "YYYY" format
 */
export default function calendarTree(start, end) {
  const startParts = start?.split("-") ?? [];
  const endParts = end?.split("-") ?? [];

  const today = new Date();

  const startYear = startParts[0]
    ? parseInt(startParts[0])
    : today.getFullYear();
  const startMonth = startParts[1]
    ? parseInt(startParts[1])
    : startParts[0]
    ? 1
    : today.getMonth() + 1;
  const startDay = startParts[2]
    ? parseInt(startParts[2])
    : startParts[1]
    ? 1
    : today.getDate();

  const endYear = endParts[0] ? parseInt(endParts[0]) : today.getFullYear();
  const endMonth = endParts[1]
    ? parseInt(endParts[1])
    : endParts[0]
    ? 12
    : today.getMonth() + 1;
  const endDay = endParts[2]
    ? parseInt(endParts[2])
    : endParts[1]
    ? daysInMonth(endYear, endMonth)
    : today.getDate();

  let years = {};
  for (let year = startYear; year <= endYear; year++) {
    let months = new Map();
    const firstMonth = year === startYear ? startMonth : 1;
    const lastMonth = year === endYear ? endMonth : 12;
    for (let month = firstMonth; month <= lastMonth; month++) {
      const monthPadded = month.toString().padStart(2, "0");
      let days = new Map();
      const firstDay =
        year === startYear && month === startMonth ? startDay : 1;
      const lastDay =
        year === endYear && month === endMonth
          ? endDay
          : daysInMonth(year, month);
      for (let day = firstDay; day <= lastDay; day++) {
        const dayPadded = day.toString().padStart(2, "0");
        days.set(dayPadded, null);
      }
      months.set(monthPadded, days);
    }
    years[year] = months;
  }

  return years;
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}
