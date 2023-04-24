export default interface EventRecord {
  // ? ------------------------------ Identifiers
  id: string;
  userId: string;

  // ? ------------------------------ Association
  activityId: string;
  categoryId: string; // TODO P0 ------- Make this into a list. of tags.
  // ! ^^^^^ do this ASAP.
  areaId: string;

  /*
   * Tags are freeform and are not 'defined' anywhere.
   * But we keep a set of tags used so far in the Area,
   * for auto-completing in the EventRecord UI
   * so on saving an EventRecord we also updated the tags set in the Area.
   */
  tags: string[];

  // ? ------------------------------ Timestamps
  createdAt?: number;
  lastUpdatedAt?: number;

  // Start/end/duration --- These will be stored as Measurements too. But here for simplicity.
  startTime?: number;
  endTime?: number;
  durationInSeconds?: number; // Calc based on pauses since startTime.

  breaksTaken?: BreakPeriod[];

  // ? ------------------------------ Completion markers
  // TODO: Make enum: IN_PROGRESS, PAUSED, COMPLETED, ERROR
  // Error state happens when Activity is complete but required metadata is missing.
  eventState: string;
  // Whether all metadata needed has been provided
  recordCompletenessState: boolean;

  // ? ----------------------------- Measurements
  // ! -------- Should Measurements be a sub-collection?
  //         Will allow CGQ (collection group queries) to get all
  // measurements: Measurement[];

  // ----------------------- Future fields for planning
  //   isAdHoc: boolean;
  //   plannedThingId?: string; // if not adhoc, this is required.
}

interface BreakPeriod {
  breakStartTime: number;
  breakEndTime: number;
}
