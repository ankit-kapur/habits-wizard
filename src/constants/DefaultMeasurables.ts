import { MeasurableType } from "@/model/enum/MeasurableType";
import MeasurableDefinition from "@/model/pojo/definitions/MeasurableDefinition";

export const getDefaultMeasurables = [
  {
    id: "duration",
    title: "Duration",
    type: MeasurableType.Duration,
    baseUnitName: "minutes",
    baseUnitEmoji: ":timer_clock:", // ⏲️
    alternateUnits: [
      {
        title: "seconds",
        conversionFactor: 1 / 60,
        emoji: ":clock12:", // 🕛
      },
      {
        title: "hours",
        conversionFactor: 60,
        emoji: ":mantelpiece_clock:", // 🕰️
      },
      {
        title: "pomodoro",
        conversionFactor: 25,
        emoji: ":tomato:", // 🍅
      },
    ],
  },
  {
    id: "count",
    title: "Count",
    type: MeasurableType.Quantity,
    baseUnitName: "count",
    baseUnitEmoji: ":radio_button:", // 🔘
  },
  // ! ------ Start time should get recorded automatically when Duration is selected.
  // {
  //   id: "startTime",
  //   title: "Start Time",
  //   type: MeasurableType.Timestamp,
  //   baseUnitName: "",
  //   baseUnitEmoji: ":hourglass_flowing_sand:", // ⏳
  // },
  {
    id: "completionTime",
    title: "Done at Time",
    type: MeasurableType.Timestamp,
    baseUnitName: "",
    baseUnitEmoji: ":hourglass:", // ⌛️
  },
  {
    id: "isDone",
    title: "Completed",
    type: MeasurableType.Boolean,
    baseUnitName: "",
    baseUnitEmoji: ":ballot_box_with_check:", // ☑️
  },
];

export const defaultNewMeasurable: MeasurableDefinition = {
  id: "",
  title: "",
  type: MeasurableType.Boolean,
  baseUnitName: "",
  baseUnitEmoji: ":radio_button:",
};
