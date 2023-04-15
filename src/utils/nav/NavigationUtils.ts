import router from "@/router";
import { NavigationFailureType, isNavigationFailure } from "vue-router";

export function routerPush(destination: string) {
  router.push({ path: destination }).catch((error) => {
    if (!isNavigationFailure(error, NavigationFailureType.duplicated))
      throw error;
  });
}
