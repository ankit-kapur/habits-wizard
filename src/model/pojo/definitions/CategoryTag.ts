export default interface CategoryTag {
  // Identifiers
  id: string;
  userId: string;

  // Display
  title: string;

  // TODO: Introduce
  color?: string;

  // TODO: Deprecate
  icon: string;
}
