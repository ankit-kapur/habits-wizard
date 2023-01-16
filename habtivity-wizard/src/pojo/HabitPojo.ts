// TODO: Finalize whether I need separate structures for Habit & Activity.
// I don't think I do. Instead make a "ThingType" field that's either habit or activity.
// Some of the fields will be optional (eg. plannedEndTime) because they don't apply to habits.

// TODO: Rename to 'ScheduledActivity'. Separate structure for 'RecordedActivity'
export default interface Habit {
  // Identifiers
  id: string;
  title: string;

  // Association.
  areaId: string;
  categoryId: string;
  tags?: string[]; // TODO: Make POJO for Tag.
  // separate STORE? Should tags be global? by Area seems to make more sense.

  // Decoration // TODO: Remove both. Get them from Category (or Area?) instead.
  icon: string;
  color: string;

  // Plan
  // TODO: Maybe move to a separate PLANNED HABIT structure.
  plannedStartTime?: string; // Change to date format.
  plannedStartTimeeeee?: Date; // TODO: Deprecate the other one.
  plannedEndTime?: Date; // Store functions will convert to & from FIRESTORE's Timestamp
  plannedDurationInSeconds?: number;

  // Actual record
  status?: DayGoalStatus;
  scheduledActivityId?: string;

  actualStartTime?: Date;
  actualEndTime?: Date;
  durationInSeconds?: number;
}

// TODO: Move outside?
enum DayGoalStatus {
  // Planned. TODO: Remove if making separate structures for Planned vs Recorded.
  Scheduled,

  // Done.
  Success,
  Exceeded, // If a STRETCH goal has been set.

  // Failed
  Skipped,
  Partial,

  // not failed. streak should continue
  SickDay,
  Vacation,
}
