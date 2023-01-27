export default interface Measurable {
  // Identifiers
  id: string;
  title: string;

  // Types
  dataType: string; // TODO: type = MeasurableType
  // only used for display, not calculations.
  // only relevant for Number types actually.
  unit?: string;

  // Future fields
  // isRequired: boolean; // (when recording) default = false
}
