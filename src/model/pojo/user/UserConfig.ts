import Measurable from "../main/Measurable";

export default interface UserConfig {
  // Use this is ID of the Firestore doc.
  userId: string;

  // For Activities, 3 measurables should be added automatically ---- startTime, endTime, duration.
  // (defer custom measurables to the future)
  measurables: Measurable[];
}
