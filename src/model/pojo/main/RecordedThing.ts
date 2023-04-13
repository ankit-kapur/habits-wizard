export interface RecordedThing {
  // Identifiers
  id: string;
  title: string;

  // Association
  thingId: string;
  areaId: string;
  isAdHoc: boolean;
  plannedThingId?: string; // if not adhoc, this is required.

  // Measurements.
  // Key = measurableId, value = measured value
  measurements: Record<string, string>;
  dayGoalStatus: string; // TODO: type = DayGoalStatus

  // Metadata
  // Maybe don't really need it? DB might have these.
  recordCreationTime: string; // TODO: type = Date
  recordLastUpdateTime: string; // TODO: type = Date

  // Note: Removed these. They'll instead be default measurements.
  // startedAtTime?: Date;
  // durationInSeconds?: number;
}
