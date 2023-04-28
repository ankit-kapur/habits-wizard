import { getDefaultMeasurables } from "@/constants/DefaultMeasurables";
import Activity from "@/model/pojo/definitions/Activity";
import { Area } from "@/model/pojo/definitions/Area";
import CategoryTag from "@/model/pojo/definitions/CategoryTag";

export function defaultNewArea(): Area {
  return {
    id: "",
    title: "New Area",
    imageUrl: "https://cdn.vuetifyjs.com/images/cards/sunshine.jpg",
    color: "#8686D6",
    userId: "",
    description:
      "late 16th century from medieval Latin eleemosynarius, from late Latin eleemosyna‘alms",
    categoryTags: [],
    measurableDefinitions: getDefaultMeasurables(),
  };
}

export const defaultNewCategory: CategoryTag = {
  id: "",
  title: "New Category",
  icon: "mdi-circle",
  userId: "",
  color: "",
};

export const defaultNewActivity: Activity = {
  id: "",
  userId: "",
  title: "",
  areaId: "",
  categoryId: "",
  icon: "mdi-square",
  hasTimeTracking: false,
  measurables: [],
};
