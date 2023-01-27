export default interface CategoryTag {
  // Identifiers
  id: string;

  // Display attributes
  title: string;
  icon?: string; // Maybe don't really need this. Too many icons.
  color?: string;
}
