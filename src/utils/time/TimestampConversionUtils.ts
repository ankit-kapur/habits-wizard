import moment from "moment";

// Use Moment.js for everthing. https://momentjs.com/

export function getPrettyTimestamp(epochTimestamp?: number): string {
  if (!epochTimestamp) return "";
  const date: Date = new Date(epochTimestamp);

  return moment(date).fromNow();
}
