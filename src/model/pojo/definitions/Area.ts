export interface Area {
  // ? --------------- Identifiers
  id: string;
  userId: string;

  // ? --------------- Timestamps
  createdAt?: number;
  lastUpdatedAt?: number;

  // ? --------------- Display attributes
  title: string;
  color: string;
  imageUrl: string;
  description?: string;

  // ? ---- Removing links to Categories and Activities here. Don't need bi-directional links.
  // // Associated entities (only IDs here)
  // activities: string[];

  // ? --------------- Tags
  categoryTags: string[];
  // List of all tags used in Activities in this Area.
  tags?: string[];

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
