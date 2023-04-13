// Set on a specific Habit or Activity.
import { GoalMeasureCondition } from "../goal/GoalMeasureCondition";

// Note: no separate store for this. Lives inside Habit or Activity.
export default interface DayGoal {
  // Metadata
  setOnDate: string; // TODO: type = Date

  // IDs of Measurables that count towards this DayGoal
  goalMeasureCondition: GoalMeasureCondition[];

  // Whether AND or OR will be used for the evaluation.
  conditionalOperator: string; // TODO: type = ConditionalOperator
}
