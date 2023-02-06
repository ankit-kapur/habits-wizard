export default interface Measurable {
  // Identifiers
  id: string;
  title: string;

  // Types
  dataType: string; // TODO: type = MeasurableType

  // TODO: Change to 'unitId'. Unit definition should exist in Area.
  // Note: Units are only used for display, not calculations.
  unit?: string;

  // Future fields
  // isRequired: boolean; // (when recording) default = false
}
