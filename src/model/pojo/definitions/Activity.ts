// ? Find a solution for using ENUMS in pojo, without needed the "as Type" thing in .json
export default interface Activity {
  // ? --------------- Identification
  id: string;
  userId: string;

  // ? --------------- Association
  areaId: string;
  categoryIDList: string[];

  // ? --------------- Display
  title: string;
  icon: string;

  // ? --------------- Timestamps
  createdAt?: number;
  lastUpdatedAt?: number;

  // ? --------------- Tracking
  // * Whether this is an Activity or a Task.
  //      If true, default measurables to be added: ---- startTime, endTime, duration.
  //      Else, default measurables to be added: ---- endTime (i.e. completed at time).
  hasTimeMeasurable: boolean;
  hasDurationMeasurable: boolean;

  // ? --------------- Measurables
  measurables: MeasurableForActivity[];

  // ? --------------- Future fields
  // // typically just 1 per day. List for Things done multiple times a day.
  // weeklySchedule?: WeekSchedule;

  // // Goals
  // dayGoal?: DayGoal;
  // weekGoal?: WeekGoal | null;

  // // Archived
  // isArchived?: boolean | null; // should default to false
  // archivedDayGoals?: DayGoal[] | null; // Ordered by date.
  // archivedWeekGoals?: WeekGoal[] | null;

  // priority: Priority;
  // // defaultTags?: defaultTags[]; // Nah. Templates would work better.
}

export interface MeasurableForActivity {
  measurableDefinitionId: string;
  isRequired: boolean;
}
