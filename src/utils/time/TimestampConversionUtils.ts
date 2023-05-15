// eslint-disable-next-line @typescript-eslint/no-unused-vars
import moment, { duration } from "moment";

// Use Moment.js for everthing. https://momentjs.com/

export function getPrettyTimestamp(epochTimestamp?: number): string {
  if (!epochTimestamp) return "";
  const date: Date = new Date(epochTimestamp);

  return moment(date).fromNow();
}

/**
 * Gives the epoch number for the given date and time.
 *
 * @param dateGiven   YYYY-MM-DD format (ISO-8601)
 * @param timeGiven   HH:MM (24 hour format)
 */
export function convertToEpoch(dateGiven: string, timeGiven: string): number {
  console.log("Inside convertToEpoch");

  const dateTime = moment(dateGiven + " " + timeGiven, "YYYY-MM-DD HH:mm");
  console.log("dateTime = " + dateTime);

  const epoch = dateTime.valueOf();
  console.log("epoch = " + epoch);

  return epoch;
}

export function getDate_ISO8601(dateGiven: Date) {
  console.log("getDate_ISO8601 = " + dateGiven);
  return dateGiven ? moment(dateGiven).format("YYYY-MM-DD") : "";
}

export function getPrettyDate(dateGiven: string) {
  console.log("getPrettyDate = " + dateGiven);
  return dateGiven ? moment(dateGiven).format("ddd, MMMM DD") : "";
}

export function getPrettyDuration(durationInSeconds?: number): string {
  // TODO P1 --- maybe do this through Moment.js
  // duration();

  if (!durationInSeconds) return "";
  let result = "";

  if (durationInSeconds < 60) {
    result = durationInSeconds + " seconds";
  } else if (durationInSeconds > 60 && durationInSeconds < 60 * 60) {
    const minutes = durationInSeconds / 60;
    const seconds = durationInSeconds % 60;
    result = minutes + " minutes";
    if (seconds > 0) result += ", " + seconds + " seconds";
  } else {
    const hours = durationInSeconds / (60 * 60);
    const minutes = durationInSeconds % (60 * 60);
    result = hours + " hours";
    if (minutes > 0) result += ", " + minutes + " minutes";
  }

  return result;
}
