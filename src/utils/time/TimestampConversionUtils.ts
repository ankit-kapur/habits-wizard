// eslint-disable-next-line @typescript-eslint/no-unused-vars
import moment, { duration } from "moment";

// Use Moment.js for everthing. https://momentjs.com/

export function getPrettyTimestamp(epochTimestamp?: number): string {
  if (!epochTimestamp) return "";
  const date: Date = new Date(epochTimestamp);

  return moment(date).fromNow();
}

/**
 * Extracts time.
 * @param epochTimestamp
 * @returns time  HH:MM (24 hour format)
 */
export function getTimeFromEpoch(epochTimestamp: number): string {
  return epochTimestamp ? moment(epochTimestamp).format("HH:mm") : "";
}

export function getDateFromEpoch_ISO8601(epochTimestamp?: number) {
  return epochTimestamp ? moment(epochTimestamp).format("YYYY-MM-DD") : "";
}

/**
 * Gives the epoch number for the given date and time.
 *
 * @param dateGiven   YYYY-MM-DD format (ISO-8601)
 * @param timeGiven   HH:MM (24 hour format)
 */
export function convertToEpoch(dateGiven: string, timeGiven: string): number {
  const dateTime = moment(dateGiven + " " + timeGiven, "YYYY-MM-DD HH:mm");
  return dateTime.valueOf(); // epoch
}
export function getPrettyShortDate(dateGiven: string): string {
  console.log("getPrettyDate = " + dateGiven);
  return dateGiven ? moment(dateGiven).format("ddd, MMMM DD") : "";
}

export function getDurationSince(startTime?: number): string {
  if (!startTime) return "";
  const startMoment = moment(startTime);
  const now = moment();
  const duration = moment.duration(now.diff(startMoment));
  return getPrettyDuration(duration.as("seconds"));
}

export function getPrettyDuration(durationInSeconds?: number): string {
  // TODO P1 --- maybe do this through Moment.js

  if (!durationInSeconds) return "";
  let result = "";

  if (durationInSeconds < 60) {
    result = durationInSeconds + " seconds";
  } else if (durationInSeconds > 60 && durationInSeconds < 60 * 60) {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.floor(durationInSeconds % 60);
    result = minutes + " minutes";
    if (seconds > 0) result += ", " + seconds + " seconds";
  } else {
    const hours = Math.floor(durationInSeconds / (60 * 60));
    const minutes = Math.floor(durationInSeconds % (60 * 60));
    result = hours + " hours";
    if (minutes > 0) result += ", " + minutes + " minutes";
  }

  return result;
}
