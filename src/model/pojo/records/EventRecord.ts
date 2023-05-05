import { EventState } from "@/model/enum/EventState";

export default interface EventRecord {
  // * ------------------------------ Identifiers
  id: string;
  userId: string;

  // * ------------------------------ Association
  activityId: string;
  // ? Note: area & category can be obtained from activity. but here for easier querying.
  categoryIDList: string[];
  areaId: string;

  /*
   * Tags are freeform and are not 'defined' anywhere.
   *      But we keep a set of tags used so far in the Area,
   *      for auto-completing in the EventRecord UI
   *      so on saving an EventRecord we also updated the tags set in the Area.
   */
  tags: string[];

  // * ------------------------------ Timestamps
  createdAt?: number;
  lastUpdatedAt?: number;

  // ? Start/end/duration --- These will be stored as Measurements too. But here for simplicity.
  startTime?: number;
  completionTime?: number;
  durationInSeconds?: number; // ? Calc based on pauses since startTime.

  breaksTaken?: BreakPeriod[];

  // ? ------------------------------ Completion markers
  // Error state happens when Activity is complete but required metadata is missing.
  eventState: EventState;
  // Whether all metadata needed has been provided
  isRecordComplete: boolean;

  // ? ----------------------------- Measurable values
  // Key = measurableDefinitionId, value = recorded value.
  // TODO: Does Map work in Firestore?
  // TODO: Should value be a number?
  metrics: Map<string, string>;
}

interface BreakPeriod {
  breakStartTime: number;
  breakEndTime: number;
}
