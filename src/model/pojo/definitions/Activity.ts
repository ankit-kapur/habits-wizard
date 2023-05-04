/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */

import { MeasurableType } from "@/model/enum/MeasurableType";
import MeasurableDefinition from "@/model/pojo/definitions/MeasurableDefinition";

// ? Find a solution for using ENUMS in pojo, without needed the "as Type" thing in .json
export default class Activity {
  // ? --------------- Identification
  id: string = "";
  userId: string = "";

  // ? --------------- Association
  areaId: string = "";
  categoryIDList: string[] = [];

  // ? --------------- Display
  title: string = "";
  icon: string = "";

  // ? --------------- Timestamps
  createdAt?: number;
  lastUpdatedAt?: number;

  // ? --------------- Measurables
  measurables: MeasurableForActivity[] = [];

  // ? --------------- Tracking
  hasTimeMeasurable? = (
    measurableDefinitions: MeasurableDefinition[]
  ): boolean => {
    return this.hasMeasurableType!(
      MeasurableType.Timestamp,
      measurableDefinitions
    );
  };

  hasDurationMeasurable? = (
    measurableDefinitions: MeasurableDefinition[]
  ): boolean => {
    return this.hasMeasurableType!(
      MeasurableType.Duration,
      measurableDefinitions
    );
  };

  // * --------------------- Private functions

  private hasMeasurableType? = (
    measurableType: MeasurableType,
    measurableDefinitions: MeasurableDefinition[]
  ): boolean => {
    const matches: MeasurableForActivity[] = this.measurables.filter((m) => {
      const def: MeasurableDefinition = this.getMeasurableDefinition!(
        m.measurableDefinitionId,
        measurableDefinitions
      );
      return def.type === measurableType;
    });
    return matches.length > 0;
  };

  private getMeasurableDefinition? = (
    measurableDefinitionId: string,
    measurableDefinitions: MeasurableDefinition[]
  ): MeasurableDefinition => {
    return measurableDefinitions.find((m) => m.id === measurableDefinitionId)!;
  };

  // ? --------------- Future fields
  // // typically just 1 per day. List for Things done multiple times a day.
  // weeklySchedule?: WeekSchedule;

  // // Goals
  // dayGoal?: DayGoal;
  // weekGoal?: WeekGoal | null;

  // // Archived
  // isArchived?: boolean | null; // should default to false
  // archivedDayGoals?: DayGoal[] | null; // Ordered by date.
  // archivedWeekGoals?: WeekGoal[] | null;

  // priority: Priority;
  // // defaultTags?: defaultTags[]; // Nah. Templates would work better.
}

export interface MeasurableForActivity {
  measurableDefinitionId: string;
  isRequired: boolean;
}
