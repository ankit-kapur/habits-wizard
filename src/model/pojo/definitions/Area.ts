export interface Area {
  // Identifiers
  id?: string;
  userId: string;

  // Timestamps
  createdAt?: number;
  lastUpdatedAt?: number;

  // Display attributes
  title: string;
  color: string;
  imageUrl: string;
  description?: string;

  // TODO --- Add timestamp attributes. Created on. Last modified on.

  // Associated entities (only IDs here)
  categoryTags: string[];
  activities: string[];
  habits: string[];
  // TODO --- Habits

  // ------------------ Future attributes ------------------ //

  // Goals v/s Challenges.
  // 1st one is weekly. 2nd is for a short sprint like 2 weeks.

  // Goals: Maybe I don't need these.
  // Essential Things under this Area can show status of the Area.
  // weeklyGoals: WeeklyGoalForArea[];

  // Challenges
  // TODO Should Challenges live OUTSIDE Area?
  // activeChallenges?: Challenge[];
  // archivedChallenges: Challenge[];
  // completedChallenges: Challenge[];

  // priority?: number; // UI can allow drag & drop sorting of cards
}
