import { OrderByDirection } from "firebase/firestore";

export class FirestoreConstants {
  // * ----------------- Collection names
  static readonly AREA_COLLECTION_NAME: string = "areas";
  static readonly ACTIVITIES_COLLECTION_NAME: string = "activities";
  static readonly CATEGORY_TAGS_COLLECTION_NAME: string = "categories";

  static readonly CREATED_AT_ATTRIBUTE: string = "createdAt";
  static readonly USER_ID_ATTRIBUTE: string = "userId";
  static readonly AREA_ID_ATTRIBUTE: string = "areaId";

  static readonly ASCENDING: OrderByDirection = "asc";
  static readonly DESCENDING: OrderByDirection = "desc";
}
