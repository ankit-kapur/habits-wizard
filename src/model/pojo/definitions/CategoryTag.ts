export default interface CategoryTag {
  // ? --------------- Identifiers
  id: string;

  // ? --------------- Association
  userId: string;

  // ? --------------- Display
  title: string;
  color: string;

  // ? --------------- Timestamps
  createdAt?: number;
  lastUpdatedAt?: number;
}
