import { ComparisonOperator } from "@/model/enum/ComparisonOperator";

export interface GoalMeasureCondition {
  measurableId: string;
  dayGoalOperator: string; // TODO: type = ComparisonOperator
  dayGoalTargetValue: string;

  // Future fields:
  // stretchGoalTargetValue: string;
}
