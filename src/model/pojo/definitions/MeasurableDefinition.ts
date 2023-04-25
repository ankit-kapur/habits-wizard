import { MeasurableType } from "@/model/enum/MeasurableType";

export default interface MeasurableDefinition {
  // ? --------------- Identification
  id: string;

  // ? --------------- Type
  type: MeasurableType;

  // ? --------------- Display
  title: string;

  // ? --------------- Units
  baseUnitName: string;
  baseUnitEmoji: string; // Default to 🔵 or something in the application.

  alternateUnits?: Unit[];
}

export interface Unit {
  title: string;
  conversionFactor: number; // i.e. How many base-units make 1 of this unit.

  emoji?: string; // Optional
}
