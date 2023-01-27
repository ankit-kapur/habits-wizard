export enum DayGoalStatus {
  // Planned. TODO: Remove if making separate structures for Planned vs Recorded.
  Scheduled,

  // Done.
  Success,
  Exceeded, // If a STRETCH goal has been set.

  // Failed
  Partial,
  Failed,

  // not failed. streak should continue
  Skipped,
  SickDay,
  Vacation,
}
