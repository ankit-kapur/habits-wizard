// Set on a specific Thing.

import { ConditionalOperator } from "@/model/enum/ConditionalOperator";

// Lives inside Thing, no separate store.
export default interface DayGoalForThing {
  // Metadata
  setOnDate: Date;

  // IDs of Measurables that count towards this DayGoal
  measurableIdList: string[];

  // Whether AND or OR will be used for the evaluation.
  conditionalOperator: ConditionalOperator;
}
