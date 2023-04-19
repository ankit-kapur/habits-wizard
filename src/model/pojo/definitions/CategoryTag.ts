export default interface CategoryTag {
  // ? --------------- Identifiers
  id: string;

  // ? --------------- Association
  userId: string;

  /**
   * @deprecated
   */
  areaId?: string;

  // ? --------------- Display
  title: string;
  color?: string;

  /**
   * @deprecated
   */
  icon: string;

  // ? --------------- Timestamps
  createdAt?: number;
  lastUpdatedAt?: number;
}
