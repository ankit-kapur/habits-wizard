import CategoryTag from "../definitions/CategoryTag";

export interface PlannedThing {
  // Identifiers
  id: string;
  title: string;

  // Association.
  thingId: string;
  categoryTags?: CategoryTag[]; // Dictionary instead? For lookups?

  // Planning
  // Initially, should get copied over from DaySchedule of Thing,
  // but can be overridden.
  plannedStartTime?: Date;
  plannedDurationInMinutes?: number;
}
