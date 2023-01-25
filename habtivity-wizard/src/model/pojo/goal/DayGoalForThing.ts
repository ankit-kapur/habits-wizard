// Set on a specific Thing.
import { GoalMeasureCondition } from "./GoalMeasureCondition";

// Lives inside Thing, no separate store.
export default interface DayGoalForThing {
  // Metadata
  setOnDate: string; // TODO: type = Date

  // IDs of Measurables that count towards this DayGoal
  goalMeasureCondition: GoalMeasureCondition[];

  // Whether AND or OR will be used for the evaluation.
  conditionalOperator?: string; // TODO: type = ConditionalOperator
  // default to AND?
}
