// ? Find a solution for using ENUMS in pojo, without needed the "as Type" thing in .json
export default interface Activity {
  // ? --------------- Identification
  id: string;
  userId: string;

  // ? --------------- Association
  areaId: string;
  categoryId: string;

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
  hasTimeTracking: boolean;

  // ? --------------- Measurables
  // ! -------- Need to keep track of what's required.
  // ! -------- Maybe make a new "Measurable" structure.
  measurables: string[]; // Only IDs here. Definitions live in Area.

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
