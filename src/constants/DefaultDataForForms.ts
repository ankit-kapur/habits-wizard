import { Area } from "@/model/pojo/definitions/Area";
import CategoryTag from "@/model/pojo/main/CategoryTag";

export const defaultNewArea: Area = {
  title: "New Area",
  imageUrl: "https://cdn.vuetifyjs.com/images/cards/sunshine.jpg",
  color: "#8686D6",
  userId: "testuser",
  description:
    "late 16th century from medieval Latin eleemosynarius, from late Latin eleemosyna‘alms",
  categoryTags: [],
};

export const defaultNewCategory: CategoryTag = {
  id: "",
  title: "",
  icon: "",
  userId: "testuser",
};
