import DayGoalForThing from "../goal/DayGoalForThing";
import Measurable from "../Measurable";
import { WeekGoalForThing } from "../goal/WeekGoalForThing";

export default interface Thing {
  // Identification
  id: string;
  title: string;

  // Categorization
  areaId: string;
  type: string; // TODO: type = ThingType
  priority: number; // map to Priority enum in store.

  // Decoration
  icon: string;

  // TODO: Find a solution for using ENUMS in pojo,
  // without needed the "as Type" thing in .json

  // Tracking
  /**
   * Default measurables for Activities:
   * "StartTime" and "Duration" should get auto-added.
   * For Habits, there can only be 1 measurable,
   * and the user will define it.
   * */
  measurables: Measurable[];
  // typically just 1 per day. List for Things done multiple times a day.
  weeklySchedule?: WeekSchedule;
  // Goals
  dayGoal?: DayGoalForThing;
  weekGoal?: WeekGoalForThing | null;

  // Archived
  isArchived?: boolean | null; // should default to false
  archivedDayGoals?: DayGoalForThing[] | null; // Ordered by date.
  archivedWeekGoals?: WeekGoalForThing[] | null;

  // Future-fields
  // defaultTags?: defaultTags[]; // Templates are better.

  // Non-fields. Here for clarification only.
  // color?: string; // Get from Area instead.
}

// TODO: Move out?
export interface WeekSchedule {
  // Which days are on the schedule,
  // values for each day represent what time, and how long.
  dailyScheduleList: DaySchedule[];

  // Applies to all days in the map (unless overridden in the map)
  defaultDaySchedule: DaySchedule;
}

export interface DaySchedule {
  // Which day this is for.
  dayOfTheWeek: string; // TODO: type = DayOfTheWeek
  // Usually just 1 time slot.
  timeSlots?: TimeSlot[];
}

export interface TimeSlot {
  // Time-segment of the day.
  timeOfTheDay: string; // TODO: type = TimeOfTheDay
  // When exactly
  plannedStartTime?: string;
  // How long
  plannedDurationInMinutes?: number; // Activities only.
}
