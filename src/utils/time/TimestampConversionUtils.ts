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
  const seconds = Math.ceil(duration.as("seconds"));
  return getPrettyDuration(seconds);
}

/**
 * Duration in a readable form.
 *
 * @param durationInSec
 * @returns pretty duration, for eg. '3 hours, 59 minutes'
 */
export function getPrettyDuration(durationInSec?: number): string {
  // TODO P1 --- maybe do this through Moment.js

  if (!durationInSec) return "";
  let result = "";
  const minuteSeconds = 60;
  const hourSeconds = 60 * 60;
  const daySeconds = 24 * 60 * 60;

  if (durationInSec < 60) {
    result = durationInSec + " seconds";
  } else if (durationInSec >= 60 && durationInSec < hourSeconds) {
    // Minutes
    const minutes = Math.floor(durationInSec / minuteSeconds);
    const seconds = Math.floor(durationInSec % minuteSeconds);
    result = minutes + " minutes";
    if (seconds > 0) result += ", " + seconds + " seconds";
  } else if (durationInSec >= hourSeconds && durationInSec < daySeconds) {
    // Hours
    const hours = Math.floor(durationInSec / hourSeconds);
    const minutes = Math.floor((durationInSec % hourSeconds) / minuteSeconds);
    const seconds = Math.floor((durationInSec % hourSeconds) % minuteSeconds);
    result = hours + " hours";
    if (minutes > 0) result += ", " + minutes + " minutes";
    if (seconds > 0) result += ", " + seconds + " seconds";
  } else {
    // Days
    const days = Math.floor(durationInSec / daySeconds);
    const remainingSeconds = Math.floor(durationInSec % daySeconds);
    const hours = Math.floor(remainingSeconds / hourSeconds);
    const minutes = Math.floor((durationInSec % hourSeconds) / minuteSeconds);
    result = days + " days";
    if (hours > 0) result += ", " + hours + " hours";
    if (minutes > 0) result += ", " + minutes + " minutes";
  }

  return result;
}

export function addDuration(timeInEpoch: number, durationInSeconds: number) {
  return timeInEpoch + durationInSeconds * 1000;
}

export function subtractDuration(
  timeInEpoch: number,
  durationInSeconds: number
) {
  return timeInEpoch - durationInSeconds * 1000;
}

/**
 * Diff between two times.
 *
 * @param startTimeInEpoch
 * @param endTimeInEpoch
 * @returns diffInSeconds
 */
export function durationDiff(startTimeInEpoch: number, endTimeInEpoch: number) {
  const diffInSeconds: number = moment(startTimeInEpoch).diff(
    moment(endTimeInEpoch),
    "seconds"
  );
  return Math.abs(diffInSeconds);
}
