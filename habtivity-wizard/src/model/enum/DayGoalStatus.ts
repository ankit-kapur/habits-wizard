export enum DayGoalStatus {
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
