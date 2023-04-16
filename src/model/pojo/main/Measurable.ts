import { MeasurableType } from "@/model/enum/MeasurableType";

export default interface Measurable {
  // Identifiers
  id: string;
  userId: string;

  // Display
  title: string;

  // Types
  type: MeasurableType;

  // Units are only used for display, not calculations.
  unitTitle: string;
  unitEmoji: string; // Default to 🔵 or something in the application.

  // -------------------------------- Future fields
  // isRequired: boolean; // (when recording) default = false
}
