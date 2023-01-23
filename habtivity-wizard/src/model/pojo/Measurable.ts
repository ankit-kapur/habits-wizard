import { ComparisonOperator } from "../enum/ComparisonOperator";

export default interface Measurable {
  // Identifiers
  id: string;
  title: string;

  // Types
  unit: string; // only used for display, not calculations.
  dataType: MeasurableType;

  // Goal-related
  dayGoalOperator: ComparisonOperator;
  dayGoalTargetValue: string;

  // Future fields
  // stretchGoalTargetValue: string;
  // isOptional: boolean; // when recording if this is required.
}

export enum MeasurableType {
  Boolean,
  Number,
  Duration, // Added by default for activities.
  Timestamp, // Added by default for ALL Things.
  // TODO: What else?
}
