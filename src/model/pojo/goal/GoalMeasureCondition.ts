// import { ComparisonOperator } from "@/model/enum/ComparisonOperator";

export interface GoalMeasureCondition {
  // What metric this goal is on.
  measurableId: string;

  dayGoalOperator: string; // TODO: type = ComparisonOperator
  dayGoalTargetValue: string;

  // Future fields:
  // stretchGoalTargetValue: string;
}
