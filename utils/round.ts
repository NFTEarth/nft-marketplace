import dayjs, {Dayjs} from "dayjs";

const round = (num: number, percision = 4) =>
  Math.floor(num * Math.pow(10, percision)) / Math.pow(10, percision);

export const roundToWeek = (date: Dayjs) : Dayjs => {
  const aWeek = 7 * 24 * 60 * 60
  let timestamp = date.unix()
  timestamp = Math.round(Math.round(timestamp / aWeek) * aWeek)
  return dayjs(timestamp * 1000)
}

export default round;
