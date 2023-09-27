export const getPreviousWeek = (fromTimestamp: number) => {
  const weeksToGoBack = 1;
  const midnight = new Date(fromTimestamp);
  midnight.setUTCHours(0);
  midnight.setUTCMinutes(0);
  midnight.setUTCSeconds(0);
  midnight.setUTCMilliseconds(0);

  let daysSinceThursday = midnight.getUTCDay() - 4;
  if (daysSinceThursday < 0) daysSinceThursday += 7;

  daysSinceThursday = daysSinceThursday + weeksToGoBack * 7;

  return Math.floor(midnight.getTime() / 1000) - daysSinceThursday * 86400;
}