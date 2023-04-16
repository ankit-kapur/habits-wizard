import { DocumentReference, Firestore, doc } from "firebase/firestore";

/**
 * Makes a Firestore reference for the given doc ID
 * @param docID
 * @returns DocumentReference<T>
 */
export function getDocReference(
  docID: string,
  collectionName: string,
  firestoreDB: Firestore
): DocumentReference {
  return doc(firestoreDB, collectionName, docID);
}
