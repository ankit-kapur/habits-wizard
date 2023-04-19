export default interface CategoryTag {
  // Identifiers
  id: string;

  // Association
  userId: string;
  areaId?: string;

  // Display
  title: string;

  // TODO: Introduce
  color?: string;

  // TODO: Deprecate
  icon: string;
}
