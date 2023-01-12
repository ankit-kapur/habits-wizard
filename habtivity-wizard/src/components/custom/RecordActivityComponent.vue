<template>
  <div style="display:block">

    <label>Activity title</label>
    <input
      type="text"
      :value="activityTitle"
      @input="$emit('update:activityTitle', $event.target.value)"
    />

    <label>Area</label>
    <input
      type="text"
      :value="area"
      @input="$emit('update:area', $event.target.value)"
    />
  </div>
</template>

<script>
export default {
  props: {
    activityTitle: String,
    area: String
  }
};
</script>
