import { Activity } from "@/model/pojo/definitions/Activity";
import { Area } from "@/model/pojo/definitions/Area";
import CategoryTag from "@/model/pojo/definitions/CategoryTag";

export const defaultNewArea: Area = {
  title: "New Area",
  imageUrl: "https://cdn.vuetifyjs.com/images/cards/sunshine.jpg",
  color: "#8686D6",
  userId: "",
  description:
    "late 16th century from medieval Latin eleemosynarius, from late Latin eleemosyna‘alms",
  categoryTags: [],
  activities: [],
  habits: [],
};

export const defaultNewCategory: CategoryTag = {
  id: "",
  title: "",
  icon: "mdi-circle",
  userId: "",
};

export const defaultNewActivity: Activity = {
  id: "",
  userId: "",
  title: "",
  areaId: "",
  icon: "mdi-square",
  measurables: [],
};
