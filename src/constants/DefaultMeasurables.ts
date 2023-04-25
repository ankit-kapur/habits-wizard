import { MeasurableType } from "@/model/enum/MeasurableType";
import MeasurableDefinition from "@/model/pojo/definitions/MeasurableDefinition";

export const duration: MeasurableDefinition = {
  id: "duration",
  title: "Duration",
  type: MeasurableType.Duration,
  baseUnitName: "minutes",
  baseUnitEmoji: "⏳",
  alternateUnits: [
    {
      title: "seconds",
      conversionFactor: 1 / 60,
      emoji: "⏲️",
    },
    {
      title: "hours",
      conversionFactor: 60,
      emoji: "⏰",
    },
    {
      title: "pomodoro",
      conversionFactor: 25,
      emoji: "🍅",
    },
  ],
};

export const count: MeasurableDefinition = {
  id: "count",
  title: "Count",
  type: MeasurableType.Quantity,
  baseUnitName: "count",
  baseUnitEmoji: "🔵",
};

export const startTime: MeasurableDefinition = {
  id: "startTime",
  title: "Start Time",
  type: MeasurableType.Timestamp,
  baseUnitName: "",
  baseUnitEmoji: "⏱️",
};

export const endTime: MeasurableDefinition = {
  id: "endTime",
  title: "End Time",
  type: MeasurableType.Timestamp,
  baseUnitName: "",
  baseUnitEmoji: "⏱️",
};

export const isDone: MeasurableDefinition = {
  id: "isDone",
  title: "Completed",
  type: MeasurableType.Boolean,
  baseUnitName: "",
  baseUnitEmoji: "✓",
};

export const defaultNewMeasurable: MeasurableDefinition = {
  id: "",
  title: "",
  type: MeasurableType.Quantity,
  baseUnitName: "",
  baseUnitEmoji: "",
};
