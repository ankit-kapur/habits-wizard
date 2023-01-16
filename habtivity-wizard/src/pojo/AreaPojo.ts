import Category from "./CategoryPojo";

// TODO: Make AreasStore with DICTIONARY of Areas.
export default interface Area {
  // Identifiers
  id: string;
  title: string;

  // TODO: Change to DICTIONARY. key = category ID
  categories: Category[];

  // Display attributes
  icon: string;
  color: string;
}
