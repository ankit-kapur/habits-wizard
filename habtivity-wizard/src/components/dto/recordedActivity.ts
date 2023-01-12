import { Timestamp } from "firebase/firestore";

// Documents from plannedActivities should get copied over to recordActivities, 
// once the day is over. if a plannedActivity was not recorded, store it as failed.

// TODO: Need to think about WHEN this should happen. What if app is not opened for a few days?
//       Maybe persist last-synced day, and only days after that get copied over.
export class RecordedActivity {
    
    // ID
    private recordedActivityId: string;

    // Identifiers. If not ad-hoc, copy-over from plannedActivity
    private title: string;
    private areaId: string;
    private categoryId: string;
    private tags: string[];
    // TODO: Maybe delete this. Should Habits live in a separate table?
    private eventType: string; // Activity or Habit.

    // Planning related
    private isAdhocActivity: boolean; // i.e. was planned or not
    private linkedPlannedActivityId: string; // null if adhoc

    // How it went
    private dailyGoalStatus: string; // Success, Skipped, Failed, SickDay, Vacation, etc.
    private actualStartTime: Timestamp;
    private actualEndTime: Timestamp;
    private durationInSeconds: number;
    
}