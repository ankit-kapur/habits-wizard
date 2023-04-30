import MeasurableDefinition from "./MeasurableDefinition";

export interface Area {
  // ? ------------------------------ Identifiers
  id: string;
  userId: string;

  // ? ------------------------------ Timestamps
  createdAt?: number;
  lastUpdatedAt?: number;

  // ? ------------------------------ Display attributes
  title: string;
  description?: string;
  // ----- (UX decision) Not sure if I need color.
  //       Avatar of the image works. But Calendar
  color: string;
  imageUrl: string;

  // Hex color codes.
  dominantColorInImage: string;
  colorPalette: string[];
  autoSetColorsFromImage: boolean;

  // * ---- Removing links to Categories and Activities here. Don't need bi-directional links.
  // // Associated entities (only IDs here)
  // activities: string[];

  // ? ------------------------------ Categories
  categoryIDList: string[];
  // List of all tags used in Activities in this Area.

  // ? ------------------------------ Tags
  // * ------ Note: Tags here are not definitions. EventRecords can be tagged instantly.
  //          Purpose of this list is to prompt the user when creating/editing a new EventRecord.
  tags?: string[];

  // ? ------------------------------ Measurables
  measurableDefinitions: MeasurableDefinition[];

  // ------------------ Future attributes ------------------ //

  // Goals v/s Challenges.
  // 1st one is weekly. 2nd is for a short sprint like 2 weeks.

  // Goals: Maybe I don't need these.
  // Essential Things under this Area can show status of the Area.
  // weeklyGoals: WeeklyGoalForArea[];

  // ------ Challenges
  // activeChallenges?: Challenge[];
  // archivedChallenges: Challenge[];
  // completedChallenges: Challenge[];

  // priority?: number; // UI can allow drag & drop sorting of cards
}
