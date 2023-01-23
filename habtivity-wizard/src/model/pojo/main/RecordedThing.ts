import { DayGoalStatus } from "../../enum/DayGoalStatus";
import PlannedThing from "./PlannedThing";

export default interface RecordedThing extends PlannedThing {
  // Association
  isAdHoc: boolean;
  plannedThingId?: string; // if not adhoc, this is required.

  // Actual record
  // TODO: these could just be default Measurables.
  startedAtTime?: Date;
  durationInSeconds?: number;

  // Measurements.
  // Key = measurableId, value = measured value
  measurements: Map<string, string>;
  dayGoalStatus?: DayGoalStatus;

  // Metadata
  // Maybe don't really need it? DB might have these.
  recordCreationTime: Date;
  recordLastUpdateTime: Date;
}
