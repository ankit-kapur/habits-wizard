import { getDefaultMeasurables } from "@/constants/DefaultMeasurables";
import { EventState } from "@/model/enum/EventState";
import Activity from "@/model/pojo/definitions/Activity";
import { Area } from "@/model/pojo/definitions/Area";
import CategoryTag from "@/model/pojo/definitions/CategoryTag";
import EventRecord from "@/model/pojo/records/EventRecord";

export const defaultNewArea: Area = {
  id: "",
  title: "New Area",
  imageUrl: "https://cdn.vuetifyjs.com/images/cards/sunshine.jpg",
  color: "#8686D6",
  userId: "",
  description:
    "late 16th century from medieval Latin eleemosynarius, from late Latin eleemosyna‘alms",
  categoryIDList: [],
  measurableDefinitions: getDefaultMeasurables,
  autoSetColorsFromImage: true,
  dominantColorInImage: "",
  colorPalette: [],
};

export const defaultNewCategory: CategoryTag = {
  id: "",
  title: "New Category",
  userId: "",
  color: "",
};

export const defaultNewActivity: Activity = {
  id: "",
  userId: "",
  title: "",
  areaId: "",
  categoryIDList: [],
  icon: "mdi-square",
  hasTimeTracking: false,
  measurables: [],
};

export const defaultNewEventRecord: EventRecord = {
  id: "",
  userId: "",
  activityId: "",
  categoryIDList: [],
  areaId: "",
  tags: [],
  eventState: EventState.NOT_STARTED,
  isRecordComplete: false,
};
