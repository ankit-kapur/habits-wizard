export default interface UserProfile {
  // * --- Primary key
  // Comes from Google Auth. Use this as ID of the Firestore doc.
  userId: string;
}
