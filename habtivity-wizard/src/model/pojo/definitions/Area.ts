export interface Area {
  // Identifiers
  id?: string;
  title: string;

  // Display attributes
  color: string;
  imageUrl: string;
  description?: string;

  // TODO --- Add timestamp attributes. Created on. Last modified on.

  // Allow-list of tags that can used in Things under this Area.
  categoryTags: string[];

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
