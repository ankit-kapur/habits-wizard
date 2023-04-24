import { MeasurableType } from "@/model/enum/MeasurableType";

export default interface MeasurableDefinition {
  // ? --------------- Identification
  id: string;
  userId: string;

  // ? --------------- Type
  type: MeasurableType;

  // ? --------------- Display
  title: string;
  // Units are only used for display, not calculations.
  unitTitle: string;
  unitEmoji: string; // Default to 🔵 or something in the application.

  // ? --------------- Conversion to other Measurables
  // Key = measurableID, Value = Multiplier
  // For eg. pomodoro can be converted to durationInMinutes by dividing by 25.
  conversionRatios: Map<string, number>;
}
