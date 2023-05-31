<script lang="ts">
import MeasurableDefinition from "@/model/pojo/definitions/MeasurableDefinition";
import { Component, Prop, Vue } from "vue-property-decorator";
import { MeasurableType } from "@/model/enum/MeasurableType";
import MyEmoji from "@/components/chips/MyEmoji.vue";

@Component({
  components: {
    MyEmoji: MyEmoji,
  },
})
export default class MetricsForm extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  metrics!: Map<string, string>;
  @Prop()
  measurables!: MeasurableDefinition[];
  @Prop()
  optionalMeasurables!: MeasurableDefinition[];

  /**
   <!-- 
        TODO P0: Connect Map<string, string> to fields 
        * Initially map will be EMPTY.
        * Boolean field should show "CLICK TO RECORD" if nothing in the map.
        * Quantity field should just be empty.
        * 
   -->
   */

  mounted() {
    console.log("Mounted MetricsForm");
  }

  // ------------------------------------------------ Data

  // ------------------------------------------------ Methods
  isBooleanType(measurable: MeasurableDefinition) {
    return measurable.type === MeasurableType.Boolean;
  }
  isQuantityType(measurable: MeasurableDefinition) {
    return measurable.type === MeasurableType.Quantity;
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
        <v-col cols="2" class="pa-0">
          <MyEmoji
            :emojiString="measurable.baseUnitEmoji"
            emojiSize="20"
            class="pa-0"
          />
        </v-col>

        <!-- Title -->
        <v-col cols="4" class="pa-0 pt-1"> {{ measurable.title }} </v-col>

        <!-- Switch -->
        <v-col cols="3" class="pa-0">
          <v-switch hide-details class="pa-0 ma-0 pt-1" />
        </v-col>
      </v-row>

      <!-- * ---------------------------------------- Quantity type -->
      <v-row v-if="isQuantityType(measurable)">
        <!-- Emoji -->
        <v-col cols="2" class="pa-0">
          <MyEmoji
            :emojiString="measurable.baseUnitEmoji"
            emojiSize="20"
            class="pa-0"
          />
        </v-col>

        <!-- Title -->
        <v-col cols="4" class="pa-0 pt-1"> {{ measurable.title }} </v-col>

        <!-- Number input -->
        <v-col cols="2" class="pa-0">
          <v-text-field type="number" single-line class="pa-0 ma-0" />
        </v-col>

        <!-- Unit name -->
        <!-- <v-spacer /> -->
        <v-col cols="3" class="pa-0 pt-1 pl-2">
          {{ measurable.baseUnitName }}
        </v-col>
      </v-row>
    </div>
  </div>
</template>
