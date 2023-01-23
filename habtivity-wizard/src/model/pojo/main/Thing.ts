import { Priority } from "../../enum/Priority";
import { ThingType } from "../../enum/ThingType";
import { TimeOfTheDay } from "../../enum/TimeOfTheDay";
import DayGoalForThing from "../goal/DayGoalForThing";
import Measurable from "../Measurable";
import { DayOfTheWeek } from "../../enum/DayOfTheWeek";
import { WeekGoalForThing } from "../goal/WeekGoalForThing";

export default interface Thing {
  // Identification
  id: string;
  title: string;

  // Categorization
  areaId: string;
  type: ThingType;
  priority: Priority;

  // Decoration
  icon?: string;

  // Tracking
  // By default, these Measurables should get auto-added.
  //  - For Habits: Time
  //  - For Activities: StartTime and Duration.
  measurables: Map<string, Measurable>; // Key = measurableId
  // typically just 1 per day. List for Things done multiple times a day.
  weeklySchedule: Map<DayOfTheWeek, DaySchedule[]>;

  // Goals
  dayGoal?: DayGoalForThing;
  weekGoal?: WeekGoalForThing;
  // Archived goals. Ordered by date.
  archivedDayGoals?: DayGoalForThing[];
  archivedWeekGoals?: WeekGoalForThing[];

  // Misc
  isArchived: boolean;

  // Future-fields
  // defaultTags?: defaultTags[];

  // Non-fields. Here for clarification only.
  // color?: string; // Get from Area instead.
}

// TODO: Move out?
export interface DaySchedule {
  // Preferred time-segment of the day.
  timeOfTheDay: TimeOfTheDay;

  plannedStartTime?: Date;
  plannedDurationInMinutes?: number;
}
