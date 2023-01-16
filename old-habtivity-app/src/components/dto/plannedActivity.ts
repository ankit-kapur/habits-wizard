import { Timestamp } from "firebase/firestore";

export class PlannedActivity {

    // TODO: Find a plugin to generate builder

    private plannedActivityId: string; // RecordedActivity document will link to this.

    // Identifiers
    private title: string;
    private areaId: string;
    private categoryId: string;
    private tags: string[];

    // Plan
    private plannedStartTime: Timestamp;
    private plannedEndTime: Timestamp;
    private durationInSeconds: number;

    // Outcomes of the plan. 
    //      TODO: Do I need these it if recordedActivity links to this table anyway? 
    //      If yes, is this the right place? 
    private dailyGoalStatus: string; // Success, Deferred, Failed, etc.
    private recordedActivityId: string;
}