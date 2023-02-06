import { DaySchedule } from "../day/DaySchedule";

export interface WeekSchedule {
  // Which days are on the schedule,
  // values for each day represent what time, and how long.
  dailyScheduleList: DaySchedule[];

  // Applies to all days in the map (unless overridden in the map)
  defaultDaySchedule: DaySchedule;
}
