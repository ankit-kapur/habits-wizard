import { OrderByDirection } from "firebase/firestore";

export class FirestoreConstants {
  static readonly AREA_COLLECTION_NAME: string = "areas";
  static readonly CATEGORY_TAGS_COLLECTION_NAME: string = "categoryTags";
  static readonly CREATED_AT_ATTRIBUTE: string = "createdAt";

  static readonly ASCENDING: OrderByDirection = "asc";
  static readonly DESCENDING: OrderByDirection = "desc";
}
