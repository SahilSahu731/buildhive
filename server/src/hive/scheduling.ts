import { CronExpressionParser } from "cron-parser";
export function nextSchedule(
  frequency: string,
  hour: number,
  timezone: string,
  now = new Date(),
) {
  const expression =
    frequency === "hourly"
      ? "0 * * * *"
      : frequency === "six-hourly"
        ? `0 ${hour % 6}-23/6 * * *`
        : `0 ${hour} * * *`;
  return CronExpressionParser.parse(expression, {
    tz: timezone,
    currentDate: now,
  })
    .next()
    .toDate();
}
