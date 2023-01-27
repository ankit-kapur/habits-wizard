import { DayOfTheWeek } from "@/model/enum/DayOfTheWeek";
import { PlannedThing } from "./PlannedThing";

/* Q. Instead of having a separate store for this,
 * maybe dynamically generate it based on schedule in Thing?
 * A. No. Makes things too rigid, I can't adjust things just for a day when needed.
 *    And can't have stats on how much I stuck to the plan for the week.
 */
// Purpose: To display scheduled things on calendar-view (day-view and week-view)
export default interface PlanForTheWeek {
  // Identifiers
  weekId: string; // year + week number. for eg. 2022-01
  weekStartDate: Date;
  title: string;

  // TODO: Better way to structure this? 7 separate fields for each DayOfTheWeek?
  plansByDay: Record<DayOfTheWeek, PlannedThing[]>;
}

// Notes about Store:
// - Store should disallow past PlannedThings to be updated.
// - Store methods will convert to & from Date <-> Firestore's Timestamp
