import Measurable from "../main/Measurable";

export default interface UserProfile {
  // * --- Primary key
  // Comes from Google Auth. Use this as ID of the Firestore doc.
  userId: string;

  // * --- Measurables
  // Some measurables should be added automatically ---- startTime, endTime, duration.
  // (defer custom measurables to the future)
  measurables: Measurable[];
}
