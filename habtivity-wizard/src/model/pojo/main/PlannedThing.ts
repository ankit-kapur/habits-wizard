import CategoryTag from "../CategoryTag";

/* Q. Instead of having a separate store for this,
 * maybe dynamically generate it based on schedule in Thing?
 * A. No. Makes things too rigid, I can't adjust things just for a day when needed.
 */
// Purpose: To display scheduled things on calendar.
export default interface PlannedThing {
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

// Notes about Store:
// TODO: Store should disallow past PlannedThings to be updated.
// Store methods will convert to & from FIRESTORE's Timestamp
