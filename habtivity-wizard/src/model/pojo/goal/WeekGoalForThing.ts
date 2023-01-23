import { ComparisonOperator } from "@/model/enum/ComparisonOperator";
import { ConditionalOperator } from "@/model/enum/ConditionalOperator";

export interface WeekGoalForThing {
  // Metadata
  setOnDate: Date;

  // Whether AND or OR will be used for the evaluation.
  conditionalOperator?: ConditionalOperator;

  // Criteria for evaluation.
  timeSpent?: TimeSpentGoal;
  numOfSuccessfulDays?: number;
  // Typically only one of these would be set.
  // But if multiple set, the operator is required.

  // Future fields:
  // Criteria on specific Measurables. for eg. burn 5k calories.
  // But that's a better fit for a Challenge.
}

export interface TimeSpentGoal {
  targetValueInMinutes: number;
  // May want to spend LESS time on a Thing
  operator: ComparisonOperator;
  // Future:
  // stretchTargetValue: number;
}
