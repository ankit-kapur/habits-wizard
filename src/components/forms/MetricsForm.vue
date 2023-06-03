<script lang="ts">
import MeasurableDefinition from "@/model/pojo/definitions/MeasurableDefinition";
import { Component, Model, Prop, Vue } from "vue-property-decorator";
import { MeasurableType } from "@/model/enum/MeasurableType";
import MyEmoji from "@/components/chips/MyEmoji.vue";

@Component({
  components: {
    MyEmoji: MyEmoji,
  },
})
export default class MetricsForm extends Vue {
  // ------------------------------------------------ v-model
  @Model()
  metrics!: Map<string, string>;
  // ------------------------------------------------ Props
  @Prop()
  measurables!: MeasurableDefinition[];

  mounted() {
    console.log("Mounted MetricsForm");
  }

  // ------------------------------------------------ Data
  expandedMeasurables = new Set<string>();

  // ------------------------------------------------ Methods
  isBooleanType(measurable: MeasurableDefinition) {
    return measurable.type === MeasurableType.Boolean;
  }
  isQuantityType(measurable: MeasurableDefinition) {
    return measurable.type === MeasurableType.Quantity;
  }
  getDefaultValue(measurableType: MeasurableType): string {
    if (measurableType === MeasurableType.Boolean) return "false";
    else if (measurableType === MeasurableType.Quantity) return "0";
    else if (measurableType === MeasurableType.Duration) return "0";
    else return "";
  }

  // TODO: Updates are NOT REACTIVE.
  // Changes to this.metrics should cause parent to update.

  toggleExpand(measurable: MeasurableDefinition) {
    if (this.expandedMeasurables.has(measurable.id)) {
      this.expandedMeasurables.delete(measurable.id); // Hide
      this.metrics.delete(measurable.id);
    } else {
      this.expandedMeasurables.add(measurable.id); // Show
      this.metrics[measurable.id] = this.getDefaultValue(measurable.type);
    }
    // Force refresh
    this.expandedMeasurables = new Set(this.expandedMeasurables);
    // this.metrics = new Map(this.metrics);
  }
}
</script>

<template>
  <div>
    <!-- Loop -->
    <div
      v-for="measurable in measurables"
      :key="measurable.id"
      class="pl-4 pt-6 pa-0"
    >
      <!-- * ---------------------------------------- Boolean type -->
      <v-row v-if="isBooleanType(measurable)">
        <!-- Emoji -->
        <v-col cols="2" class="pa-0" @click="toggleExpand(measurable)">
          <MyEmoji
            :emojiString="measurable.baseUnitEmoji"
            emojiSize="20"
            class="pa-0"
          />
        </v-col>

        <!-- Title -->
        <v-col cols="4" @click="toggleExpand(measurable)" class="pa-0 pt-1">
          {{ measurable.title }}
        </v-col>

        <!-- Switch -->
        <v-slide-x-transition>
          <v-col
            cols="3"
            v-if="expandedMeasurables.has(measurable.id)"
            class="pa-0"
          >
            <v-switch
              v-model="metrics[measurable.id]"
              hide-details
              class="pa-0 ma-0 pt-1"
            />
          </v-col>
        </v-slide-x-transition>
      </v-row>

      <!-- * ---------------------------------------- Quantity type -->
      <v-row v-if="isQuantityType(measurable)">
        <!-- Emoji -->
        <v-col cols="2" @click="toggleExpand(measurable)" class="pa-0">
          <MyEmoji
            :emojiString="measurable.baseUnitEmoji"
            emojiSize="20"
            class="pa-0"
          />
        </v-col>

        <!-- Title -->
        <v-col cols="4" @click="toggleExpand(measurable)" class="pa-0 pt-1">
          {{ measurable.title }}
        </v-col>

        <!-- Number input -->
        <v-expand-transition>
          <v-col
            cols="2"
            v-if="expandedMeasurables.has(measurable.id)"
            class="pa-0"
          >
            <v-text-field
              v-model="metrics[measurable.id]"
              type="number"
              hide-details
              single-line
              style="text-align: center"
              class="pa-0 ma-0"
            />
          </v-col>
        </v-expand-transition>

        <!-- Unit name -->
        <v-slide-x-transition>
          <!-- <v-spacer /> -->
          <v-col
            cols="3"
            v-show="expandedMeasurables.has(measurable.id)"
            class="pa-0 pt-1 pl-2"
          >
            {{ measurable.baseUnitName }}
          </v-col>
        </v-slide-x-transition>
      </v-row>
    </div>
  </div>
</template>
