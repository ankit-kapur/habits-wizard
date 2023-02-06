/* Parent of Habit & Activity.
 * Purpose: Just to avoid repitition of common properties of Habit & Activity classes.
 */

import DayGoal from "../day/DayGoal";
import Measurable from "../main/Measurable";
import { WeekGoal } from "../week/WeekGoal";
import { WeekSchedule } from "../week/WeekSchedule";

// TODO: Find a solution for using ENUMS in pojo,
// without needed the "as Type" thing in .json
export interface Habtivity {
  // Identification
  id: string;
  title: string;

  // Categorization
  areaId: string;
  priority: number; // map to Priority enum in store.

  // Decoration
  icon: string;

  // Tracking
  /**
   * Default measurables for Activities:
   * "StartTime" and "Duration" should get auto-added.
   * For Habits, there can only be 1 measurable,
   * and the user will define it.
   * */
  // TODO: Move to Area. Only IDs should be here.
  measurables: Measurable[];

  // typically just 1 per day. List for Things done multiple times a day.
  weeklySchedule?: WeekSchedule;

  // Goals
  dayGoal?: DayGoal;
  weekGoal?: WeekGoal | null;

  // Archived
  isArchived?: boolean | null; // should default to false
  archivedDayGoals?: DayGoal[] | null; // Ordered by date.
  archivedWeekGoals?: WeekGoal[] | null;

  // Future-fields
  // defaultTags?: defaultTags[]; // Templates are better.
}
