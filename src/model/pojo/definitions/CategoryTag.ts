export default interface CategoryTag {
  // ? --------------- Identifiers
  id: string;

  // ? --------------- Association
  userId: string;
  areaId?: string;

  // ? --------------- Display
  title: string;
  color?: string;

  // TODO: Deprecate
  icon: string;

  // ? --------------- Timestamps
  createdAt?: number;
  lastUpdatedAt?: number;
}
