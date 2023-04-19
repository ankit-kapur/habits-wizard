import { ComparisonOperator } from "@/model/enum/ComparisonOperator";
import { ConditionalOperator } from "@/model/enum/ConditionalOperator";

// ! ------ Change Day & Weekly goals into generic structures.
//          to allow goals over longer periods.
//          For eg. burn 1000 cals per week ---- has no daily goal.

/**
 * Goal       = criteria for 1 time-period (i.e. smallest unit of time to measure)
 *                for eg. burn 1000 cals in a week, or
 *                for eg. do 30 mins cardio per day.
 * Challenge  = criteria for how many time-periods need to be successful.
 */

export interface WeekGoal {
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
